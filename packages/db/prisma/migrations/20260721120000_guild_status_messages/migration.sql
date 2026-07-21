-- Guild-wide automatic messages to the applicant per status, keyed by status key.
-- A per-form override lives in Form.settings.statusMessages (JSON, no column).
ALTER TABLE "guilds" ADD COLUMN "status_messages" JSONB NOT NULL DEFAULT '{}';
