import { prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";

import { parseBranding } from "@/lib/branding";
import { getObject } from "@/lib/s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stream a guild's logo (public branding asset). Always served as image/webp
 * (logos are re-encoded to WebP on upload) with nosniff, so the response can't
 * be reinterpreted as another content type.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> },
) {
  const { guildId } = await params;

  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { branding: true },
  });
  const key = parseBranding(guild?.branding).logoKey;
  if (!key) return NextResponse.json({ error: "No logo." }, { status: 404 });

  const object = await getObject(key);
  if (!object) return NextResponse.json({ error: "No logo." }, { status: 404 });

  return new NextResponse(object.body, {
    headers: {
      "Content-Type": "image/webp",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=300",
    },
  });
}
