/** Longest meta description a search result shows. */
export const META_DESCRIPTION_MAX = 155;

/**
 * Plain text for a meta description from text a guild wrote, which may carry
 * Markdown: marks removed, whitespace collapsed, cut at a word boundary with
 * an ellipsis when it runs past `max`. Empty input gives an empty string.
 */
export function metaExcerpt(text: string | null | undefined, max = META_DESCRIPTION_MAX): string {
  if (!text) return "";
  const plain = text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`#>~|]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}
