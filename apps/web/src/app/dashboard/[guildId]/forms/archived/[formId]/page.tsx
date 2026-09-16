import { prisma } from "@msk-forms/db";
import { Card, StatusBadge } from "@msk-forms/ui";
import { IconArrowLeft } from "@tabler/icons-react";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { resolveStatus } from "@/lib/forms";
import { canReviewForm } from "@/lib/guild";
import { getDict } from "@/i18n";

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
  if (!(await canReviewForm(guildId, user.id, formId))) {
    return (
      <Card className="p-8">
        <p className="text-muted-foreground">{t.board.noPerm}</p>
      </Card>
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Link
          href={`/dashboard/${guildId}/forms/archived` as Route}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <IconArrowLeft size={16} stroke={1.75} />
          {a.backToArchive}
        </Link>
        <h2 className="font-heading text-xl font-semibold text-foreground">{form.title}</h2>
        <p className="text-sm text-muted-foreground">{a.submissionsIntro}</p>
      </div>

      {submissions.length === 0 ? (
        <Card className="p-8">
          <p className="text-muted-foreground">{t.noSubmissions}</p>
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-medium">{t.colApplicant}</th>
                <th className="px-4 py-3 font-medium">{t.colDate}</th>
                <th className="px-4 py-3 font-medium">{t.colStatus}</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {submissions.map((s) => {
                const status = resolveStatus(s.status, defs, dict.statusLabels);
                return (
                  <tr key={s.id}>
                    <td className="px-4 py-3 text-foreground" translate="no">
                      {s.user?.username ?? t.anonymous}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {s.submittedAt.toISOString().slice(0, 10)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={status.label} color={status.color} />
                    </td>
                    <td className="px-4 py-3 text-end">
                      <Link
                        href={`/dashboard/${guildId}/submissions/${s.id}` as Route}
                        className="font-medium text-primary hover:underline"
                      >
                        {t.open}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
