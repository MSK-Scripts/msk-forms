import { prisma } from "@msk-forms/db";
import { Card } from "@msk-forms/ui";

import { KanbanBoard, type BoardColumn } from "@/components/board/kanban-board";
import { requireUser } from "@/lib/auth";
import { resolveStatus, statusOptions } from "@/lib/forms";
import { canReviewSubmissions, getGuildSubmissions } from "@/lib/guild";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/board`);
  const t = (await getDict()).dashboard;

  if (!(await canReviewSubmissions(guildId, user.id))) {
    return (
      <Card className="p-8">
        <p className="text-muted-foreground">{t.board.noPerm}</p>
      </Card>
    );
  }

  const [submissions, defs] = await Promise.all([
    getGuildSubmissions(guildId),
    prisma.formStatusDef.findMany({
      where: { guildId },
      orderBy: { order: "asc" },
      select: { key: true, label: true, color: true, order: true },
    }),
  ]);

  // Columns: the standard pipeline + custom defs, plus any status present on a
  // submission that isn't otherwise listed (so no card is ever orphaned).
  const options = statusOptions(defs);
  const present = new Set(submissions.map((s) => s.status));
  const extra = [...present]
    .filter((k) => !options.some((o) => o.key === k))
    .map((k) => resolveStatus(k, defs));
  const columns: BoardColumn[] = [...options, ...extra];

  const cards = submissions.map((s) => ({
    id: s.id,
    status: s.status,
    formTitle: s.form.title,
    applicant: s.user?.username ?? t.anonymous,
    date: s.submittedAt.toISOString().slice(0, 10),
  }));

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-semibold text-foreground">{t.board.title}</h2>
      {cards.length === 0 ? (
        <Card className="p-8">
          <p className="text-muted-foreground">{t.noSubmissions}</p>
        </Card>
      ) : (
        <KanbanBoard
          guildId={guildId}
          columns={columns}
          initial={cards}
          labels={{
            moveTo: t.board.moveTo,
            empty: t.board.columnEmpty,
            open: t.open,
            saveFailed: t.board.saveFailed,
          }}
        />
      )}
    </div>
  );
}
