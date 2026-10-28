import type { Dictionary } from "@/i18n";
import { shopUrl } from "@/lib/shop-url";

/**
 * The navigation of the site header, after the shop's
 * components/layout/navigation.ts. MSK Forms presents itself as a section of
 * msk-scripts.de: its own pages first, then the shop's three product lines
 * and its about page, linked to the shop's addresses in the visitor's
 * language. MSK Forms sits in the shop's "Web tools" line, which is therefore
 * the current one here.
 *
 * One table, so the desktop navigation and the menu cannot drift apart.
 */

export interface NavLink {
  href: string;
  label: string;
  description?: string;
  /** Another site that opens in a new tab (Paste, Shortener). */
  external?: boolean;
  /** The area the visitor is in. */
  current?: boolean;
}

export interface ProductLine {
  id: "fivem" | "discord" | "tools";
  href: string;
  label: string;
  links: NavLink[];
  /** MSK Forms lies in this line. */
  current: boolean;
}

export const TOOL_URLS = {
  paste: "https://paste.msk-scripts.de/",
  shortener: "https://s.msk-scripts.de/",
} as const;

export function productLines(t: Dictionary["site"], locale: string): ProductLine[] {
  return [
    {
      id: "fivem",
      href: shopUrl(locale, "/fivem"),
      label: t.fivem,
      current: false,
      links: [
        { href: shopUrl(locale, "/fivem"), label: t.fivemPaid, description: t.fivemPaidDesc },
        { href: shopUrl(locale, "/fivem/free"), label: t.fivemFree, description: t.fivemFreeDesc },
        { href: shopUrl(locale, "/fivem/all-access"), label: t.fivemAllAccess, description: t.fivemAllAccessDesc },
        { href: shopUrl(locale, "/stats"), label: t.fivemStats, description: t.fivemStatsDesc },
      ],
    },
    {
      id: "discord",
      href: shopUrl(locale, "/discord"),
      label: t.discord,
      current: false,
      // Product names stay as they are in every language.
      links: [
        { href: shopUrl(locale, "/discord/ticket-bot"), label: "Ticket Bot", description: t.ticketDesc },
        { href: shopUrl(locale, "/discord/giveaway-bot"), label: "Giveaway Bot", description: t.giveawayDesc },
      ],
    },
    {
      id: "tools",
      href: shopUrl(locale, "/tools"),
      label: t.tools,
      current: true,
      links: [
        { href: shopUrl(locale, "/tools/images"), label: t.images, description: t.imagesDesc },
        { href: "/", label: "MSK Forms", description: t.formsDesc, current: true },
        { href: TOOL_URLS.paste, label: "MSK Paste", description: t.pasteDesc, external: true },
        { href: TOOL_URLS.shortener, label: "MSK Shortener", description: t.shortenerDesc, external: true },
      ],
    },
  ];
}

export function aboutLink(t: Dictionary["site"], locale: string): NavLink {
  return { href: shopUrl(locale, "/about"), label: t.about };
}

/** The pages of MSK Forms itself, ahead of the shop's lines. */
export function sectionLinks(dict: Dictionary): NavLink[] {
  return [
    { href: "/pricing", label: dict.pricing.nav },
    { href: "/stats", label: dict.stats.nav },
  ];
}
