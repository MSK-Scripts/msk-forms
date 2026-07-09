-- Per-form manage grant: upgrade a form_reviewers row from review-only to full
-- management of that single form (edit the form + handle its submissions).
ALTER TABLE "form_reviewers" ADD COLUMN "can_manage" BOOLEAN NOT NULL DEFAULT false;
