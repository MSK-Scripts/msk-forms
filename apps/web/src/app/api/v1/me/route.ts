import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@msk-forms/db";

import { authorizeV1 } from "@/lib/v1-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Connection test for integration platforms (Zapier/Make "test auth"). Returns
 * the API key's guild so the platform can label the connection. Enterprise-only.
 */
export async function GET(request: NextRequest) {
  const auth = await authorizeV1(request);
  if (auth instanceof NextResponse) return auth;

  const guild = await prisma.guild.findUnique({
    where: { id: auth.guildId },
    select: { id: true, name: true },
  });
  if (!guild) {
    return NextResponse.json({ error: "Guild not found." }, { status: 404 });
  }

  return NextResponse.json(
    { guildId: guild.id, guildName: guild.name, plan: "enterprise" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
