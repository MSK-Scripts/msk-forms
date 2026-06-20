-- Allow channel-targeted outbox notifications (e.g. the new-submission review
-- embed posted to a guild's review channel), not just user DMs.

-- A notification may now have no recipient user (it targets a guild channel).
ALTER TABLE "notifications" ALTER COLUMN "user_id" DROP NOT NULL;

-- Optional guild target.
ALTER TABLE "notifications" ADD COLUMN "guild_id" UUID;

-- Index for the bot's "unread for this guild" poll.
CREATE INDEX "notifications_guild_id_read_at_idx" ON "notifications"("guild_id", "read_at");

-- Foreign key to the guild (cascade on guild deletion).
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
