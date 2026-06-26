import de from "./locales/de.json" with { type: "json" };
import en from "./locales/en.json" with { type: "json" };
import es from "./locales/es.json" with { type: "json" };
import fr from "./locales/fr.json" with { type: "json" };
import hu from "./locales/hu.json" with { type: "json" };
import pl from "./locales/pl.json" with { type: "json" };
import pt from "./locales/pt.json" with { type: "json" };

export const messages = { de, en, hu, fr, es, pt, pl } as const;
export type Locale = keyof typeof messages;
export const locales = Object.keys(messages) as Locale[];
export const defaultLocale: Locale = "de";
