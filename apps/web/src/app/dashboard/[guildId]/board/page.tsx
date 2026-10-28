import { prisma } from "@msk-forms/db";
import type { Route } from "next";
import Link from "next/link";

import { KanbanBoard, type BoardColumn } from "@/components/board/kanban-board";
import { EmptyState, PageHeader } from "@/components/dashboard-kit";
import { DashboardLive } from "@/components/dashboard/dashboard-live";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { resolveStatus, statusOptions } from "@/lib/forms";
import { getGuildSubmissions, getReviewScope } from "@/lib/guild";
import { signGuildRealtimeToken } from "@/lib/realtime-token";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function BoardPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/board`);
  const dict = await getDict();
  const t = dict.dashboard;

  const scope = await getReviewScope(guildId, user.id);
  if (!scope.all && scope.formIds.length === 0) {
    return (
      <>
        <PageHeader title={t.board.title} />
        <EmptyState kind="unavailable" title={t.board.noPerm} />
      </>
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

  // Columns: the standard pipeline + custom defs, plus any status present on a
  // submission that isn't otherwise listed (so no card is ever orphaned).
  const options = statusOptions(defs, dict.statusLabels);
  const present = new Set(submissions.map((s) => s.status));
  const extra = [...present]
    .filter((k) => !options.some((o) => o.key === k))
    .map((k) => resolveStatus(k, defs, dict.statusLabels));
  const columns: BoardColumn[] = [...options, ...extra];

  const cards = submissions.map((s) => ({
    id: s.id,
    status: s.status,
    formTitle: s.form.title,
    applicant: s.user?.username ?? null,
    submittedAt: s.submittedAt.toISOString(),
  }));

  const liveToken = signGuildRealtimeToken(guildId);

  return (
    <>
      {liveToken && <DashboardLive guildId={guildId} token={liveToken} />}
      <PageHeader
        title={t.board.title}
        description={cards.length > 0 ? t.board.intro : undefined}
      />
      {cards.length === 0 ? (
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
      ) : (
        <KanbanBoard
          guildId={guildId}
          columns={columns}
          initial={cards}
          labels={{
            region: t.board.region,
            move: t.board.move,
            moveCard: t.board.moveCard,
            moveTo: t.board.moveTo,
            moved: t.board.moved,
            empty: t.board.columnEmpty,
            anonymous: t.anonymous,
            countOne: t.countSubmission,
            countMany: t.countSubmissions,
            saveFailed: t.board.saveFailed,
            dismiss: dict.kit.dismiss,
          }}
        />
      )}
    </>
  );
}
