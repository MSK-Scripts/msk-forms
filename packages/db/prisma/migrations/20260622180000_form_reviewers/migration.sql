-- Per-form reviewer grants (§21 team management): a member can review a specific
-- form's submissions without being a guild-wide reviewer.

CREATE TABLE "form_reviewers" (
    "form_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_reviewers_pkey" PRIMARY KEY ("form_id", "user_id")
);

CREATE INDEX "form_reviewers_user_id_idx" ON "form_reviewers"("user_id");

ALTER TABLE "form_reviewers" ADD CONSTRAINT "form_reviewers_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "form_reviewers" ADD CONSTRAINT "form_reviewers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
