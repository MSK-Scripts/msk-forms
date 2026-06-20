-- The outbox poller scans for undelivered rows ordered by creation time:
--   WHERE read_at IS NULL ORDER BY created_at ASC
-- A partial index over just the unread rows keeps that scan cheap even as the
-- delivered-notification table grows. (Partial indexes aren't expressible in the
-- Prisma schema, so this is a hand-written migration.)
CREATE INDEX IF NOT EXISTS "notifications_pending_idx"
  ON "notifications" ("created_at")
  WHERE "read_at" IS NULL;
