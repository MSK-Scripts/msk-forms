import { prisma } from "@msk-forms/db";
import { acceptedRoleIdsOf, parseBotConfig, parseFormSettings } from "@msk-forms/shared";
import { DiscordAPIError, type Client, type Guild } from "discord.js";

/** Add one or more roles to a guild member by Discord user id. Best-effort — never throws. */
export async function grantRoles(
  guild: Guild,
  discordUserId: string,
  roleIds: string[],
): Promise<void> {
  if (roleIds.length === 0) return;
  try {
    const member = await guild.members.fetch(discordUserId);
    await member.roles.add(roleIds);
  } catch (err) {
    const code = err instanceof DiscordAPIError ? ` (${err.code})` : "";
    console.error(`[bot] could not grant roles ${roleIds.join(",")}${code}:`, (err as Error).message);
  }
}

/**
 * Grant the applicant the "accepted" role(s) for a submission, resolving them
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

  const formRoles = acceptedRoleIdsOf(parseFormSettings(submission.form.settings));
  const roleIds = formRoles.length > 0
    ? formRoles
    : acceptedRoleIdsOf(parseBotConfig(submission.guild.botConfig));
  if (roleIds.length === 0) return;

  try {
    const guild = await client.guilds.fetch(submission.guild.discordGuildId);
    await grantRoles(guild, discordId, roleIds);
  } catch (err) {
    console.error(`[bot] could not resolve guild for accepted role:`, (err as Error).message);
  }
}
