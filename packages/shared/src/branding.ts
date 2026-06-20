import { z } from "zod";

/**
 * Per-guild branding stored in `Guild.branding` (JSON). Applied to that guild's
 * public form and status pages. v1: an accent color (overrides the theme's
 * primary). Logo and more can extend this shape later.
 */
const accentColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #00E676.")
  .optional();

/** Stored branding shape (Guild.branding). `logoKey` is set server-side only. */
export const brandingSchema = z.object({
  accentColor,
  logoKey: z.string().max(512).optional(),
});

export type Branding = z.infer<typeof brandingSchema>;

/**
 * Input for the accent-color form. Deliberately excludes `logoKey` so the
 * color endpoint can't be used to point the logo at an arbitrary object.
 */
export const brandingColorSchema = z.object({ accentColor });
