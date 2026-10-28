import { prisma } from "@msk-forms/db";
import { notFound } from "next/navigation";

import { EmptyState, PageHeader } from "@/components/dashboard-kit";
import { SubmissionRowsTable } from "@/components/dashboard/submission-rows-table";
import { getDict } from "@/i18n";
import { requireUser } from "@/lib/auth";
import { resolveStatus } from "@/lib/forms";
import { canReviewForm } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Read-only list of an archived form's submissions. They are hidden from the
 * regular submission lists and the board together with their form; this is where
 * they stay reachable. Each row opens the usual submission detail page.
 */
export default async function ArchivedFormSubmissionsPage({
  params,
}: {
  params: Promise<{ guildId: string; formId: string }>;
}) {
  const { guildId, formId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/forms/archived/${formId}`);
  const dict = await getDict();
  const t = dict.dashboard;
  const a = t.formArchive;

  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: { guildId: true, title: true, archivedAt: true },
  });
  if (!form || form.guildId !== guildId || !form.archivedAt) notFound();

  const crumbs = [
    { label: t.formsTab, href: `/dashboard/${guildId}/forms` },
    { label: a.title, href: `/dashboard/${guildId}/forms/archived` },
    { label: form.title },
  ];

  if (!(await canReviewForm(guildId, user.id, formId))) {
    return (
      <>
        <PageHeader title={form.title} breadcrumbs={crumbs} breadcrumbLabel={dict.kit.breadcrumb} />
        <EmptyState kind="unavailable" title={t.board.noPerm} />
      </>
    );
  }

  const [submissions, defs] = await Promise.all([
    prisma.submission.findMany({
      where: { formId, guildId },
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        status: true,
        submittedAt: true,
        user: { select: { username: true } },
      },
    }),
    prisma.formStatusDef.findMany({
      where: { guildId },
      select: { key: true, label: true, color: true },
    }),
  ]);

  return (
    <>
      <PageHeader
        title={form.title}
        description={a.submissionsIntro}
        breadcrumbs={crumbs}
        breadcrumbLabel={dict.kit.breadcrumb}
      />
      <SubmissionRowsTable
        guildId={guildId}
        rows={submissions.map((s) => {
          const status = resolveStatus(s.status, defs, dict.statusLabels);
          return {
            id: s.id,
            applicant: s.user?.username ?? null,
            submittedAt: s.submittedAt.toISOString(),
            status: { label: status.label, color: status.color },
          };
        })}
        empty={<EmptyState kind="first-use" title={t.noSubmissions} />}
        copy={{
          caption: form.title,
          applicant: t.colApplicant,
          anonymous: t.anonymous,
          date: t.colDate,
          status: t.colStatus,
        }}
      />
    </>
  );
}
