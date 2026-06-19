import de from "./locales/de.json" with { type: "json" };
import en from "./locales/en.json" with { type: "json" };

export const messages = { de, en } as const;
export type Locale = keyof typeof messages;
export const locales = Object.keys(messages) as Locale[];
export const defaultLocale: Locale = "de";
