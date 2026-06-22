import "server-only";

import { prisma } from "@msk-forms/db";

export interface GuildPlan {
  plan: string;
  /** True for Pro/Enterprise or a permanently grandfathered guild. */
  isPro: boolean;
}

/**
 * Resolve a guild's effective plan. A guild is Pro when its plan is pro/
 * enterprise, or when it was grandfathered (existing guilds kept Pro for life).
 */
export async function getGuildPlan(guildId: string): Promise<GuildPlan> {
  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { plan: true, grandfathered: true },
  });
  const plan = guild?.plan ?? "free";
  const isPro = Boolean(guild) && (guild!.grandfathered || plan === "pro" || plan === "enterprise");
  return { plan, isPro };
}

/** Convenience: is this guild on a Pro (or better) plan? */
export async function isGuildPro(guildId: string): Promise<boolean> {
  return (await getGuildPlan(guildId)).isPro;
}
