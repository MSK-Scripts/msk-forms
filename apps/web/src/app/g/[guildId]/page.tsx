import { prisma } from "@msk-forms/db";
import { notFound } from "next/navigation";

import { GuildFormsHub } from "@/components/public/forms-hub";
import { getGuildCategories, getLiveFormsForGuild } from "@/lib/forms";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public per-guild form hub on the primary domain. Lets a guild share one link
 * to all its live forms, grouped by category, without needing a custom domain.
 */
export default async function GuildHubPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const t = await getDict();

  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { id: true, name: true, branding: true },
  });
  if (!guild) notFound();

  const [forms, categories] = await Promise.all([
    getLiveFormsForGuild(guild.id),
    getGuildCategories(guild.id),
  ]);

  return (
    <GuildFormsHub
      guild={guild}
      forms={forms}
      categories={categories}
      labels={{
        chooseForm: t.domainHome.chooseForm,
        noForms: t.domainHome.noForms,
        endingSoon: t.form.endingSoon,
        opensAt: t.form.opensAt,
        otherForms: t.domainHome.otherForms,
      }}
    />
  );
}
