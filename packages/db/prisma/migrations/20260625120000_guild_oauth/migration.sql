-- Per-guild Discord OAuth credentials (for login on a guild's own custom domain).
-- The client secret column holds an AES-256-GCM ciphertext, never plaintext.
ALTER TABLE "guilds" ADD COLUMN "oauth_client_id" TEXT;
ALTER TABLE "guilds" ADD COLUMN "oauth_client_secret" TEXT;
