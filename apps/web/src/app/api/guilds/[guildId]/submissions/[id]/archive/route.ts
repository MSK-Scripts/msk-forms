import { logGuildActivitySafe, prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { actor } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";
import { canReviewForm } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({ archived: z.boolean() });

/**
 * Archive (soft-hide) or restore a submission. Archived submissions drop out of
 * the active Submissions list and Board but are never deleted — they live on the
 * dedicated "Archived" page. Reviewer-gated to the submission's form.
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
    select: { guildId: true, formId: true, archivedAt: true, form: { select: { title: true } } },
  });
  if (!submission || submission.guildId !== guildId) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }
  if (!(await canReviewForm(guildId, user.id, submission.formId))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 422 });
  }

  await prisma.submission.update({
    where: { id },
    data: { archivedAt: parsed.data.archived ? new Date() : null },
  });
  // Only log a real change, so a double click doesn't produce two entries.
  if (Boolean(submission.archivedAt) !== parsed.data.archived) {
    await logGuildActivitySafe(guildId, {
      action: parsed.data.archived ? "submission_archived" : "submission_restored",
      ...actor(user),
      formTitle: submission.form.title,
      formId: submission.formId,
      submissionId: id,
    });
  }
  return NextResponse.json({ ok: true });
}
