import { brandingSchema, type Branding } from "@msk-forms/shared";
import type { CSSProperties } from "react";

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
 * tokens (e.g. `--primary: 161 94% 30%`). Returns null for malformed input.
 */
export function hexToHslChannels(hex: string): string | null {
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!match) return null;
  const int = parseInt(match[1]!, 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;

  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Labels a customer accent can carry: white, or the near-black label of the
 * dark theme (#0e150e). The accent is the same in both themes, so its label
 * is chosen from the colour itself, not from the theme: the theme's own
 * `--primary-foreground` is white in light and dark in dark.
 */
const LABELS = [
  { hex: "#ffffff", channels: "0 0% 100%" },
  { hex: "#0e150e", channels: "120 20% 6.9%" },
] as const;

function luminance(hex: string): number {
  const int = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(int >> 16) & 255, (int >> 8) & 255, int & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** WCAG 2.2 contrast ratio of two `#rrggbb` colours. */
export function contrastRatio(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/**
 * The CSS variables a customer accent sets on a branded wrapper, as HSL
 * channels: the accent itself as `--primary` and `--ring`, and as
 * `--primary-foreground` whichever label reads better on it. Hover fill and
 * soft surface derive from `--primary` in globals.css. Null for malformed
 * input.
 */
export function brandVariables(hex: string): Record<string, string> | null {
  const channels = hexToHslChannels(hex);
  if (!channels) return null;
  const [white, dark] = LABELS.map((label) => contrastRatio(label.hex, hex));
  const label = white! >= dark! ? LABELS[0] : LABELS[1];
  return { "--primary": channels, "--primary-foreground": label.channels, "--ring": channels };
}

/**
 * Inline style that sets the guild's accent on a wrapper. Because CSS custom
 * properties cascade and every colour utility resolves them on the element
 * (`@theme inline` in globals.css), everything accent-coloured inside the
 * wrapper adopts the brand colour, no component edits.
 */
export function brandStyle(branding: Branding): CSSProperties | undefined {
  if (!branding.accentColor) return undefined;
  const vars = brandVariables(branding.accentColor);
  return vars ? (vars as CSSProperties) : undefined;
}
