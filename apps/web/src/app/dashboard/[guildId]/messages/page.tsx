import { prisma } from "@msk-forms/db";
import { parseStatusMessages } from "@msk-forms/shared";
import { Card } from "@msk-forms/ui";

import { StatusMessagesForm } from "@/components/messages/status-messages-form";
import { requireUser } from "@/lib/auth";
import { getStatusOptionsForGuild } from "@/lib/forms";
import { canManageForms } from "@/lib/guild";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function StatusMessagesPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/messages`);
  const dict = await getDict();
  const t = dict.dashboard;

  if (!(await canManageForms(guildId, user.id))) {
    return (
      <Card className="p-8">
        <p className="text-muted-foreground">{t.msgNoPerm}</p>
      </Card>
    );
  }

  const [statuses, guild] = await Promise.all([
    getStatusOptionsForGuild(guildId, dict.statusLabels),
    prisma.guild.findUnique({ where: { id: guildId }, select: { statusMessages: true } }),
  ]);
  const messages = parseStatusMessages(guild?.statusMessages);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-semibold text-foreground">{t.msgTitle}</h2>
        <p className="text-sm text-muted-foreground">{t.msgIntro}</p>
      </div>
      <StatusMessagesForm
        guildId={guildId}
        statuses={statuses}
        initial={messages}
        t={{
          placeholder: t.msgPlaceholder,
          hint: t.msgHint,
          save: t.msgSave,
          saving: t.msgSaving,
          saved: t.msgSaved,
          errSave: t.msgErr,
        }}
      />
    </div>
  );
}
