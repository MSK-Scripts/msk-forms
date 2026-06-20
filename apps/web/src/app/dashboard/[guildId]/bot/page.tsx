import { prisma } from "@msk-forms/db";
import { parseBotConfig } from "@msk-forms/shared";
import { Card } from "@msk-forms/ui";

import { BotConfigForm } from "@/components/bot/bot-config-form";
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
      <Card className="p-8">
        <p className="text-muted-foreground">{t.botConfig.noPerm}</p>
      </Card>
    );
  }

  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { botConfig: true },
  });
  const config = parseBotConfig(guild?.botConfig);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-semibold text-foreground">{t.botConfig.title}</h2>
      <BotConfigForm guildId={guildId} initial={config} t={t.botConfig} />
    </div>
  );
}
