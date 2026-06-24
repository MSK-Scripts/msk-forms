#!/usr/bin/env bash
#
# mod_md MDMessageCmd handler. mod_md invokes this as:
#
#     md-message.sh <reason> <domain>
#
# When a certificate has just been obtained or renewed, mod_md has staged it but
# Apache is still serving the previous (or fallback) certificate until the next
# reload. Reloading here activates the new certificate within seconds of issuance
# instead of waiting for mod_md's periodic maintenance cycle — which is the
# difference between a custom domain going live in ~10s versus a minute or more.
#
# Installed as /usr/local/sbin/msk-forms-md-message.sh and referenced from the
# mod_md base config: `MDMessageCmd /usr/local/sbin/msk-forms-md-message.sh`.
set -euo pipefail

REASON="${1:-}"
DOMAIN="${2:-}"

case "$REASON" in
  renewed|installed)
    logger -t msk-forms-md "cert $REASON for ${DOMAIN:-?} — reloading Apache"
    # Graceful reload: in-flight requests finish, new cert is picked up.
    systemctl reload apache2 || apache2ctl graceful
    ;;
  *)
    # errored, expiring, ocsp-* … nothing to do here; the timer/watchdog handles it.
    :
    ;;
esac
