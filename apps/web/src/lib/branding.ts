import { brandingSchema, type Branding } from "@msk-forms/shared";
import type { CSSProperties } from "react";

import {
  channelsToHex,
  contrastRatio,
  hexToRgb,
  hslChannels,
  mixOklab,
  rgbToHsl,
  shiftLightness,
  type Hsl,
} from "./color";

export { contrastRatio } from "./color";

/** Parse a stored Guild.branding JSON blob, falling back to empty branding. */
export function parseBranding(json: unknown): Branding {
  const result = brandingSchema.safeParse(json);
  return result.success ? result.data : {};
}

/**
 * Public URL for a guild's logo, or null if none. The `v` query busts the
 * browser cache when the logo changes (the served route looks up the key).
 */
export function logoUrl(guildId: string, branding: Branding): string | null {
  if (!branding.logoKey) return null;
  return `/api/guilds/${guildId}/logo?v=${branding.logoKey.slice(-8)}`;
}

/**
 * Convert `#rrggbb` to the `H S% L%` channel triplet used by the theme's HSL
 * tokens (e.g. `--primary: 125.3 50.3% 30.8%`), one decimal like the tokens
 * in globals.css. Returns null for malformed input.
 */
export function hexToHslChannels(hex: string): string | null {
  const rgb = hexToRgb(hex);
  return rgb ? hslChannels(rgbToHsl(rgb)) : null;
}

// ── Readable fallback accent ────────────────────────────────────────────────
//
// A customer's accent is one colour for both themes, and one colour cannot
// read well on both a near-white and a near-black ground: yellow vanishes as
// link text on white, navy on anthracite. Where the accent fails, that theme
// gets a variant of the same hue and saturation with its lightness moved until
// it passes: darker in light, lighter in dark.
//
// On the public pages `--primary` is link text and kicker as well as the fill
// of the main button, so the text threshold of WCAG 2.2 (4.5:1) decides; the
// 3:1 for fills and focus rings is met on the way. It is measured against
// every surface the accent sits on in that theme: the ground, a card and the
// accent's own soft surface (`accent-soft` in globals.css).

export type Theme = "light" | "dark";

/** WCAG 2.2 AA for text (1.4.3) and for UI components and focus (1.4.11). */
export const TEXT_CONTRAST = 4.5;
export const UI_CONTRAST = 3;

/**
 * A fallback is not searched to the edge of the threshold: 8-bit rounding and
 * the soft surface's mix would put it back below. DESIGN.md asks for about
 * 4.6:1 when a colour is chosen by computing.
 */
const MARGIN = 0.1;

/**
 * The surfaces of each theme, from the source tokens of globals.css
 * (`--background`, `--card`, `--muted`, `--accent-soft-amount`). The branding
 * test reads globals.css and fails when these drift.
 */
export const THEME_SURFACES: Record<Theme, { background: string; card: string; muted: string; softAmount: number }> = {
  light: { background: "#f6f6f4", card: "#ffffff", muted: "#ededea", softAmount: 0.07 },
  dark: { background: "#18191b", card: "#212225", muted: "#111214", softAmount: 0.1 },
};

/** Lowest contrast of an accent against the surfaces it sits on in a theme. */
export function accentContrast(hex: string, theme: Theme): number {
  const { background, card, softAmount } = THEME_SURFACES[theme];
  const soft = mixOklab(hex, background, softAmount);
  return Math.min(contrastRatio(hex, background), contrastRatio(hex, card), contrastRatio(hex, soft));
}

/**
 * The accent a theme shows: the customer's own colour where it reaches `min`
 * on every surface of the theme, else the nearest variant of the same hue and
 * saturation that does, with a small margin. Works on the one-decimal channel
 * triplet the page receives, so what is measured here is what is painted.
 */
export function readableAccent(hex: string, theme: Theme, min: number = TEXT_CONTRAST): Hsl {
  // Darker on the light ground, lighter on the dark one: each step only adds
  // contrast there.
  return shiftLightness(hex, (c) => accentContrast(c, theme), min, theme === "light" ? "darker" : "lighter", MARGIN);
}

/**
 * Labels an accent can carry: white, or the near-black label of the dark
 * theme (#0e150e). The accent differs from MSK green, so its label is chosen
 * from the colour itself, not from the theme.
 */
export const LABELS = [
  { hex: "#ffffff", channels: "0 0% 100%" },
  { hex: "#0e150e", channels: "120 20% 6.9%" },
] as const;

/** Whichever label reads better on `hex`; white on a tie. */
export function labelFor(hex: string): (typeof LABELS)[number] {
  return contrastRatio(LABELS[0].hex, hex) >= contrastRatio(LABELS[1].hex, hex) ? LABELS[0] : LABELS[1];
}

export interface AccentSet {
  /** HSL channels of the accent the theme shows. */
  accent: string;
  /** HSL channels of the label on it. */
  label: string;
  /** True when the customer's colour failed in this theme and was adjusted. */
  adjusted: boolean;
}

/** The accent and its label per theme, or null for malformed input. */
export function accentSets(hex: string): Record<Theme, AccentSet> | null {
  if (!hexToRgb(hex)) return null;
  const own = hexToHslChannels(hex)!;
  const set = (theme: Theme): AccentSet => {
    const accent = hslChannels(readableAccent(hex, theme));
    return { accent, label: labelFor(channelsToHex(accent)!).channels, adjusted: accent !== own };
  };
  return { light: set("light"), dark: set("dark") };
}

/**
 * The CSS variables a customer accent sets on a branded wrapper: the accent
 * and its label for each theme, as HSL channels. A rule in globals.css (and
 * its copy in the custom CSS preview) maps the set of the current theme onto
 * `--primary`, `--primary-foreground` and `--ring`. That rule sits in a
 * cascade layer, so a customer's own custom CSS, which is unlayered, wins
 * over it; setting `--primary` inline here would beat the custom CSS
 * instead. Hover fill and soft surface derive from `--primary`. Null for
 * malformed input.
 */
export function brandVariables(hex: string): Record<string, string> | null {
  const sets = accentSets(hex);
  if (!sets) return null;
  return {
    "--guild-accent-light": sets.light.accent,
    "--guild-accent-light-label": sets.light.label,
    "--guild-accent-dark": sets.dark.accent,
    "--guild-accent-dark-label": sets.dark.label,
  };
}

/** The data attribute the accent rule of globals.css selects on. */
export const GUILD_ACCENT_ATTRIBUTE = "data-guild-accent";

export interface BrandProps {
  style?: CSSProperties;
  [GUILD_ACCENT_ATTRIBUTE]?: "";
}

/**
 * Props that put the guild's accent on a wrapper: the variables above and the
 * attribute the rule selects on. Spread onto the element. Because custom
 * properties cascade and every colour utility resolves them on the element
 * (`@theme inline` in globals.css), everything accent-coloured inside takes
 * the brand colour, no component edits. Empty without an accent.
 */
export function brandProps(branding: Branding): BrandProps {
  if (!branding.accentColor) return {};
  const vars = brandVariables(branding.accentColor);
  return vars ? { style: vars as CSSProperties, [GUILD_ACCENT_ATTRIBUTE]: "" } : {};
}
