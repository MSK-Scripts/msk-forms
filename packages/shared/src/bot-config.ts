import { z } from "zod";

/**
 * Per-guild bot configuration stored in `Guild.botConfig` (JSON). Drives the
 * Discord review workflow: where new submissions are announced and which role
 * is granted on acceptance.
 */
const snowflake = z.string().regex(/^\d{17,20}$/, "Enter a valid Discord ID.");

export const botConfigSchema = z.object({
  /** Channel that receives the "new submission" review embed. */
  reviewChannelId: snowflake.optional(),
  /** Role granted to the applicant when a submission is accepted. */
  acceptedRoleId: snowflake.optional(),
});

export type BotConfig = z.infer<typeof botConfigSchema>;

/** Parse a stored Guild.botConfig JSON blob, falling back to empty config. */
export function parseBotConfig(json: unknown): BotConfig {
  const result = botConfigSchema.safeParse(json);
  return result.success ? result.data : {};
}
