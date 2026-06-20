import { brandingSchema, type Branding } from "@msk-forms/shared";
import type { CSSProperties } from "react";

/** Parse a stored Guild.branding JSON blob, falling back to empty branding. */
export function parseBranding(json: unknown): Branding {
  const result = brandingSchema.safeParse(json);
  return result.success ? result.data : {};
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
 * Inline style that overrides the primary/ring tokens with the guild's accent
 * color. Because CSS custom properties cascade, every `bg-primary`/`text-primary`
 * element inside the styled wrapper adopts the brand color — no component edits.
 */
export function brandStyle(branding: Branding): CSSProperties | undefined {
  if (!branding.accentColor) return undefined;
  const channels = hexToHslChannels(branding.accentColor);
  if (!channels) return undefined;
  return { "--primary": channels, "--ring": channels } as Record<string, string> as CSSProperties;
}
