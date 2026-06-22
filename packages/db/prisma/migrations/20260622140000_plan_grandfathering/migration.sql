-- Plan grandfathering (Slice 15): every guild that exists at this deploy gets
-- Pro permanently; guilds created afterwards keep the Free default. The
-- `grandfathered` flag marks the permanent grant so future billing never
-- downgrades these guilds.

ALTER TABLE "guilds" ADD COLUMN "grandfathered" BOOLEAN NOT NULL DEFAULT false;

-- Grandfather all existing guilds to Pro (one-off, runs once at deploy).
UPDATE "guilds" SET "plan" = 'pro', "grandfathered" = true;
