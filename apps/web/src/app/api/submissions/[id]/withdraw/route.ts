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

  const submission = await prisma.submission.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!submission) return NextResponse.json({ error: "Not found." }, { status: 404 });

  if (TERMINAL.has(submission.status)) {
    return NextResponse.json(
      { error: "This submission can no longer be withdrawn." },
      { status: 409 },
    );
  }

  await prisma.$transaction([
    prisma.submission.update({ where: { id }, data: { status: "withdrawn" } }),
    prisma.submissionEvent.create({
      data: {
        submissionId: id,
        type: "status_change",
        fromStatus: submission.status,
        toStatus: "withdrawn",
        visibility: "public",
      },
    }),
  ]);
  return NextResponse.json({ ok: true });
}
