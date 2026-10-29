import { prisma } from "@msk-forms/db";

import { EmptyState, Notice, PageHeader } from "@/components/dashboard-kit";
import { SubmissionsTable } from "@/components/dashboard/submissions-table";
import { submissionsTableLabels } from "@/components/dashboard/submissions-table-labels";
import { requireUser } from "@/lib/auth";
import { resolveStatus, statusOptions } from "@/lib/forms";
import { getGuildSubmissions, getReviewScope } from "@/lib/guild";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ArchivedSubmissionsPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/submissions/archived`);
  const dict = await getDict();
  const t = dict.dashboard;

  const crumbs = [
    { label: t.submissionsTab, href: `/dashboard/${guildId}/submissions` },
    { label: t.viewArchived },
  ];

  const scope = await getReviewScope(guildId, user.id);
  const canReview = scope.all || scope.formIds.length > 0;
  if (!canReview) {
    return (
      <>
        <PageHeader
          title={t.archivedTitle}
          breadcrumbs={crumbs}
          breadcrumbLabel={dict.kit.breadcrumb}
        />
        <EmptyState kind="unavailable" title={t.board.noPerm} />
      </>
    );
  }

  const [{ rows: submissions, total }, defs] = await Promise.all([
    getGuildSubmissions(guildId, scope, { archived: true }),
    prisma.formStatusDef.findMany({
      where: { guildId },
      orderBy: { order: "asc" },
      select: { key: true, label: true, color: true, order: true },
    }),
  ]);

  const options = statusOptions(defs, dict.statusLabels);
  const present = new Set(submissions.map((s) => s.status));
  const extra = [...present]
    .filter((k) => !options.some((o) => o.key === k))
    .map((k) => resolveStatus(k, defs, dict.statusLabels));

  const rows = submissions.map((s) => ({
    id: s.id,
    applicant: s.user?.username ?? null,
    avatar: s.user?.avatar ?? null,
    formId: s.formId,
    formTitle: s.form.title,
    submittedAt: s.submittedAt.toISOString(),
    status: s.status,
    score: s.score,
  }));

  const truncated = t.submissionsList.listTruncated
    .replace("{limit}", String(submissions.length))
    .replace("{total}", String(total));

  return (
    <>
      <PageHeader
        title={t.archivedTitle}
        description={t.submissionsList.archivedIntro}
        breadcrumbs={crumbs}
        breadcrumbLabel={dict.kit.breadcrumb}
      />
      {total > submissions.length && <Notice tone="info" title={truncated} className="mb-5" />}
      <SubmissionsTable
        guildId={guildId}
        rows={rows}
        options={[...options, ...extra]}
        canReview={canReview}
        archived
        empty={<EmptyState kind="first-use" title={t.noArchived} />}
        labels={submissionsTableLabels(dict, t.archivedTitle)}
      />
    </>
  );
}
