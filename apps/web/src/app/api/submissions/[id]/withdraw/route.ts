import { prisma } from "@msk-forms/db";
import { DEFAULT_STATUSES } from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TERMINAL = new Set<string>(DEFAULT_STATUSES.filter((s) => s.terminal).map((s) => s.key));

/**
 * Applicant withdraws their own submission. Capability model: access by the
 * submission UUID (the private status link), no login required.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const rl = await rateLimit(`withdraw:${clientIp(_request.headers)}`, 10, 60);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  // Read + guarded write in one transaction so two concurrent withdraws (or a
  // withdraw racing a reviewer decision) can't both record the change. The
  // `updateMany ... status = current` only succeeds while the status is still
  // what we read; terminal statuses (incl. an existing withdrawal) are rejected.
  const outcome = await prisma.$transaction(async (tx) => {
    const submission = await tx.submission.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!submission) return { code: 404 as const };
    if (TERMINAL.has(submission.status)) return { code: 409 as const };

    const updated = await tx.submission.updateMany({
      where: { id, status: submission.status },
      data: { status: "withdrawn" },
    });
    if (updated.count === 0) return { code: 409 as const };

    await tx.submissionEvent.create({
      data: {
        submissionId: id,
        type: "status_change",
        fromStatus: submission.status,
        toStatus: "withdrawn",
        visibility: "public",
      },
    });
    return { code: 200 as const };
  });

  if (outcome.code === 404) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (outcome.code === 409) {
    return NextResponse.json(
      { error: "This submission can no longer be withdrawn." },
      { status: 409 },
    );
  }
  return NextResponse.json({ ok: true });
}
