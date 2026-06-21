import { prisma } from "@msk-forms/db";
import { statusDefsSchema } from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** A guild's custom (guild-level) status definitions, ordered. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> },
) {
  const { guildId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!(await canManageForms(guildId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const defs = await prisma.formStatusDef.findMany({
    where: { guildId, formId: null },
    orderBy: { order: "asc" },
    select: { key: true, label: true, color: true, isTerminal: true, visibleToApplicant: true },
  });
  return NextResponse.json({ statuses: defs });
}

/** Replace a guild's custom status definitions. Owner/admin only. */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> },
) {
  const { guildId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!(await canManageForms(guildId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { statuses?: unknown } | null;
  const parsed = statusDefsSchema.safeParse(body?.statuses);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid statuses." },
      { status: 422 },
    );
  }

  // Replace the guild-level set atomically (order follows array position).
  await prisma.$transaction([
    prisma.formStatusDef.deleteMany({ where: { guildId, formId: null } }),
    prisma.formStatusDef.createMany({
      data: parsed.data.map((d, i) => ({
        guildId,
        key: d.key,
        label: d.label,
        color: d.color,
        isTerminal: d.isTerminal,
        visibleToApplicant: d.visibleToApplicant,
        order: i,
      })),
    }),
  ]);
  return NextResponse.json({ ok: true });
}
