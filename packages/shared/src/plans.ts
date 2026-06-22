/**
 * Plan tiers, limits & feature matrix (concept §21). The effective plan is
 * resolved server-side (a guild can be Pro/Enterprise via `plan`, or permanently
 * Pro via `grandfathered`); these constants describe what each tier allows.
 */

export type PlanTier = "free" | "pro" | "enterprise";

/** The paid tiers a guild can self-serve upgrade to. */
export const PAID_TIERS = ["pro", "enterprise"] as const;
export type PaidTier = (typeof PAID_TIERS)[number];

/** Max number of forms per tier (null = unlimited). */
export const FREE_FORM_LIMIT = 3;

/** Max submissions per calendar month per guild (null = unlimited). */
export const MONTHLY_SUBMISSION_LIMITS: Record<PlanTier, number | null> = {
  free: 100,
  pro: 5000,
  enterprise: null,
};

/** Features gated to Pro (and above). Free guilds get a notice instead. */
export const PRO_FEATURES = [
  "custom_domain",
  "custom_css",
  "webhooks",
  "automations",
] as const;
export type ProFeature = (typeof PRO_FEATURES)[number];
