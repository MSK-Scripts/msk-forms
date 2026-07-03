import { prisma } from "@msk-forms/db";
import { Card } from "@msk-forms/ui";
import { IconArrowLeft } from "@tabler/icons-react";
import type { Route } from "next";
import Link from "next/link";

import { SubmissionsTable } from "@/components/dashboard/submissions-table";
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
    getGuildSubmissions(guildId, scope, { archived: true }),
    prisma.formStatusDef.findMany({
      where: { guildId },
      orderBy: { order: "asc" },
      select: { key: true, label: true, color: true, order: true },
    }),
  ]);

  const backLink = (
    <Link
      href={`/dashboard/${guildId}/submissions` as Route}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <IconArrowLeft size={16} stroke={1.75} />
      {t.backToSubmissions}
    </Link>
  );

  const header = (
    <div className="flex flex-col gap-1">
      {backLink}
      <h2 className="font-heading text-xl font-semibold text-foreground">{t.archivedTitle}</h2>
    </div>
  );

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        {header}
        <Card className="p-8">
          <p className="text-muted-foreground">{t.noArchived}</p>
        </Card>
      </div>
    );
  }

  const options = statusOptions(defs, dict.statusLabels);
  const present = new Set(submissions.map((s) => s.status));
  const extra = [...present]
    .filter((k) => !options.some((o) => o.key === k))
    .map((k) => resolveStatus(k, defs, dict.statusLabels));

  const rows = submissions.map((s) => ({
    id: s.id,
    applicant: s.user?.username ?? t.anonymous,
    avatar: s.user?.avatar ?? null,
    formId: s.formId,
    formTitle: s.form.title,
    date: s.submittedAt.toISOString().slice(0, 10),
    status: s.status,
    score: s.score,
  }));

  return (
    <div className="flex flex-col gap-4">
      {header}
      <SubmissionsTable
        guildId={guildId}
        rows={rows}
        options={[...options, ...extra]}
        canReview={canReview}
        archived
        labels={{
          colApplicant: t.colApplicant,
          colForm: t.colForm,
          colDate: t.colDate,
          colStatus: t.colStatus,
          colScore: t.colScore,
          open: t.open,
          archive: t.archive,
          restore: t.restore,
          selected: t.bulk.selected,
          apply: t.bulk.apply,
          applying: t.bulk.applying,
          moveTo: t.board.moveTo,
          bulkFailed: t.bulk.failed,
          allForms: t.allForms,
        }}
      />
    </div>
  );
}
