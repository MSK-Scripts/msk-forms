-- Per-guild form categories. Forms reference a category optionally; deleting a
-- category leaves its forms uncategorized (SET NULL). Public hubs group live
-- forms by category.
CREATE TABLE "form_categories" (
  "id" UUID NOT NULL,
  "guild_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "form_categories_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "form_categories_guild_id_idx" ON "form_categories" ("guild_id");

ALTER TABLE "form_categories"
  ADD CONSTRAINT "form_categories_guild_id_fkey"
  FOREIGN KEY ("guild_id") REFERENCES "guilds" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Forms gain an optional category reference.
ALTER TABLE "forms" ADD COLUMN "category_id" UUID;

CREATE INDEX "forms_guild_id_category_id_idx" ON "forms" ("guild_id", "category_id");

ALTER TABLE "forms"
  ADD CONSTRAINT "forms_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "form_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
