-- Per-guild Cloudflare Turnstile (captcha) for forms served on a custom domain.
-- The secret column holds an AES-256-GCM ciphertext; the site key is public.
ALTER TABLE "guilds" ADD COLUMN "captcha_site_key" TEXT;
ALTER TABLE "guilds" ADD COLUMN "captcha_secret" TEXT;
