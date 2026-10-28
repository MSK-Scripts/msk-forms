import { prisma } from "@msk-forms/db";
import { parseBotConfig } from "@msk-forms/shared";

import { BotConfigForm } from "@/components/bot/bot-config-form";
import { EmptyState, PageHeader } from "@/components/dashboard-kit";
import { requireUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function BotConfigPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/bot`);
  const t = await getDict();

  if (!(await canManageForms(guildId, user.id))) {
    return (
      <>
        <PageHeader title={t.botConfig.title} />
        <EmptyState kind="unavailable" title={t.botConfig.noPerm} />
      </>
    );
  }

  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { botConfig: true },
  });
  const config = parseBotConfig(guild?.botConfig);

  return (
    <>
      <PageHeader title={t.botConfig.title} description={t.botConfig.intro} />
      <BotConfigForm
        guildId={guildId}
        initial={config}
        t={t.botConfig}
        kit={{ saveBar: t.kit.saveBar, dismiss: t.kit.dismiss }}
      />
    </>
  );
}
