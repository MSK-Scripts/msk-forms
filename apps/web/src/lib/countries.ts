/**
 * Country dial codes for the phone field. `code` is the ISO 3166-1 alpha-2
 * code; the flag emoji is derived from it at render time. `dial` is the
 * international calling code (digits only, no `+`).
 */
export interface Country {
  code: string;
  name: string;
  dial: string;
}

/** Curated list of common countries (German communities first, then A–Z). */
export const COUNTRIES: Country[] = [
  { code: "DE", name: "Germany", dial: "49" },
  { code: "AT", name: "Austria", dial: "43" },
  { code: "CH", name: "Switzerland", dial: "41" },
  { code: "AU", name: "Australia", dial: "61" },
  { code: "BE", name: "Belgium", dial: "32" },
  { code: "BR", name: "Brazil", dial: "55" },
  { code: "BG", name: "Bulgaria", dial: "359" },
  { code: "CA", name: "Canada", dial: "1" },
  { code: "HR", name: "Croatia", dial: "385" },
  { code: "CZ", name: "Czechia", dial: "420" },
  { code: "DK", name: "Denmark", dial: "45" },
  { code: "EE", name: "Estonia", dial: "372" },
  { code: "FI", name: "Finland", dial: "358" },
  { code: "FR", name: "France", dial: "33" },
  { code: "GR", name: "Greece", dial: "30" },
  { code: "HU", name: "Hungary", dial: "36" },
  { code: "IS", name: "Iceland", dial: "354" },
  { code: "IE", name: "Ireland", dial: "353" },
  { code: "IT", name: "Italy", dial: "39" },
  { code: "JP", name: "Japan", dial: "81" },
  { code: "LV", name: "Latvia", dial: "371" },
  { code: "LI", name: "Liechtenstein", dial: "423" },
  { code: "LT", name: "Lithuania", dial: "370" },
  { code: "LU", name: "Luxembourg", dial: "352" },
  { code: "MT", name: "Malta", dial: "356" },
  { code: "MX", name: "Mexico", dial: "52" },
  { code: "NL", name: "Netherlands", dial: "31" },
  { code: "NZ", name: "New Zealand", dial: "64" },
  { code: "NO", name: "Norway", dial: "47" },
  { code: "PL", name: "Poland", dial: "48" },
  { code: "PT", name: "Portugal", dial: "351" },
  { code: "RO", name: "Romania", dial: "40" },
  { code: "RS", name: "Serbia", dial: "381" },
  { code: "SK", name: "Slovakia", dial: "421" },
  { code: "SI", name: "Slovenia", dial: "386" },
  { code: "ES", name: "Spain", dial: "34" },
  { code: "SE", name: "Sweden", dial: "46" },
  { code: "TR", name: "Türkiye", dial: "90" },
  { code: "UA", name: "Ukraine", dial: "380" },
  { code: "GB", name: "United Kingdom", dial: "44" },
  { code: "US", name: "United States", dial: "1" },
];

/** Default country when none is parsed from the value. */
export const DEFAULT_COUNTRY = COUNTRIES[0]!;

/** Regional-indicator flag emoji for an ISO alpha-2 code (e.g. "DE" → 🇩🇪). */
export function flagOf(code: string): string {
  return code
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

/**
 * Parse a stored phone value (`+<dial> <number>`) back into a country code and
 * the local number. Falls back to the default country. When several countries
 * share a dial code (e.g. +1), the longest matching dial wins, then list order.
 */
export function parsePhone(value: string | undefined): { code: string; number: string } {
  const raw = (value ?? "").trim();
  if (!raw) return { code: DEFAULT_COUNTRY.code, number: "" };

  const digits = raw.replace(/[^\d]/g, "");
  if (raw.startsWith("+")) {
    const byDialLength = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
    const match = byDialLength.find((c) => digits.startsWith(c.dial));
    if (match) return { code: match.code, number: digits.slice(match.dial.length) };
  }
  return { code: DEFAULT_COUNTRY.code, number: digits };
}

/** Build the stored phone value from a dial code and a local number. */
export function formatPhone(dial: string, number: string): string {
  const digits = number.replace(/[^\d]/g, "");
  return digits ? `+${dial} ${digits}` : "";
}
