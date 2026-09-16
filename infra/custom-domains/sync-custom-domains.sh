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
# sites-available, not conf-available: apache2.conf includes conf-enabled BEFORE
# sites-enabled, and the first <VirtualHost *:80> Apache sees becomes the default
# server for that port. With the blocks below in conf-enabled, the first customer
# domain took that role over from 000-default.conf, including its
# "Require all denied" and its ACME exception.
CONF="${MSK_DOMAINS_CONF:-/etc/apache2/sites-available/msk-forms-domains.conf}"
BACKEND="${MSK_BACKEND:-http://127.0.0.1:3008}"
REALTIME="${MSK_REALTIME:-ws://127.0.0.1:3009}"

# Pull DATABASE_URL out of the app's env file (strip optional surrounding quotes).
DATABASE_URL="$(grep -E '^DATABASE_URL=' "$ENV_FILE" | head -n1 | cut -d= -f2-)"
DATABASE_URL="${DATABASE_URL%\"}"; DATABASE_URL="${DATABASE_URL#\"}"
export PGCONNECT_TIMEOUT=5

# Prisma URLs carry a `?schema=` query param that libpq (psql) rejects. Extract
# the schema for search_path and drop the whole query string for the connection.
SCHEMA="$(printf '%s' "$DATABASE_URL" | sed -n 's/.*[?&]schema=\([^&]*\).*/\1/p')"
PSQL_URL="${DATABASE_URL%%\?*}"
export PGOPTIONS="-c search_path=${SCHEMA:-public}"

# Verified custom domains only. Abort on a query/connection error so a failed
# lookup can never write an empty config (which would drop every domain's vhost).
if ! DOMAINS_RAW="$(psql "$PSQL_URL" -tAc \
  "SELECT custom_domain FROM guilds WHERE custom_domain IS NOT NULL AND custom_domain_verified_at IS NOT NULL ORDER BY custom_domain")"; then
  echo "DB query failed — leaving Apache config unchanged." >&2
  exit 1
fi
mapfile -t RAW <<< "$DOMAINS_RAW"
DOMAINS=()
for d in "${RAW[@]}"; do [ -n "$d" ] && DOMAINS+=("$d"); done

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

{
  echo "# Managed by sync-custom-domains.sh — DO NOT EDIT BY HAND."
  # NOTE: never put a timestamp (or anything else that changes per run) in here.
  # The change detection below is a byte comparison against the installed config;
  # a per-run value makes every comparison differ, so every timer tick would copy
  # the file and reload Apache. Use the file's mtime to see when it last changed.
  echo
  # mod_md fetches/renews a certificate for each managed domain.
  for d in "${DOMAINS[@]}"; do
    [ -z "$d" ] && continue
    echo "MDomain $d"
  done
  echo
  # One plain-HTTP vhost per domain. Everything goes to HTTPS except the ACME
  # path: MDChallengeDns01 is off, so mod_md answers the http-01 challenge on
  # port 80 and a redirect there would break issuance and renewal.
  #
  # These blocks replace the former catch-all vhost (sites-available/
  # msk-forms-acme.conf). It matched every hostname on the machine through
  # `ServerAlias *` and therefore beat the :80 block of every vhost file sorting
  # after it, other projects included, which turned those blocks into dead code
  # without any visible sign. Do not bring it back.
  for d in "${DOMAINS[@]}"; do
    [ -z "$d" ] && continue
    cat <<VHOST80
<VirtualHost *:80>
  ServerName $d
  RewriteEngine On
  RewriteCond %{REQUEST_URI} !^/\.well-known/acme-challenge/
  RewriteRule ^ https://$d%{REQUEST_URI} [R=301,L]
</VirtualHost>
VHOST80
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
a2ensite msk-forms-domains.conf >/dev/null 2>&1 || true
if apache2ctl configtest; then
  systemctl reload apache2
  echo "Updated $CONF (${#DOMAINS[@]} domain(s)); reloaded Apache."
else
  echo "apache2ctl configtest failed — NOT reloading. Check $CONF." >&2
  exit 1
fi
