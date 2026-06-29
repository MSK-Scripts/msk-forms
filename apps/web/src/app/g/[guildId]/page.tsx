import { prisma } from "@msk-forms/db";
import { notFound } from "next/navigation";

import { GuildHub } from "@/components/public/guild-hub";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public per-guild form hub on the primary domain, addressed by internal id.
 * Lets a guild share one link to all its live forms (grouped by category)
 * without a custom domain. See `/[handle]` for the vanity-path variant.
 */
export default async function GuildHubPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { id: true, name: true, branding: true },
  });
  if (!guild) notFound();
  return <GuildHub guild={guild} />;
}
