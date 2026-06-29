-- Vanity hub handle on the primary domain: forms.msk-scripts.de/<handle>.
ALTER TABLE "guilds" ADD COLUMN "handle" TEXT;

CREATE UNIQUE INDEX "guilds_handle_key" ON "guilds" ("handle");
