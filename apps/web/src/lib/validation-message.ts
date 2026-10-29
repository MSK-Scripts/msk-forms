import { validationMessageKey } from "@msk-forms/shared";
import { z } from "zod";

import type { Dictionary, Locale } from "@/i18n";

const ZOD_LOCALES = {
  de: z.locales.de,
  hu: z.locales.hu,
  fr: z.locales.fr,
  es: z.locales.es,
  pt: z.locales.pt,
  pl: z.locales.pl,
} as const;

/**
 * One zod issue in the viewer's language. Our own schema messages come from
 * the dictionary, zod's built-in ones from zod's own locale. A wrong type is
 * the exception: a finished issue no longer carries the input, so zod would
 * name the received type "undefined"; the generic text is used instead.
 */
export function localizeIssue(
  issue: z.core.$ZodIssue,
  locale: Locale,
  t: Dictionary["validation"],
): string {
  const key = validationMessageKey(issue.message);
  if (key) return t[key];
  if (locale === "en") return issue.message;
  if (issue.code === "invalid_type") return t.invalidValue;
  const out = ZOD_LOCALES[locale]().localeError(issue as never);
  const message = typeof out === "string" ? out : out?.message;
  return message ?? t.invalidValue;
}
