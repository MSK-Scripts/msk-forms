import { prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";

import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Export the applicant's own submission as JSON (data portability, §19).
 * Capability model: access by the submission UUID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  // Throttle for parity with withdraw/delete (the UUID is the only credential).
  const rl = await rateLimit(`export:${clientIp(request.headers)}`, 10, 60);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const submission = await prisma.submission.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      answers: true,
      submittedAt: true,
      updatedAt: true,
      form: { select: { title: true } },
      events: {
        where: { visibility: "public" },
        orderBy: { createdAt: "asc" },
        select: { type: true, fromStatus: true, toStatus: true, message: true, createdAt: true },
      },
      files: { select: { filename: true, mime: true, size: true } },
    },
  });
  if (!submission) return NextResponse.json({ error: "Not found." }, { status: 404 });

  return new NextResponse(JSON.stringify(submission, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="submission-${id}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
