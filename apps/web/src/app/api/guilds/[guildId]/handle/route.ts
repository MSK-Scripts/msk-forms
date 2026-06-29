import { Prisma, prisma } from "@msk-forms/db";
import { handleSchema, normalizeHandle } from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Set or clear a guild's public hub handle (the vanity path on the primary
 * domain). Manager-only and free. Sending an empty handle clears it.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> },
) {
  const { guildId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!(await canManageForms(guildId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { handle?: string | null } | null;
  const raw = body?.handle;

  // Empty/null clears the handle.
  if (raw == null || (typeof raw === "string" && raw.trim() === "")) {
    await prisma.guild.update({ where: { id: guildId }, data: { handle: null } });
    return NextResponse.json({ handle: null });
  }
  if (typeof raw !== "string") {
    return NextResponse.json({ error: "Invalid handle." }, { status: 422 });
  }

  const parsed = handleSchema.safeParse(normalizeHandle(raw));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid handle." },
      { status: 422 },
    );
  }

  try {
    await prisma.guild.update({ where: { id: guildId }, data: { handle: parsed.data } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "That handle is already taken." }, { status: 409 });
    }
    throw err;
  }
  return NextResponse.json({ handle: parsed.data });
}
