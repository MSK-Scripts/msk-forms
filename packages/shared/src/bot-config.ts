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
  /** Channel that receives the guild activity log (every tracked event). */
  logChannelId: snowflake.optional(),
  /** Legacy single accepted role (still read for backward compatibility). */
  acceptedRoleId: snowflake.optional(),
  /** Roles granted to the applicant when a submission is accepted. */
  acceptedRoleIds: z.array(snowflake).max(20).optional(),
  /**
   * When set, the bot posts forms/embeds through a webhook using this display
   * name and the guild's branding logo as the avatar (per-guild appearance).
   * Empty/unset → posts as the bot itself.
   */
  postName: z.string().min(1).max(80).optional(),
});

export type BotConfig = z.infer<typeof botConfigSchema>;

/** Parse a stored Guild.botConfig JSON blob, falling back to empty config. */
export function parseBotConfig(json: unknown): BotConfig {
  const result = botConfigSchema.safeParse(json);
  return result.success ? result.data : {};
}
