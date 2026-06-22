import "server-only";

import type { PaidTier } from "@msk-forms/shared";
import Stripe from "stripe";

/**
 * Stripe billing is active only when configured: STRIPE_SECRET_KEY,
 * STRIPE_WEBHOOK_SECRET and at least STRIPE_PRICE_PRO (STRIPE_PRICE_ENTERPRISE
 * is optional — the Enterprise tier appears only when it's set). Without them the
 * upgrade flow is dormant (checkout endpoints 503) — same pattern as captcha/S3.
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

/** True when the upgrade flow is configured (secret + the Pro price). */
export function stripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_PRO);
}

/** The configured Pro price id, or null. */
export function proPriceId(): string | null {
  return process.env.STRIPE_PRICE_PRO || null;
}

/** The configured Enterprise price id, or null when no Enterprise tier is sold. */
export function enterprisePriceId(): string | null {
  return process.env.STRIPE_PRICE_ENTERPRISE || null;
}

/** True when the Enterprise tier is offered (its price is configured). */
export function enterpriseEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ENTERPRISE);
}

/** The Stripe price id for a paid tier, or null when not configured. */
export function priceForTier(tier: PaidTier): string | null {
  return tier === "enterprise" ? enterprisePriceId() : proPriceId();
}

/** Map a Stripe price id back to its plan tier (defaults to "pro"). */
export function tierForPrice(priceId: string | null | undefined): PaidTier {
  if (priceId && priceId === enterprisePriceId()) return "enterprise";
  return "pro";
}

/** Webhook signing secret, or null. */
export function webhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET || null;
}
