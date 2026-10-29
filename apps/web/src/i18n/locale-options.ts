import type { Locale } from "./dictionaries";

/**
 * The language choices by their own names, in the order the switches show
 * them. Client-safe (index.ts reads cookies through next/headers), so the
 * header switcher and the dashboard kit share this one list.
 */
export const LOCALE_OPTIONS = [
  { value: "en", short: "EN", label: "English" },
  { value: "de", short: "DE", label: "Deutsch" },
  { value: "hu", short: "HU", label: "Magyar" },
  { value: "fr", short: "FR", label: "Français" },
  { value: "es", short: "ES", label: "Español" },
  { value: "pt", short: "PT", label: "Português" },
  { value: "pl", short: "PL", label: "Polski" },
] as const satisfies readonly { value: Locale; short: string; label: string }[];

/** The cookie getLocale() reads. Addresses carry no language in MSK Forms. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Remembers a language choice for a year. Refresh the page afterwards. */
export function writeLocaleCookie(locale: string): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}
