/**
 * Whether a fetched Discord channel lives in the guild a delivery belongs to.
 *
 * Channel ids in a form's settings or a guild's bot config are only checked to
 * be snowflakes when they are saved, and `client.channels.fetch` resolves any
 * channel the bot can see, on any server it was invited to. Without this check
 * a form manager could point the review channel at a server of their own and
 * receive the applicants' answers there. DM channels have no guild and never
 * qualify.
 */
export function isChannelInGuild(
  channel: object,
  discordGuildId: string | null | undefined,
): boolean {
  if (!discordGuildId) return false;
  return "guildId" in channel && channel.guildId === discordGuildId;
}
