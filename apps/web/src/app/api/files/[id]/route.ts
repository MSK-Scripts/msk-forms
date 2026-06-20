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
    select: { filename: true, mime: true, storageKey: true },
  });
  if (!file) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const object = await getObject(file.storageKey);
  if (!object) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const headers = new Headers({
    "Content-Type": file.mime || object.contentType,
    "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
    "Cache-Control": "private, max-age=0, no-store",
  });
  if (object.contentLength) headers.set("Content-Length", String(object.contentLength));

  return new NextResponse(object.body, { headers });
}
