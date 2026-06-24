-- Track who manages each webhook so the dashboard can distinguish hooks added by
-- hand from those created by an integration (Zapier/Make) via the REST-Hook API.
ALTER TABLE "webhooks" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'manual';
