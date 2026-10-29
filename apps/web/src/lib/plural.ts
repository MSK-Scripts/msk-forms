/**
 * A noun in the forms a count can need. `few` is the Polish 2 to 4 (also 22
 * to 24 and so on); languages without that form repeat `other` there.
 */
export type CountForms = { one: string; few: string; other: string };

/** The form of a noun that goes with `count` in `locale`, by the CLDR plural rules. */
export function countForm(count: number, locale: string, forms: CountForms): string {
  const category = new Intl.PluralRules(locale).select(count);
  if (category === "one") return forms.one;
  if (category === "few") return forms.few;
  return forms.other;
}
