-- Archive a submission: soft-hide it from the active list without deleting it.
ALTER TABLE "submissions" ADD COLUMN "archived_at" TIMESTAMP(3);

CREATE INDEX "submissions_guild_id_archived_at_idx" ON "submissions" ("guild_id", "archived_at");
