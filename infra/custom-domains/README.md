# Custom domains (Apache mod_md) — server runbook

This sets up per-customer custom domains (e.g. `apply.theircommunity.com`) with
automatic Let's Encrypt certificates via Apache's `mod_md`. The app stores
verified domains; the `sync-custom-domains.sh` script turns them into Apache
config and reloads Apache; `mod_md` then issues/renews the certificates.

## How it works

```
Customer DNS                    This server (Apache)                 App (port 3008)
────────────                    ────────────────────                ───────────────
CNAME apply.x.com  ─────────▶   mod_md gets a cert via ACME    ─────▶  resolves the Host
   → forms.msk-scripts.de       per-domain :443 vhost proxies          header to the guild
TXT _msk-forms.apply.x.com      to 127.0.0.1:3008                      and serves its forms
   = msk-verify=<token>
```

1. The guild owner adds the **CNAME** + **TXT** records shown in the dashboard
   (Dashboard → Domain).
2. They click **Verify** — the app checks the TXT record, marks the domain
   verified, and **touches a trigger file** so the sync runs immediately.
3. A systemd `.path` unit sees the trigger and runs the sync within ~1s: it
   writes the Apache config, reloads, and `mod_md` obtains the certificate (ACME
   `http-01` on port 80). When the cert is installed, `MDMessageCmd` reloads
   Apache again so it goes live within seconds — no waiting for the next cycle.

> **Latency:** the periodic timer (every 3 min) is only a safety net. The normal
> path is event-driven (verify → trigger file → `.path` unit → sync), and the
> cert is activated the moment it's issued (`MDMessageCmd`). Verify-to-live is
> typically ~10–30s (the ACME round-trip), not minutes. Without the `.path` unit
> and `MDMessageCmd` a domain can show **503 + a fallback/foreign certificate**
> for up to several minutes while it waits for the timer and the next mod_md
> maintenance cycle.

## One-time server setup (run as root)

```bash
# 1. Modules
a2enmod md ssl proxy proxy_http proxy_wstunnel headers rewrite

# 2. mod_md base config + instant-activation hook
install -m 0755 /opt/msk-forms/infra/custom-domains/md-message.sh \
  /usr/local/sbin/msk-forms-md-message.sh
cat >/etc/apache2/conf-available/msk-forms-md.conf <<'EOF'
MDCertificateAgreement accepted
MDContactEmail admin@msk-scripts.de
# http-01 challenges are served on port 80 (keep 80 open in UFW).
MDChallengeDns01 off
# Keep certs across reloads; renew well before expiry.
MDRenewWindow 33%
# Reload Apache the instant a cert is obtained/renewed so the domain goes live
# in seconds instead of waiting for the next maintenance cycle.
MDMessageCmd /usr/local/sbin/msk-forms-md-message.sh
EOF
a2enconf msk-forms-md

# 3. Port-80 vhost: let mod_md answer ACME challenges, redirect everything else
#    to https. (mod_md intercepts /.well-known/acme-challenge automatically.)
cat >/etc/apache2/sites-available/msk-forms-acme.conf <<'EOF'
<VirtualHost *:80>
  ServerName forms.msk-scripts.de
  ServerAlias *
  RewriteEngine On
  # Don't redirect ACME challenge requests.
  RewriteCond %{REQUEST_URI} !^/\.well-known/acme-challenge/
  RewriteRule ^/(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]
</VirtualHost>
EOF
a2ensite msk-forms-acme

# 4. Install the sync script + systemd units (event-driven .path + safety-net timer).
install -m 0755 /opt/msk-forms/infra/custom-domains/sync-custom-domains.sh \
  /usr/local/sbin/sync-custom-domains.sh

# Trigger directory the app (user musiker15) writes to on verify/remove.
install -d -o musiker15 -g musiker15 /opt/msk-forms/var

cat >/etc/systemd/system/msk-forms-domains.service <<'EOF'
[Unit]
Description=Sync MSK Forms custom domains into Apache (mod_md)
After=postgresql.service apache2.service

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/sync-custom-domains.sh
EOF

# Event-driven: run the sync within ~1s of the app touching the trigger file.
install -m 0644 /opt/msk-forms/infra/custom-domains/msk-forms-domains.path \
  /etc/systemd/system/msk-forms-domains.path

cat >/etc/systemd/system/msk-forms-domains.timer <<'EOF'
[Unit]
Description=Periodically sync MSK Forms custom domains (safety net)

[Timer]
OnBootSec=2min
OnUnitActiveSec=3min
Unit=msk-forms-domains.service

[Install]
WantedBy=timers.target
EOF

systemctl daemon-reload
systemctl enable --now msk-forms-domains.path msk-forms-domains.timer

# 5. First run + reload
apache2ctl configtest && systemctl reload apache2
/usr/local/sbin/sync-custom-domains.sh
```

Requirements: `psql` available (it is, Postgres is local), UFW allows 80 + 443,
and `/opt/msk-forms/.env` contains `DATABASE_URL` (it does). The app writes the
trigger file at `/opt/msk-forms/var/domain-sync.request` (override with the
`DOMAIN_SYNC_TRIGGER` env var) — the directory must be writable by the app user
and watched by `msk-forms-domains.path` at the same location.

## What the script does

`sync-custom-domains.sh` reads verified domains
(`custom_domain_verified_at IS NOT NULL`) from the DB and writes
`/etc/apache2/conf-available/msk-forms-domains.conf`:

- one `MDomain <domain>` line per domain (so `mod_md` manages its cert), and
- one `<VirtualHost *:443>` per domain proxying to `127.0.0.1:3008` (and
  `/realtime` to the websocket on `127.0.0.1:3009`), with the duplicate Apache
  security headers stripped (Next.js sets them itself).

It only rewrites + `systemctl reload apache2` when the output changes, and runs
`apache2ctl configtest` before reloading.

It also runs automatically on each deploy is **not** required — the systemd
timer covers it — but you can trigger it manually any time:

```bash
/usr/local/sbin/sync-custom-domains.sh
```

## Verifying a domain went live

```bash
# mod_md state for a domain:
apache2ctl -M | grep md
curl -sI https://apply.theircommunity.com | head
# mod_md store:
ls /etc/apache2/md/domains/
```

## Notes

- The app already serves a custom domain's root (`/`) as that guild's branded
  form index and scopes `/f/<slug>` + `/s/<id>` to the owning guild (other
  guilds' slugs 404). No app change is needed per domain.
- Certificates renew automatically (`mod_md`, `MDRenewWindow 33%`).
- Removing a domain in the dashboard drops it from the DB; the next sync run
  removes its vhost and reloads. (The mod_md cert store entry can be pruned
  manually if desired.)
