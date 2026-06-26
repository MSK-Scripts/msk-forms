import {
  changeSubmissionStatus,
  logGuildActivitySafe,
  notifySubmissionChange,
  Prisma,
  prisma,
} from "@msk-forms/db";
import {
  DEFAULT_STATUSES,
  type MessageNotification,
  type StatusChangeNotification,
} from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { resolveStatus } from "@/lib/forms";
import { canReviewForm } from "@/lib/guild";
import { submissionActionSchema } from "@/lib/submission-action";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Record a reviewer action against a submission: change its status, add an
 * internal note, or send a message to the applicant. Requires a reviewer role
 * (owner/admin/reviewer) and the submission must belong to the guild.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string; id: string }> },
) {
  const { guildId, id } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const submission = await prisma.submission.findUnique({
    where: { id },
    select: {
      guildId: true,
      formId: true,
      status: true,
      userId: true,
      form: { select: { title: true } },
    },
  });
  if (!submission || submission.guildId !== guildId) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }
  // Reviewer must be allowed to review this specific form.
  if (!(await canReviewForm(guildId, user.id, submission.formId))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const parsed = submissionActionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid action." },
      { status: 422 },
    );
  }
  const action = parsed.data;

  if (action.kind === "status") {
    // Only allow statuses from the default pipeline or the guild's own defs.
    const defs = await prisma.formStatusDef.findMany({
      where: { guildId },
      select: { key: true, label: true, color: true },
    });
    const allowed = new Set<string>([
      ...DEFAULT_STATUSES.map((s) => s.key),
      ...defs.map((d) => d.key),
    ]);
    if (!allowed.has(action.status)) {
      return NextResponse.json({ error: "Unknown status." }, { status: 422 });
    }

    // Idempotent, race-safe transition + event + applicant DM (skip anonymous).
    const labels = (await getDict()).statusLabels;
    const toStatusLabel = resolveStatus(action.status, defs, labels).label;
    const notify: StatusChangeNotification | null = submission.userId
      ? {
          submissionId: id,
          formTitle: submission.form.title,
          toStatus: action.status,
          toStatusLabel,
        }
      : null;
    await changeSubmissionStatus({
      submissionId: id,
      toStatus: action.status,
      actorUserId: user.id,
      actorName: user.username,
      toStatusLabel,
      notify:
        submission.userId && notify
          ? { userId: submission.userId, type: "status_change", payload: notify }
          : null,
    });
    return NextResponse.json({ ok: true });
  }

  if (action.kind === "note") {
    // Internal note — team-only, no applicant notification.
    await prisma.submissionEvent.create({
      data: {
        submissionId: id,
        actorUserId: user.id,
        type: "note",
        message: action.message,
        visibility: "internal",
      },
    });
    return NextResponse.json({ ok: true });
  }

  // Public message — plus an outbox DM for the applicant (unless anonymous).
  const ops: Prisma.PrismaPromise<unknown>[] = [
    prisma.submissionEvent.create({
      data: {
        submissionId: id,
        actorUserId: user.id,
        type: "message",
        message: action.message,
        visibility: "public",
      },
    }),
  ];
  if (submission.userId) {
    const payload: MessageNotification = {
      submissionId: id,
      formTitle: submission.form.title,
      message: action.message,
    };
    ops.push(
      prisma.notification.create({
        data: {
          userId: submission.userId,
          type: "message",
          payload: payload as unknown as Prisma.InputJsonValue,
        },
      }),
    );
  }
  await prisma.$transaction(ops);
  // Realtime: a new public message is fresh activity on the status page.
  await notifySubmissionChange(id);
  await logGuildActivitySafe(guildId, {
    action: "message_sent",
    actorName: user.username,
    formTitle: submission.form.title,
    submissionId: id,
    detail: action.message.slice(0, 1024),
  });
  return NextResponse.json({ ok: true });
}
