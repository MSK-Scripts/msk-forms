import "server-only";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

// Reuse one client across hot reloads (mirrors the Prisma/Redis singletons).
// `undefined` = unresolved; `null` = object storage not configured.
const globalForS3 = globalThis as unknown as { s3?: S3Client | null };

/** The S3/MinIO client, or null when storage isn't configured (fail-soft). */
export function getS3(): S3Client | null {
  if (globalForS3.s3 !== undefined) return globalForS3.s3;

  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY;
  const secretAccessKey = process.env.S3_SECRET_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    globalForS3.s3 = null;
    return null;
  }

  globalForS3.s3 = new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    endpoint,
    forcePathStyle: true, // MinIO needs path-style addressing
    credentials: { accessKeyId, secretAccessKey },
  });
  return globalForS3.s3;
}

export function s3Bucket(): string {
  return process.env.S3_BUCKET || "msk-forms";
}

/** True when uploads/downloads can be served (storage configured). */
export function s3Enabled(): boolean {
  return getS3() !== null;
}

/** Store an object. Throws if storage is unconfigured (callers gate on s3Enabled). */
export async function putObject(key: string, body: Uint8Array, contentType: string): Promise<void> {
  const s3 = getS3();
  if (!s3) throw new Error("Object storage is not configured.");
  await s3.send(
    new PutObjectCommand({ Bucket: s3Bucket(), Key: key, Body: body, ContentType: contentType }),
  );
}

/** Delete an object. Best-effort — never throws (storage may be unconfigured). */
export async function deleteObject(key: string): Promise<void> {
  const s3 = getS3();
  if (!s3) return;
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: s3Bucket(), Key: key }));
  } catch (err) {
    console.error("[s3] delete failed:", (err as Error).message);
  }
}

/**
 * Look up an object's stored metadata without downloading it, or null if it's
 * missing/unconfigured. Used on submit to confirm an uploaded object actually
 * exists and to read its *server-recorded* size/type instead of trusting the
 * client-supplied descriptor.
 */
export async function headObject(
  key: string,
): Promise<{ contentType: string; contentLength: number } | null> {
  const s3 = getS3();
  if (!s3) return null;
  try {
    const out = await s3.send(new HeadObjectCommand({ Bucket: s3Bucket(), Key: key }));
    return {
      contentType: out.ContentType ?? "application/octet-stream",
      contentLength: out.ContentLength ?? 0,
    };
  } catch {
    return null;
  }
}

/** Fetch an object as a web stream plus its metadata, or null if missing. */
export async function getObject(
  key: string,
): Promise<{ body: ReadableStream; contentType: string; contentLength?: number } | null> {
  const s3 = getS3();
  if (!s3) return null;
  try {
    const out = await s3.send(new GetObjectCommand({ Bucket: s3Bucket(), Key: key }));
    if (!out.Body) return null;
    return {
      body: (out.Body as { transformToWebStream(): ReadableStream }).transformToWebStream(),
      contentType: out.ContentType ?? "application/octet-stream",
      contentLength: out.ContentLength,
    };
  } catch {
    return null;
  }
}
