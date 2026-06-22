import { changeSubmissionStatus, prisma } from "@msk-forms/db";
import { DEFAULT_STATUSES, type StatusChangeNotification } from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { resolveStatus } from "@/lib/forms";
import { canReviewSubmissions } from "@/lib/guild";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IDS = 200;

/**
 * Bulk status change for many submissions at once. Reviewer-only. Each row goes
 * through the shared idempotent `changeSubmissionStatus` (event + applicant DM),
 * so this is just a loop over the same per-submission path.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> },
) {
  const { guildId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!(await canReviewSubmissions(guildId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { ids?: unknown; status?: unknown } | null;
  const ids = Array.isArray(body?.ids) ? body.ids.filter((x): x is string => typeof x === "string") : [];
  const status = typeof body?.status === "string" ? body.status : "";
  if (ids.length === 0 || ids.length > MAX_IDS || !status) {
    return NextResponse.json({ error: "Invalid request." }, { status: 422 });
  }

  // Only allow statuses from the default pipeline or the guild's own defs.
  const defs = await prisma.formStatusDef.findMany({
    where: { guildId },
    select: { key: true, label: true, color: true },
  });
  const allowed = new Set<string>([...DEFAULT_STATUSES.map((s) => s.key), ...defs.map((d) => d.key)]);
  if (!allowed.has(status)) {
    return NextResponse.json({ error: "Unknown status." }, { status: 422 });
  }

  // Scope to this guild — never touch submissions from another guild.
  const subs = await prisma.submission.findMany({
    where: { id: { in: ids }, guildId },
    select: { id: true, userId: true, form: { select: { title: true } } },
  });
  const label = resolveStatus(status, defs, (await getDict()).statusLabels).label;

  let changed = 0;
  for (const sub of subs) {
    const notify: StatusChangeNotification | null = sub.userId
      ? { submissionId: sub.id, formTitle: sub.form.title, toStatus: status, toStatusLabel: label }
      : null;
    const res = await changeSubmissionStatus({
      submissionId: sub.id,
      toStatus: status,
      actorUserId: user.id,
      notify: sub.userId && notify ? { userId: sub.userId, type: "status_change", payload: notify } : null,
    });
    if (res.changed) changed++;
  }

  return NextResponse.json({ changed, total: subs.length });
}
