import { prisma } from "@msk-forms/db";
import { Card } from "@msk-forms/ui";

import { SubmissionsTable } from "@/components/dashboard/submissions-table";
import { requireUser } from "@/lib/auth";
import { resolveStatus, statusOptions } from "@/lib/forms";
import { getGuildSubmissions, getReviewScope } from "@/lib/guild";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function GuildSubmissionsPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/submissions`);
  const dict = await getDict();
  const t = dict.dashboard;

  // Reviewers see only the submissions of forms they're allowed to review.
  const scope = await getReviewScope(guildId, user.id);
  const canReview = scope.all || scope.formIds.length > 0;
  if (!canReview) {
    return (
      <Card className="p-8">
        <p className="text-muted-foreground">{t.board.noPerm}</p>
      </Card>
    );
  }

  const [submissions, defs] = await Promise.all([
    getGuildSubmissions(guildId, scope),
    prisma.formStatusDef.findMany({
      where: { guildId },
      orderBy: { order: "asc" },
      select: { key: true, label: true, color: true, order: true },
    }),
  ]);

  if (submissions.length === 0) {
    return (
      <Card className="p-8">
        <p className="text-muted-foreground">{t.noSubmissions}</p>
      </Card>
    );
  }

  // Columns include any status present on a submission but not in the defs.
  const options = statusOptions(defs, dict.statusLabels);
  const present = new Set(submissions.map((s) => s.status));
  const extra = [...present]
    .filter((k) => !options.some((o) => o.key === k))
    .map((k) => resolveStatus(k, defs, dict.statusLabels));

  const rows = submissions.map((s) => ({
    id: s.id,
    applicant: s.user?.username ?? t.anonymous,
    avatar: s.user?.avatar ?? null,
    formTitle: s.form.title,
    date: s.submittedAt.toISOString().slice(0, 10),
    status: s.status,
  }));

  return (
    <SubmissionsTable
      guildId={guildId}
      rows={rows}
      options={[...options, ...extra]}
      canReview={canReview}
      labels={{
        colApplicant: t.colApplicant,
        colForm: t.colForm,
        colDate: t.colDate,
        colStatus: t.colStatus,
        open: t.open,
        selected: t.bulk.selected,
        apply: t.bulk.apply,
        applying: t.bulk.applying,
        moveTo: t.board.moveTo,
        bulkFailed: t.bulk.failed,
      }}
    />
  );
}
