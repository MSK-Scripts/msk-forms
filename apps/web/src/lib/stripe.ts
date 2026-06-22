import "server-only";

import Stripe from "stripe";

/**
 * Stripe billing is active only when configured: STRIPE_SECRET_KEY,
 * STRIPE_WEBHOOK_SECRET and STRIPE_PRICE_PRO. Without them the upgrade flow is
 * dormant (checkout endpoints return 503), so local dev and unconfigured
 * deployments keep working — same pattern as captcha/S3.
 */

let client: Stripe | null = null;

/** Lazily-built Stripe client, or null when no secret key is configured. */
export function stripe(): Stripe | null {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client = new Stripe(key);
  return client;
}

/** True when the full upgrade flow is configured (secret + price). */
export function stripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_PRO);
}

/** The configured Pro price id, or null. */
export function proPriceId(): string | null {
  return process.env.STRIPE_PRICE_PRO || null;
}

/** Webhook signing secret, or null. */
export function webhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET || null;
}
