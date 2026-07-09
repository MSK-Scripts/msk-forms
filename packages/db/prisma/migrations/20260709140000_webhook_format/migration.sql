-- Delivery format for a webhook: "json" (generic HMAC-signed POST) or "discord"
-- (a Discord channel webhook that receives a formatted embed, so submissions can
-- be logged into any Discord server).
ALTER TABLE "webhooks" ADD COLUMN "format" TEXT NOT NULL DEFAULT 'json';
