import { prisma } from "@msk-forms/db";
import type { Client, Guild as DiscordGuild } from "discord.js";

/**
 * Resolve the guild icon URL, picking `gif` for animated icons (hash prefixed
 * with `a_`) so server icons animate instead of falling back to a static webp
 * frame. Returns null when the guild has no icon.
 */
function guildIconUrl(guild: DiscordGuild): string | null {
  if (!guild.icon) return null;
  const animated = guild.icon.startsWith("a_");
  return guild.iconURL({ extension: animated ? "gif" : "png", size: 128 });
}

/**
 * Link a Discord guild to its MSK Forms records. Mirrors the seed's shape:
 * the Discord guild owner becomes the MSK Forms owner (a `User` upserted by
 * their Discord id), the guild is upserted by `discordGuildId`, and the owner
 * is recorded as a `GuildMember` with the `owner` role — which is what makes
 * the guild show up in their dashboard. Returns the MSK Forms guild id.
 */
export async function syncGuild(guild: DiscordGuild): Promise<string> {
  // Resolve the Discord owner's profile for the User row (REST fetch, no
  // privileged intent). Fall back to a placeholder if they can't be fetched.
  let username = "owner";
  let avatar: string | null = null;
  try {
    const owner = await guild.fetchOwner();
    username = owner.user.username;
    avatar = owner.user.displayAvatarURL();
  } catch {
    // Owner left or is otherwise unreachable — keep the placeholder.
  }

  const owner = await prisma.user.upsert({
    where: { discordId: guild.ownerId },
    update: { username, avatar },
    create: { discordId: guild.ownerId, username, avatar },
  });

  const icon = guildIconUrl(guild);
  const row = await prisma.guild.upsert({
    where: { discordGuildId: guild.id },
    update: { name: guild.name, icon, ownerUserId: owner.id },
    create: {
      discordGuildId: guild.id,
      name: guild.name,
      icon,
      ownerUserId: owner.id,
    },
  });

  await prisma.guildMember.upsert({
    where: { guildId_userId: { guildId: row.id, userId: owner.id } },
    update: { role: "owner" },
    create: { guildId: row.id, userId: owner.id, role: "owner" },
  });

  return row.id;
}

/** Sync every guild in the client's cache (catches joins made while offline). */
export async function syncAllGuilds(client: Client): Promise<void> {
  const guilds = [...client.guilds.cache.values()];
  const results = await Promise.allSettled(guilds.map((g) => syncGuild(g)));
  const failed = results.filter((r) => r.status === "rejected").length;
  console.info(`[bot] Synced ${guilds.length - failed}/${guilds.length} guild(s).`);
}
