import { logGuildActivitySafe, prisma } from "@msk-forms/db";
import { acceptedRoleIdsOf, parseBotConfig, parseFormSettings } from "@msk-forms/shared";
import { DiscordAPIError, type Client, type Guild } from "discord.js";

/**
 * Add roles the member doesn't already have, by Discord user id. Returns the
 * role IDs that were newly added (empty if the member already had them all, or
 * on error). Best-effort — never throws. Returning only the *new* roles lets
 * callers log a grant exactly once even though both the Accept button and the
 * outbox poller call into the acceptance path.
 */
export async function grantRoles(
  guild: Guild,
  discordUserId: string,
  roleIds: string[],
): Promise<string[]> {
  if (roleIds.length === 0) return [];
  try {
    const member = await guild.members.fetch(discordUserId);
    const missing = roleIds.filter((id) => !member.roles.cache.has(id));
    if (missing.length === 0) return [];
    await member.roles.add(missing);
    return missing;
  } catch (err) {
    const code = err instanceof DiscordAPIError ? ` (${err.code})` : "";
    console.error(`[bot] could not grant roles ${roleIds.join(",")}${code}:`, (err as Error).message);
    return [];
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
      guildId: true,
      user: { select: { discordId: true, username: true } },
      form: { select: { title: true, settings: true } },
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
    const added = await grantRoles(guild, discordId, roleIds);
    if (added.length > 0) {
      // Log only the newly-added roles → one entry per acceptance even though
      // the Accept button and the poller both reach this path.
      const names = added.map((id) => guild.roles.cache.get(id)?.name ?? id);
      await logGuildActivitySafe(submission.guildId, {
        action: "role_granted",
        actorName: "Bot",
        applicantName: submission.user?.username ?? "Applicant",
        formTitle: submission.form.title,
        submissionId,
        detail: names.join(", "),
      });
    }
  } catch (err) {
    console.error(`[bot] could not resolve guild for accepted role:`, (err as Error).message);
  }
}
