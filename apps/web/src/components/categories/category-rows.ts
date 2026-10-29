import type { CategoryInput } from "@msk-forms/shared";

/** The colour a newly added category starts with. */
export const NEW_CATEGORY_COLOR = "#4ea426";

export type CategoryRow = { uid: string; id?: string; name: string; color: string };

/** Form rows from stored categories. A category without a colour keeps an empty field. */
export const categoryRowsFrom = (categories: CategoryInput[]): CategoryRow[] =>
  categories.map((c, i) => ({
    uid: c.id ?? `saved-${i}`,
    id: c.id,
    name: c.name,
    color: c.color ?? "",
  }));

/**
 * The PUT body for `/api/guilds/[guildId]/categories`. An empty colour field
 * is saved as no colour: the public hub draws a dot only for a category that
 * has one, so a stand-in colour must never be stored.
 */
export const categoryPayload = (rows: CategoryRow[]): CategoryInput[] =>
  rows.map((r, i) => ({
    id: r.id,
    name: r.name.trim(),
    color: r.color.trim() || null,
    order: i,
  }));
