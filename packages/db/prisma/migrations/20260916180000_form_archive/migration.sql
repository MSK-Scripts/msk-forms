-- Archive instead of delete: forms get a soft-delete marker, and permanent
-- deletion becomes a separate right (owner always, admins only when allowed).
ALTER TABLE "forms" ADD COLUMN "archived_at" TIMESTAMP(3);
ALTER TABLE "forms" ADD COLUMN "archived_by" UUID;
ALTER TABLE "forms"
  ADD CONSTRAINT "forms_archived_by_fkey"
  FOREIGN KEY ("archived_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "forms_guild_id_archived_at_idx" ON "forms" ("guild_id", "archived_at");

ALTER TABLE "guilds" ADD COLUMN "admins_can_delete_forms" BOOLEAN NOT NULL DEFAULT false;

-- The old publication status "archived" meant the same thing but could not be
-- restored separately and did not hide anything. Move those forms into the new
-- archive. Stamped in UTC, like every timestamp Prisma writes (never
-- CURRENT_TIMESTAMP here: the server runs on Europe/Berlin). The enum value
-- stays, dropping a Postgres enum value would mean rebuilding the type.
UPDATE "forms"
SET "archived_at" = now() AT TIME ZONE 'utc',
    "status" = 'closed'
WHERE "status" = 'archived';
