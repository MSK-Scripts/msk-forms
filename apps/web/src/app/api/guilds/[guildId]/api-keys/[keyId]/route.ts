import { prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Revoke an API key. Manager-only, scoped to the guild. */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string; keyId: string }> },
) {
  const { guildId, keyId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!(await canManageForms(guildId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const result = await prisma.apiKey.deleteMany({ where: { id: keyId, guildId } });
  if (result.count === 0) {
    return NextResponse.json({ error: "Key not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
