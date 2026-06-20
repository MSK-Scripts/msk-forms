import { prisma } from "@msk-forms/db";
import { DEFAULT_STATUSES } from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { canReviewSubmissions } from "@/lib/guild";
import { submissionActionSchema } from "@/lib/submission-action";

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
  if (!(await canReviewSubmissions(guildId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const submission = await prisma.submission.findUnique({
    where: { id },
    select: { guildId: true, status: true },
  });
  if (!submission || submission.guildId !== guildId) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
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
    // Nothing to do if the status is unchanged.
    if (action.status === submission.status) {
      return NextResponse.json({ ok: true });
    }

    // Only allow statuses from the default pipeline or the guild's own defs.
    const customKeys = await prisma.formStatusDef.findMany({
      where: { guildId },
      select: { key: true },
    });
    const allowed = new Set<string>([
      ...DEFAULT_STATUSES.map((s) => s.key),
      ...customKeys.map((d) => d.key),
    ]);
    if (!allowed.has(action.status)) {
      return NextResponse.json({ error: "Unknown status." }, { status: 422 });
    }

    await prisma.$transaction([
      prisma.submission.update({
        where: { id },
        data: { status: action.status },
      }),
      prisma.submissionEvent.create({
        data: {
          submissionId: id,
          actorUserId: user.id,
          type: "status_change",
          fromStatus: submission.status,
          toStatus: action.status,
          visibility: "public",
        },
      }),
    ]);
    return NextResponse.json({ ok: true });
  }

  // note → internal, message → public
  await prisma.submissionEvent.create({
    data: {
      submissionId: id,
      actorUserId: user.id,
      type: action.kind === "note" ? "note" : "message",
      message: action.message,
      visibility: action.kind === "note" ? "internal" : "public",
    },
  });
  return NextResponse.json({ ok: true });
}
