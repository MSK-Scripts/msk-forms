import { prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Export the applicant's own submission as JSON (data portability, §19).
 * Capability model: access by the submission UUID.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

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
