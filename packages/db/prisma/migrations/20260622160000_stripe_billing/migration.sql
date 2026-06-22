-- Stripe billing (Slice 15): link a guild to its Stripe customer + subscription
-- so the webhook can map events back and store the active subscription.

ALTER TABLE "guilds" ADD COLUMN "stripe_customer_id" TEXT;
ALTER TABLE "guilds" ADD COLUMN "stripe_subscription_id" TEXT;

CREATE UNIQUE INDEX "guilds_stripe_customer_id_key" ON "guilds"("stripe_customer_id");
