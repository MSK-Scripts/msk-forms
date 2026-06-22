import { Prisma, prisma } from "@msk-forms/db";
import { type Branding } from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";

import { getCurrentUser } from "@/lib/auth";
import { parseBranding } from "@/lib/branding";
import { canManageForms } from "@/lib/guild";
import { sniffRasterImage } from "@/lib/image";
import { deleteObject, putObject, s3Enabled } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 1024 * 1024; // 1 MB
const MAX_DIM = 512;

async function loadBranding(guildId: string): Promise<Branding> {
  const guild = await prisma.guild.findUnique({ where: { id: guildId }, select: { branding: true } });
  return parseBranding(guild?.branding);
}

/** Upload a guild logo. Manager-only, hardened against malicious uploads. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> },
) {
  const { guildId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!(await canManageForms(guildId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  if (!s3Enabled()) {
    return NextResponse.json({ error: "File storage is not available." }, { status: 503 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file." }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Logo must be 1 byte–1 MB." }, { status: 413 });
  }

  const input = new Uint8Array(await file.arrayBuffer());

  // 1) Reject anything that isn't a known raster image by its real bytes
  //    (no SVG → no script; ignore the client-declared MIME entirely).
  if (!sniffRasterImage(input)) {
    return NextResponse.json(
      { error: "Only PNG, JPEG, WebP or GIF images are allowed." },
      { status: 415 },
    );
  }

  // 2) Decode + re-encode with sharp: this strips any hidden payload, EXIF,
  //    color profiles, or polyglot tricks — only pixels survive. Bounded
  //    input pixels guard against decompression bombs. Animated GIF/WebP logos
  //    are re-encoded as animated WebP so they keep moving (read with
  //    `animated: true`; skip EXIF auto-rotate, which doesn't apply to frames).
  let webp: Buffer;
  try {
    const animated = ((await sharp(input).metadata()).pages ?? 1) > 1;
    const pipeline = sharp(input, { animated, limitInputPixels: 40_000_000, failOn: "error" });
    if (!animated) pipeline.rotate();
    webp = await pipeline
      .resize(MAX_DIM, MAX_DIM, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 88 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "That image couldn't be processed." }, { status: 422 });
  }

  const branding = await loadBranding(guildId);
  const key = `branding/${guildId}/${crypto.randomUUID()}.webp`;
  try {
    await putObject(key, new Uint8Array(webp), "image/webp");
  } catch (err) {
    console.error("[logo] storage error:", (err as Error).message);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 502 });
  }

  // Swap in the new key, then best-effort remove the old object.
  const previous = branding.logoKey;
  await prisma.guild.update({
    where: { id: guildId },
    data: { branding: { ...branding, logoKey: key } as Prisma.InputJsonValue },
  });
  if (previous && previous !== key) await deleteObject(previous);

  return NextResponse.json({ ok: true });
}

/** Remove a guild logo. Manager-only. */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> },
) {
  const { guildId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!(await canManageForms(guildId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const branding = await loadBranding(guildId);
  if (branding.logoKey) {
    const { logoKey, ...rest } = branding;
    void logoKey;
    await prisma.guild.update({
      where: { id: guildId },
      data: { branding: rest as Prisma.InputJsonValue },
    });
    await deleteObject(branding.logoKey);
  }
  return NextResponse.json({ ok: true });
}
