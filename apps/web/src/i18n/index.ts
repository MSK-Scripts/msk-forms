import { cookies } from "next/headers";

import { dictionaries, type Dictionary, type Locale } from "./dictionaries";

export type { Dictionary, Locale } from "./dictionaries";

export const locales: Locale[] = ["en", "de", "hu", "fr", "es", "pt", "pl"];
export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

/**
 * Locale codes that read right-to-left. Add an RTL locale's code here (once its
 * dictionary exists) and the whole app flips: `<html dir>` plus every logical
 * spacing/positioning utility mirror automatically. Empty today — all shipped
 * locales are LTR — but the layout is built RTL-safe so a future locale just
 * works. Typed as `string[]` so the lookup isn't narrowed to always-false.
 */
export const RTL_LOCALES: readonly string[] = [];

/** Text direction for a locale: "rtl" for RTL locales, otherwise "ltr". */
export function getDirection(locale: Locale): "ltr" | "rtl" {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}

/** Current locale from the NEXT_LOCALE cookie (default en). */
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return locales.includes(value as Locale) ? (value as Locale) : defaultLocale;
}

/** Dictionary for the current locale. */
export async function getDict(): Promise<Dictionary> {
  return dictionaries[await getLocale()];
}
