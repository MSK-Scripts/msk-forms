/**
 * Plan limits & feature matrix (concept §21). The effective plan is resolved
 * server-side (a guild can be Pro via `plan` or permanently via `grandfathered`);
 * these constants describe what each tier allows.
 */

/** Max number of forms a Free guild may have. Pro/Enterprise are unlimited. */
export const FREE_FORM_LIMIT = 3;

/** Features gated to Pro (and above). Free guilds get a notice instead. */
export const PRO_FEATURES = [
  "custom_domain",
  "custom_css",
  "webhooks",
  "automations",
] as const;
export type ProFeature = (typeof PRO_FEATURES)[number];
