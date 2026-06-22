#!/usr/bin/env bash
#
# Sync verified guild custom domains from the database into an Apache config that
# mod_md uses to obtain/renew TLS certificates, then reload Apache. Idempotent:
# only writes + reloads when the generated config actually changes.
#
# Install as a systemd timer (see README.md) so new domains go live within a few
# minutes of being verified in the dashboard.
#
set -euo pipefail

ENV_FILE="${MSK_ENV_FILE:-/opt/msk-forms/.env}"
CONF="${MSK_DOMAINS_CONF:-/etc/apache2/conf-available/msk-forms-domains.conf}"
BACKEND="${MSK_BACKEND:-http://127.0.0.1:3008}"
REALTIME="${MSK_REALTIME:-ws://127.0.0.1:3009}"

# Pull DATABASE_URL out of the app's env file (strip optional surrounding quotes).
DATABASE_URL="$(grep -E '^DATABASE_URL=' "$ENV_FILE" | head -n1 | cut -d= -f2-)"
DATABASE_URL="${DATABASE_URL%\"}"; DATABASE_URL="${DATABASE_URL#\"}"
export PGCONNECT_TIMEOUT=5

# Verified custom domains only.
mapfile -t DOMAINS < <(psql "$DATABASE_URL" -tAc \
  "SELECT custom_domain FROM guilds WHERE custom_domain IS NOT NULL AND custom_domain_verified_at IS NOT NULL ORDER BY custom_domain")

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

{
  echo "# Managed by sync-custom-domains.sh — DO NOT EDIT BY HAND."
  echo "# Regenerated $(date -u +%FT%TZ)"
  echo
  # mod_md fetches/renews a certificate for each managed domain.
  for d in "${DOMAINS[@]}"; do
    [ -z "$d" ] && continue
    echo "MDomain $d"
  done
  echo
  # One TLS vhost per domain, proxying to the app. mod_md injects the cert for
  # the vhost whose ServerName matches a managed domain.
  for d in "${DOMAINS[@]}"; do
    [ -z "$d" ] && continue
    cat <<VHOST
<VirtualHost *:443>
  ServerName $d
  SSLEngine on
  ProxyPreserveHost On
  # Realtime websocket must be matched before the catch-all "/".
  ProxyPass /realtime $REALTIME/
  ProxyPassReverse /realtime $REALTIME/
  ProxyPass / $BACKEND/
  ProxyPassReverse / $BACKEND/
  # Next.js sets its own security headers via proxy.ts — strip Apache duplicates.
  Header always unset X-Frame-Options
  Header always unset X-Content-Type-Options
  Header always unset Referrer-Policy
  Header always unset Content-Security-Policy
  Header always unset Strict-Transport-Security
</VirtualHost>
VHOST
  done
} > "$TMP"

if cmp -s "$TMP" "$CONF" 2>/dev/null; then
  echo "No change (${#DOMAINS[@]} domain(s))."
  exit 0
fi

cp "$TMP" "$CONF"
a2enconf msk-forms-domains >/dev/null 2>&1 || true
if apache2ctl configtest; then
  systemctl reload apache2
  echo "Updated $CONF (${#DOMAINS[@]} domain(s)); reloaded Apache."
else
  echo "apache2ctl configtest failed — NOT reloading. Check $CONF." >&2
  exit 1
fi
