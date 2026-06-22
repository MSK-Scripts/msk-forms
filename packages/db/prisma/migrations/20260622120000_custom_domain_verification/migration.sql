-- Custom-domain verification (Slice 14): a DNS TXT challenge token and the
-- timestamp the domain was verified. Only verified domains are served TLS certs
-- by the server's mod_md sync.

ALTER TABLE "guilds" ADD COLUMN "custom_domain_token" TEXT;
ALTER TABLE "guilds" ADD COLUMN "custom_domain_verified_at" TIMESTAMP(3);
