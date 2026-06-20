import { prisma } from "@msk-forms/db";
import { FILE_FIELD_TYPES } from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { parseFormSpec } from "@/lib/forms";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { putObject, s3Enabled } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_LIMIT = 20; // uploads per minute per IP
const UPLOAD_WINDOW_SECONDS = 60;
const DEFAULT_MAX_FILE_MB = 10;

/**
 * Upload a single file for a form's file/image field. The bytes are streamed
 * through the server to MinIO (which stays loopback-only); the response is a
 * descriptor the client stores as that field's answer. The FileUpload row is
 * created later, on submit, once a submission id exists.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const ip = clientIp(request.headers);

  const rl = await rateLimit(`upload:${ip}`, UPLOAD_LIMIT, UPLOAD_WINDOW_SECONDS);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many uploads. Please try again in a moment." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  if (!s3Enabled()) {
    return NextResponse.json({ error: "File uploads are not available." }, { status: 503 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const fieldId = formData?.get("fieldId");
  if (!(file instanceof File) || typeof fieldId !== "string") {
    return NextResponse.json({ error: "Missing file or field." }, { status: 400 });
  }

  const form = await prisma.form.findUnique({
    where: { slug },
    select: { id: true, status: true, schema: true },
  });
  if (!form || form.status !== "live") {
    return NextResponse.json({ error: "Form not available." }, { status: 404 });
  }

  const spec = parseFormSpec(form.schema);
  const field = spec?.pages.flatMap((p) => p.fields).find((f) => f.id === fieldId);
  if (!field || !(FILE_FIELD_TYPES as readonly string[]).includes(field.type)) {
    return NextResponse.json({ error: "Not a file field." }, { status: 400 });
  }

  const maxBytes = (field.validation.maxFileSizeMb ?? DEFAULT_MAX_FILE_MB) * 1024 * 1024;
  if (file.size === 0 || file.size > maxBytes) {
    return NextResponse.json(
      { error: `File must be between 1 byte and ${Math.round(maxBytes / 1024 / 1024)} MB.` },
      { status: 413 },
    );
  }

  const allowed = field.validation.allowedMimeTypes;
  const mime = file.type || "application/octet-stream";
  const mimeOk = allowed?.length
    ? allowed.includes(mime)
    : field.type === "image_upload"
      ? mime.startsWith("image/")
      : true;
  if (!mimeOk) {
    return NextResponse.json({ error: "This file type isn't allowed." }, { status: 415 });
  }

  const key = `uploads/${form.id}/${crypto.randomUUID()}`;
  try {
    await putObject(key, new Uint8Array(await file.arrayBuffer()), mime);
  } catch (err) {
    console.error("[upload] storage error:", (err as Error).message);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 502 });
  }

  return NextResponse.json(
    { key, name: file.name, size: file.size, mime },
    { status: 201 },
  );
}
