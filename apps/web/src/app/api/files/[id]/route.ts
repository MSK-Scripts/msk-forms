import { prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";

import { getObject } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stream an uploaded file from MinIO (which stays private). Access is by the
 * FileUpload's unguessable UUID — the same capability model as the public
 * submission status link that surfaces these download URLs.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const file = await prisma.fileUpload.findUnique({
    where: { id },
    select: { filename: true, storageKey: true },
  });
  if (!file) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const object = await getObject(file.storageKey);
  if (!object) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  // Serve as an opaque download, never inline. A user-uploaded file could be
  // HTML/SVG that would execute script if rendered same-origin; forcing
  // `attachment` + `application/octet-stream` makes the browser save it instead
  // of interpreting it (nosniff is also set globally in proxy.ts). The filename
  // is the applicant's display name only and never reaches the served body.
  const headers = new Headers({
    "Content-Type": "application/octet-stream",
    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
    "Cache-Control": "private, max-age=0, no-store",
    "X-Content-Type-Options": "nosniff",
  });
  if (object.contentLength !== undefined) {
    headers.set("Content-Length", String(object.contentLength));
  }

  return new NextResponse(object.body, { headers });
}
