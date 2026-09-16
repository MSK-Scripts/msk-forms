-- Audit-log webhooks: Discord webhooks that receive the guild's activity log,
-- filtered to the actions each one subscribed to. They live in the existing
-- webhooks table (kind = 'audit') and reuse its delivery outbox.
ALTER TABLE "webhooks" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'event';
ALTER TABLE "webhooks" ADD COLUMN "name" TEXT;

-- Every read filters on the kind now (event hooks and audit hooks are listed on
-- different pages and enqueued by different code paths).
DROP INDEX "webhooks_guild_id_idx";
CREATE INDEX "webhooks_guild_id_kind_idx" ON "webhooks" ("guild_id", "kind");
