import { prisma } from "@msk-forms/db";
import { parseStatusMessages } from "@msk-forms/shared";

import { EmptyState, PageHeader } from "@/components/dashboard-kit";
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
      <>
        <PageHeader title={t.msgTitle} />
        <EmptyState kind="unavailable" title={t.msgNoPerm} />
      </>
    );
  }

  const [statuses, guild] = await Promise.all([
    getStatusOptionsForGuild(guildId, dict.statusLabels),
    prisma.guild.findUnique({ where: { id: guildId }, select: { statusMessages: true } }),
  ]);
  const messages = parseStatusMessages(guild?.statusMessages);

  return (
    <>
      <PageHeader title={t.msgTitle} description={t.msgIntro} />
      <div>
        <StatusMessagesForm
          guildId={guildId}
          statuses={statuses}
          initial={messages}
          t={{
            section: t.msgSection,
            placeholder: t.msgPlaceholder,
            hint: t.msgHint,
            saved: t.msgSaved,
            errSave: t.msgErr,
          }}
          kit={{ saveBar: dict.kit.saveBar, dismiss: dict.kit.dismiss }}
        />
      </div>
    </>
  );
}
