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

/** Hard ceiling for guild custom CSS. */
export const MAX_CUSTOM_CSS = 10_000;

const customCss = z.string().max(MAX_CUSTOM_CSS).optional();

/**
 * Strip CSS constructs that could break out of the injected `<style>` tag or
 * pull in remote resources. Custom CSS is rendered into a same-page `<style>`
 * on the guild's own public pages, but we still neutralise: tag breakout
 * (`</style>`), remote `@import` (exfiltration), and the legacy IE
 * `expression()` / `javascript:` JS-in-CSS vectors. Idempotent.
 */
export function sanitizeCustomCss(css: string): string {
  return css
    .replace(/<\/?\s*style/gi, "")
    .replace(/@import[^;]*;?/gi, "")
    .replace(/expression\s*\(/gi, "")
    .replace(/javascript\s*:/gi, "")
    .slice(0, MAX_CUSTOM_CSS);
}

/** Stored branding shape (Guild.branding). `logoKey` is set server-side only. */
export const brandingSchema = z.object({
  accentColor,
  customCss,
  logoKey: z.string().max(512).optional(),
});

export type Branding = z.infer<typeof brandingSchema>;

/**
 * Input for the branding form (accent color + custom CSS). Deliberately excludes
 * `logoKey` so the endpoint can't be used to point the logo at an arbitrary
 * object — that's set server-side by the dedicated upload route.
 */
export const brandingColorSchema = z.object({ accentColor, customCss });
