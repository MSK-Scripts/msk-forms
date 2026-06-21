import { prisma } from "@msk-forms/db";
import { DEFAULT_STATUSES, type StatusDefInput } from "@msk-forms/shared";
import { Card, StatusBadge } from "@msk-forms/ui";

import { StatusDefsForm } from "@/components/statuses/status-defs-form";
import { requireUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function StatusesPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/statuses`);
  const t = (await getDict()).dashboard;

  if (!(await canManageForms(guildId, user.id))) {
    return (
      <Card className="p-8">
        <p className="text-muted-foreground">{t.statuses.noPerm}</p>
      </Card>
    );
  }

  const defs = await prisma.formStatusDef.findMany({
    where: { guildId, formId: null },
    orderBy: { order: "asc" },
    select: { key: true, label: true, color: true, isTerminal: true, visibleToApplicant: true },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-semibold text-foreground">{t.statuses.title}</h2>
        <p className="text-sm text-muted-foreground">{t.statuses.intro}</p>
      </div>

      <Card className="flex flex-col gap-3 p-5">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t.statuses.defaultsTitle}
        </h3>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_STATUSES.map((s) => (
            <StatusBadge key={s.key} label={s.label} color={s.color} />
          ))}
        </div>
      </Card>

      <StatusDefsForm guildId={guildId} initial={defs as StatusDefInput[]} t={t.statuses} />
    </div>
  );
}
