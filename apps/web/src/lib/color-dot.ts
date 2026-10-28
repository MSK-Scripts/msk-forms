import { THEME_SURFACES, UI_CONTRAST, type Theme } from "./branding";
import { contrastRatio, hexToRgb, hslToRgb, rgbToHex, shiftLightness } from "./color";

// ── Readable colour dots ────────────────────────────────────────────────────
//
// A guild picks any colour for its statuses and categories, and the dashboard
// and the public pages show it as a dot beside the word. The word carries the
// meaning; the dot is a sign that goes with it, so it needs the 3:1 of WCAG
// 1.4.11 against what it sits on. One colour cannot reach that on both
// grounds (navy vanishes on anthracite, a pale yellow on white), so each theme
// gets the nearest variant of the same hue that does: darker in light,
// lighter in dark, as the accent fallback in lib/branding.ts does for text.

/** Kept above the threshold like the accent fallback, so 8-bit rounding cannot put a dot back below. */
const MARGIN = 0.1;

/**
 * Lowest contrast of a dot against the surfaces it sits on in a theme: the
 * ground, a card and the tile (board columns, notices, table heads).
 */
export function dotContrast(hex: string, theme: Theme): number {
  const { background, card, muted } = THEME_SURFACES[theme];
  return Math.min(contrastRatio(hex, background), contrastRatio(hex, card), contrastRatio(hex, muted));
}

/**
 * The dot a theme shows for a `#rrggbb` colour: the colour itself where it
 * reaches 3:1 on every surface of the theme, else the nearest variant of the
 * same hue and saturation that does.
 */
export function readableDot(hex: string, theme: Theme): string {
  if (dotContrast(hex, theme) >= UI_CONTRAST) return hex.toLowerCase();
  const hsl = shiftLightness(hex, (c) => dotContrast(c, theme), UI_CONTRAST, theme === "light" ? "darker" : "lighter", MARGIN);
  return rgbToHex(hslToRgb(hsl));
}

/** The two colours a dot is drawn in, as `ColorDot` and `SubmissionStatusBadge` take them. */
export interface DotColors {
  /** The light theme's dot. */
  color?: string;
  /** The dark theme's dot. */
  darkColor?: string;
}

/**
 * Both themes' dots for a guild's colour. Anything that is not a complete
 * `#rrggbb` (a hex code still being typed) is passed through as it is, and no
 * colour at all leaves the component's own default.
 */
export function dotColors(color: string | null | undefined): DotColors {
  if (!color) return {};
  const value = color.trim();
  if (!hexToRgb(value)) return { color: value, darkColor: value };
  return { color: readableDot(value, "light"), darkColor: readableDot(value, "dark") };
}
