import { cookies } from "next/headers";

import { dictionaries, type Dictionary, type Locale } from "./dictionaries";

export type { Dictionary, Locale } from "./dictionaries";

export const locales: Locale[] = ["en", "de", "hu"];
export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Current locale from the NEXT_LOCALE cookie (default en). */
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return locales.includes(value as Locale) ? (value as Locale) : defaultLocale;
}

/** Dictionary for the current locale. */
export async function getDict(): Promise<Dictionary> {
  return dictionaries[await getLocale()];
}
