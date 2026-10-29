import { prisma } from "@msk-forms/db";
import type { Route } from "next";
import Link from "next/link";

import { EmptyState, Notice, PageHeader } from "@/components/dashboard-kit";
import { DashboardLive } from "@/components/dashboard/dashboard-live";
import { SubmissionsTable } from "@/components/dashboard/submissions-table";
import { submissionsTableLabels } from "@/components/dashboard/submissions-table-labels";
import { Archive } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { resolveStatus, statusOptions } from "@/lib/forms";
import { countArchivedSubmissions, getGuildSubmissions, getReviewScope } from "@/lib/guild";
import { signGuildRealtimeToken } from "@/lib/realtime-token";
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
      <>
        <PageHeader title={t.submissionsTab} />
        <EmptyState kind="unavailable" title={t.board.noPerm} />
      </>
    );
  }

  const liveToken = signGuildRealtimeToken(guildId);

  const [{ rows: submissions, total }, defs, archivedCount] = await Promise.all([
    getGuildSubmissions(guildId, scope),
    prisma.formStatusDef.findMany({
      where: { guildId },
      orderBy: { order: "asc" },
      select: { key: true, label: true, color: true, order: true },
    }),
    countArchivedSubmissions(guildId, scope),
  ]);

  // Options include any status present on a submission but not in the defs.
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
      {liveToken && <DashboardLive guildId={guildId} token={liveToken} />}
      <PageHeader
        title={t.submissionsTab}
        description={`${total} ${total === 1 ? t.countSubmission : t.countSubmissions}`}
      />

      <div className="grid gap-5">
        {archivedCount > 0 && (
          <div className="flex flex-wrap items-start gap-3">
            <Button asChild variant="outline">
              <Link href={`/dashboard/${guildId}/submissions/archived` as Route} prefetch={false}>
                <Archive className="h-4 w-4" />
                {t.viewArchived}
                <span className="text-muted-foreground tabular-nums">{archivedCount}</span>
              </Link>
            </Button>
          </div>
        )}

        {total > submissions.length && (
          <Notice tone="info" title={truncated}>
            {t.submissionsList.listTruncatedHint}
          </Notice>
        )}

        <SubmissionsTable
          guildId={guildId}
          rows={rows}
          options={[...options, ...extra]}
          canReview={canReview}
          empty={
            <EmptyState
              kind="first-use"
              title={t.noSubmissions}
              action={
                <Button asChild variant="outline">
                  <Link href={`/dashboard/${guildId}/forms` as Route} prefetch={false}>
                    {t.goToForms}
                  </Link>
                </Button>
              }
            >
              {t.noSubmissionsHint}
            </EmptyState>
          }
          labels={submissionsTableLabels(dict, t.submissionsTab)}
        />
      </div>
    </>
  );
}
