-- Two legal obligations that need a marker on the guild.
--
-- dpa_accepted_at: Art. 28 GDPR requires a written agreement between
-- controller and processor before the processing starts. A guild's forms
-- collect personal data from applicants, so the guild is the controller and we
-- process on its behalf. The dashboard asks for acceptance once, before the
-- first form can be created, and records when it happened.
--
-- order_confirmation_sub_id: § 312f BGB requires a confirmation of the
-- contract on a durable medium. Stripe sends a payment receipt, which is not
-- the same thing, so we send our own mail from the webhook. Stripe delivers
-- events more than once, and a mail cannot be made idempotent by writing the
-- same state twice, so the column is the send lock: it is claimed with the
-- subscription id before the mail goes out and released again if sending fails.

ALTER TABLE "guilds" ADD COLUMN "dpa_accepted_at" TIMESTAMP(3);
ALTER TABLE "guilds" ADD COLUMN "order_confirmation_sub_id" TEXT;
