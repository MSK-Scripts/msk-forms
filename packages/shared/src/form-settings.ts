import { z } from "zod";

/**
 * Per-form settings stored in `Form.settings` (JSON). Currently a per-form
 * accepted role that overrides the guild-wide `botConfig.acceptedRoleId`.
 */
const snowflake = z.string().regex(/^\d{17,20}$/, "Enter a valid Discord ID.");

export const formSettingsSchema = z.object({
  /** Role granted on acceptance for THIS form (overrides the guild default). */
  acceptedRoleId: snowflake.optional(),
});

export type FormSettings = z.infer<typeof formSettingsSchema>;

/** Parse a stored Form.settings JSON blob, falling back to empty settings. */
export function parseFormSettings(json: unknown): FormSettings {
  const result = formSettingsSchema.safeParse(json);
  return result.success ? result.data : {};
}
