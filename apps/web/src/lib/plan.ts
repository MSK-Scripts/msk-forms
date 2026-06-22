import "server-only";

import { prisma } from "@msk-forms/db";
import { MONTHLY_SUBMISSION_LIMITS, type PlanTier } from "@msk-forms/shared";

export interface GuildPlan {
  /** Effective tier (grandfathered guilds resolve to at least "pro"). */
  tier: PlanTier;
  /** True for Pro/Enterprise (or a grandfathered guild). */
  isPro: boolean;
  /** Submissions allowed per calendar month, or null for unlimited. */
  monthlySubmissionLimit: number | null;
}

/**
 * Resolve a guild's effective plan. A guild is at least Pro when its plan is
 * pro/enterprise, or when it was grandfathered (existing guilds kept Pro for life).
 */
export async function getGuildPlan(guildId: string): Promise<GuildPlan> {
  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { plan: true, grandfathered: true },
  });
  const raw = (guild?.plan ?? "free") as PlanTier;
  // Grandfathered guilds are Pro for life even if their stored plan drifts.
  const tier: PlanTier = guild?.grandfathered && raw === "free" ? "pro" : raw;
  return {
    tier,
    isPro: tier === "pro" || tier === "enterprise",
    monthlySubmissionLimit: MONTHLY_SUBMISSION_LIMITS[tier],
  };
}

/** Convenience: is this guild on a Pro (or better) plan? */
export async function isGuildPro(guildId: string): Promise<boolean> {
  return (await getGuildPlan(guildId)).isPro;
}

/** Convenience: is this guild on the Enterprise plan? */
export async function isGuildEnterprise(guildId: string): Promise<boolean> {
  return (await getGuildPlan(guildId)).tier === "enterprise";
}
