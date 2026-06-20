/** Pure URL builders for the public web app, shared across bot handlers. */

const trim = (base: string): string => base.replace(/\/+$/, "");

/** Public form link: `{base}/f/{slug}`. */
export function formUrl(base: string, slug: string): string {
  return `${trim(base)}/f/${slug}`;
}

/** Applicant status link: `{base}/s/{submissionId}`. */
export function statusUrl(base: string, submissionId: string): string {
  return `${trim(base)}/s/${submissionId}`;
}

/** Dashboard link, optionally scoped to a guild's forms tab. */
export function dashboardUrl(base: string, guildId?: string): string {
  return guildId ? `${trim(base)}/dashboard/${guildId}/forms` : `${trim(base)}/dashboard`;
}
