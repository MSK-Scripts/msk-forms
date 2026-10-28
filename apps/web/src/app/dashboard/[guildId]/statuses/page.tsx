import { prisma } from "@msk-forms/db";
import { DEFAULT_STATUSES, type StatusDefInput } from "@msk-forms/shared";
import { SubmissionStatusBadge } from "@msk-forms/ui";

import { EmptyState, FormSection, PageHeader } from "@/components/dashboard-kit";
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
  const dict = await getDict();
  const t = dict.dashboard;

  if (!(await canManageForms(guildId, user.id))) {
    return (
      <>
        <PageHeader title={t.statusesTab} />
        <EmptyState kind="unavailable" title={t.statuses.noPerm} />
      </>
    );
  }

  const defs = await prisma.formStatusDef.findMany({
    where: { guildId, formId: null },
    orderBy: { order: "asc" },
    select: { key: true, label: true, color: true, isTerminal: true, visibleToApplicant: true },
  });

  return (
    <>
      <PageHeader title={t.statusesTab} description={t.statuses.intro} />

      <div>
        <FormSection title={t.statuses.defaultsTitle} description={t.statuses.defaultsHint}>
          <ul className="flex flex-wrap gap-2">
            {DEFAULT_STATUSES.map((s) => (
              <li key={s.key}>
                <SubmissionStatusBadge label={dict.statusLabels[s.key] ?? s.label} color={s.color} />
              </li>
            ))}
          </ul>
        </FormSection>

        <StatusDefsForm
          guildId={guildId}
          initial={defs as StatusDefInput[]}
          t={t.statuses}
          kit={{ saveBar: dict.kit.saveBar, dismiss: dict.kit.dismiss }}
        />
      </div>
    </>
  );
}
