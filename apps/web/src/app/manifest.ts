import type { MetadataRoute } from "next";

import { logoUrl, parseBranding } from "@/lib/branding";
import { getGuildByDomain, isPrimaryHostname, requestHostname } from "@/lib/custom-domain";

// MSK green (light --primary ≈ #4ea426) — used for the title bar / splash accent.
const THEME_COLOR = "#4ea426";
// Matches the light --background token so the splash screen doesn't flash.
const BACKGROUND_COLOR = "#f6f6f6";

const DEFAULT_ICONS = [
  { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
  { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
  { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
] satisfies NonNullable<MetadataRoute.Manifest["icons"]>;

/**
 * Web app manifest (PWA installability). Dynamic + host-aware: on a guild's
 * verified custom domain the installed app adopts that guild's name, accent and
 * logo, so it lands on the home screen as the guild's own app. Everywhere else
 * it's MSK Forms. Reading the host opts this route into per-request rendering.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const base: MetadataRoute.Manifest = {
    name: "MSK Forms",
    short_name: "MSK Forms",
    description:
      "Application forms with a live status loop — applicants track where they stand.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: THEME_COLOR,
    background_color: BACKGROUND_COLOR,
    icons: DEFAULT_ICONS,
  };

  const host = await requestHostname();
  if (!host || isPrimaryHostname(host)) return base;

  const guild = await getGuildByDomain(host);
  if (!guild) return base;

  const branding = parseBranding(guild.branding);
  const logo = logoUrl(guild.id, branding);

  return {
    ...base,
    name: guild.name,
    short_name: guild.name.slice(0, 24),
    description: `Apply and track your status — ${guild.name}`,
    ...(branding.accentColor ? { theme_color: branding.accentColor } : {}),
    // A guild logo (square-ish webp ≤512) covers both install sizes; keep our
    // maskable default so Android's adaptive icon still has a safe-zone source.
    icons: logo
      ? [
          { src: logo, sizes: "192x192 512x512", type: "image/webp", purpose: "any" },
          ...DEFAULT_ICONS.filter((i) => i.purpose === "maskable"),
        ]
      : DEFAULT_ICONS,
  };
}
