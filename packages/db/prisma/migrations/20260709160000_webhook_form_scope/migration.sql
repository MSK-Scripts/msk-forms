-- Optional per-form scope for a webhook: when form_id is set, the webhook only
-- fires for that form's events; NULL (default) means every form in the guild.
ALTER TABLE "webhooks" ADD COLUMN "form_id" UUID;

ALTER TABLE "webhooks"
  ADD CONSTRAINT "webhooks_form_id_fkey"
  FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "webhooks_form_id_idx" ON "webhooks" ("form_id");

-- Support the dashboard "latest delivery per webhook" lookup.
CREATE INDEX "webhook_deliveries_webhook_id_created_at_idx"
  ON "webhook_deliveries" ("webhook_id", "created_at" DESC);

