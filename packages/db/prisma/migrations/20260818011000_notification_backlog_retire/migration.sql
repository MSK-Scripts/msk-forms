-- Two corrections to 20260818003000_notification_retry_bounds.
--
-- 1. UTC skew. That migration backfilled next_attempt_at with CURRENT_TIMESTAMP,
--    which returns the session's *local* time. The database runs Europe/Berlin
--    while Prisma stores and reads these columns as UTC, so every existing row
--    landed two hours in the future and the poller stopped selecting them
--    entirely. Confirmed on production: TimeZone Europe/Berlin, next_attempt_at
--    00:18:40 local for a migration that ran at 22:18 UTC.
--
--    Rule for next time: a backfill of a Prisma DateTime uses
--    now() AT TIME ZONE 'utc', never CURRENT_TIMESTAMP or now().
--
--    The column DEFAULT is deliberately left alone. CURRENT_TIMESTAMP is what
--    Prisma emits for @default(now()), so changing it would show up as schema
--    drift on the next migrate dev, and Prisma supplies the value on every
--    insert anyway — the default is never reached in practice.
--
-- 2. The stale backlog. The retry bounds arrived to find 19 undeliverable
--    applicant DMs queued since 2026-07-03 (12 message, 7 status_change)
--    against a batch size of 25, so the outbox was six rows short of starving
--    every newer notification.
--
--    Simply making them due would have delivered six-week-old status
--    notifications to applicants who have long since moved on. Retire anything
--    older than a week unsent instead: the status page carries the current
--    state at any time, and a very late nudge is worse than none. Expressed as
--    an age rule rather than a list of ids so it reads as the policy it is.
UPDATE "notifications"
   SET "read_at"    = now() AT TIME ZONE 'utc',
       "last_error" = 'retired: stale outbox row (predates retry bounds)'
 WHERE "read_at" IS NULL
   AND "created_at" < (now() AT TIME ZONE 'utc') - interval '7 days';

-- Whatever is recent enough to still be worth sending becomes due immediately,
-- in the same UTC frame Prisma reads.
UPDATE "notifications"
   SET "next_attempt_at" = "created_at"
 WHERE "read_at" IS NULL;
