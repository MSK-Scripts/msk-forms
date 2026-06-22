import { prisma } from "@msk-forms/db";
import { parseBotConfig, parseFormSettings } from "@msk-forms/shared";
import { DiscordAPIError, type Client, type Guild } from "discord.js";

/** Add a role to a guild member by Discord user id. Best-effort — never throws. */
export async function grantRole(
  guild: Guild,
  discordUserId: string,
  roleId: string,
): Promise<void> {
  try {
    const member = await guild.members.fetch(discordUserId);
    await member.roles.add(roleId);
  } catch (err) {
    const code = err instanceof DiscordAPIError ? ` (${err.code})` : "";
    console.error(`[bot] could not grant role ${roleId}${code}:`, (err as Error).message);
  }
}

/**
 * Grant the applicant the "accepted" role for a submission, resolving the role
 * from the per-form setting (falling back to the guild's bot config). Used by
 * every acceptance path — the Accept button, web review, bulk actions and
 * automations — so they all behave the same. No-op for anonymous applicants or
 * when no role is configured. Best-effort.
 */
export async function grantAcceptedRole(client: Client, submissionId: string): Promise<void> {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: {
      user: { select: { discordId: true } },
      form: { select: { settings: true } },
      guild: { select: { discordGuildId: true, botConfig: true } },
    },
  });
  const discordId = submission?.user?.discordId;
  if (!submission || !discordId) return;

  const roleId =
    parseFormSettings(submission.form.settings).acceptedRoleId ??
    parseBotConfig(submission.guild.botConfig).acceptedRoleId;
  if (!roleId) return;

  try {
    const guild = await client.guilds.fetch(submission.guild.discordGuildId);
    await grantRole(guild, discordId, roleId);
  } catch (err) {
    console.error(`[bot] could not resolve guild for accepted role:`, (err as Error).message);
  }
}
