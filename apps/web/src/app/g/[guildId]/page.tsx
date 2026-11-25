import { prisma } from "@msk-forms/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GuildHub } from "@/components/public/guild-hub";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A guild with a handle has its hub twice on the primary domain, at /g/<id>
 * and at /<handle>. The handle is the address the guild shares, so it is the
 * canonical for both.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ guildId: string }>;
}): Promise<Metadata> {
  const { guildId } = await params;
  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { id: true, name: true, handle: true },
  });
  if (!guild) return {};
  return {
    title: `${guild.name} · Application forms`,
    description: `All open application forms of ${guild.name} in one place. Apply with your Discord account and follow your status live, on MSK Forms.`,
    alternates: { canonical: guild.handle ? `/${guild.handle}` : `/g/${guild.id}` },
  };
}

/**
 * Public per-guild form hub on the primary domain, addressed by internal id.
 * Lets a guild share one link to all its live forms (grouped by category)
 * without a custom domain. See `/[handle]` for the vanity-path variant.
 */
export default async function GuildHubPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { id: true, name: true, branding: true },
  });
  if (!guild) notFound();
  return <GuildHub guild={guild} path={`/g/${guild.id}`} />;
}
