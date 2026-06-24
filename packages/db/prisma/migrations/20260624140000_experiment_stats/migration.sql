-- A/B test counters per form variant: views (assignments) and submissions
-- (conversions), one row per (form, variant).
CREATE TABLE "experiment_stats" (
  "id" UUID NOT NULL,
  "form_id" UUID NOT NULL,
  "variant_id" TEXT NOT NULL,
  "views" INTEGER NOT NULL DEFAULT 0,
  "submissions" INTEGER NOT NULL DEFAULT 0,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "experiment_stats_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "experiment_stats_form_id_variant_id_key"
  ON "experiment_stats" ("form_id", "variant_id");

ALTER TABLE "experiment_stats"
  ADD CONSTRAINT "experiment_stats_form_id_fkey"
  FOREIGN KEY ("form_id") REFERENCES "forms" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
