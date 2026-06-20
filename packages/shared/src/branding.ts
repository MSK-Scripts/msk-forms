import { z } from "zod";

/**
 * Per-guild branding stored in `Guild.branding` (JSON). Applied to that guild's
 * public form and status pages. v1: an accent color (overrides the theme's
 * primary). Logo and more can extend this shape later.
 */
export const brandingSchema = z.object({
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex color like #00E676.")
    .optional(),
});

export type Branding = z.infer<typeof brandingSchema>;
