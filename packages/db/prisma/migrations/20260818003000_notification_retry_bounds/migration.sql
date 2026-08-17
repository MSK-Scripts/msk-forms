-- Bound the outbox retry loop.
--
-- Until now a notification that failed to deliver was simply left unread and
-- picked up again on the next 15s tick, forever. Discord returns 50278 ("no
-- mutual guilds") for applicants who left the server, and the bot only treated
-- 50007 as permanent, so those rows never retired. Because the poller takes a
-- fixed batch ordered by age, enough of them at the head of the queue would
-- have starved every newer notification.
ALTER TABLE "notifications"
  ADD COLUMN "attempts"        INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN "last_error"      TEXT,
  ADD COLUMN "next_attempt_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- The poller now scans:
--   WHERE read_at IS NULL AND next_attempt_at <= now() ORDER BY created_at ASC
-- so the pending partial index gains the new column. It supersedes
-- notifications_pending_idx from 20260620180000, which is dropped rather than
-- kept alongside: two partial indexes over the same rows would both have to be
-- maintained on every insert into a hot table. (Partial indexes aren't
-- expressible in the Prisma schema, hence the hand-written migration.)
CREATE INDEX IF NOT EXISTS "notifications_due_idx"
  ON "notifications" ("next_attempt_at", "created_at")
  WHERE "read_at" IS NULL;

DROP INDEX IF EXISTS "notifications_pending_idx";
