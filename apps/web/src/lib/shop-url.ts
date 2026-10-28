// ── Addresses on msk-scripts.de ─────────────────────────────────────────────
//
// MSK Forms presents itself as a section of msk-scripts.de: the header
// carries the shop's navigation, the footer its legal and contract pages.
// The shop has a language in every address (/en/..., /de/...) and German
// words for its German pages; this table holds the pages MSK Forms links to,
// copied from the shop's route table (msk-shop lib/routes.ts). Old addresses
// would redirect there too, but a redirect per click is a wasted round trip.
//
// The shop speaks English and German only. MSK Forms has seven languages, so
// German goes to the German page and every other language to the English one.

export const SHOP_ORIGIN = "https://www.msk-scripts.de";

/** Internal path on the shop, with its German public form. */
const SHOP_ROUTES = {
  "/": "/",
  "/fivem": "/fivem",
  "/fivem/free": "/fivem/kostenlos",
  "/fivem/all-access": "/fivem/alle-scripts",
  "/stats": "/statistiken",
  "/discord": "/discord",
  "/discord/ticket-bot": "/discord/ticket-bot",
  "/discord/giveaway-bot": "/discord/giveaway-bot",
  "/tools": "/web-tools",
  "/tools/images": "/web-tools/bilder",
  "/about": "/ueber-msk",
  "/legal/terms": "/rechtliches/agb",
  "/legal/withdrawal": "/rechtliches/widerrufsbelehrung",
  "/legal/dpa": "/rechtliches/avv",
  "/withdraw-contract": "/vertrag-widerrufen",
  "/cancel-contract": "/vertrag-kuendigen",
  "/report": "/inhalt-melden",
} as const;

export type ShopPath = keyof typeof SHOP_ROUTES;

/** The shop's language for one of ours: German stays German, the rest is English. */
export function shopLang(locale: string): "de" | "en" {
  return locale === "de" ? "de" : "en";
}

/** Absolute address of a shop page in the visitor's language. */
export function shopUrl(locale: string, path: ShopPath): string {
  const lang = shopLang(locale);
  const rest = lang === "de" ? SHOP_ROUTES[path] : path;
  return `${SHOP_ORIGIN}/${lang}${rest === "/" ? "" : rest}`;
}
