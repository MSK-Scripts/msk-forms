import { prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";

import { clientIp, rateLimit } from "@/lib/rate-limit";
import { deleteObject } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Applicant deletes their own submission (right to erasure, §19). Removes the
 * submission (cascading its events + file rows) and the stored file objects.
 * Capability model: access by the submission UUID.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const rl = await rateLimit(`delete:${clientIp(request.headers)}`, 10, 60);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const submission = await prisma.submission.findUnique({
    where: { id },
    select: { files: { select: { storageKey: true } } },
  });
  if (!submission) return NextResponse.json({ error: "Not found." }, { status: 404 });

  // Delete the row first (cascades events + file rows) so the erasure is durable
  // even if object storage is down; then best-effort purge the stored objects.
  // The storage keys were captured above before the row is gone.
  const keys = submission.files.map((f) => f.storageKey);
  await prisma.submission.delete({ where: { id } });
  await Promise.all(keys.map((key) => deleteObject(key)));

  return NextResponse.json({ ok: true });
}
