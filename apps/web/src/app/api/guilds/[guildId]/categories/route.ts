import { prisma } from "@msk-forms/db";
import { categoriesSchema } from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** List a guild's form categories (manager-only). */
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

  const categories = await prisma.formCategory.findMany({
    where: { guildId },
    orderBy: { order: "asc" },
    select: { id: true, name: true, color: true, order: true },
  });
  return NextResponse.json({ categories });
}

/**
 * Replace a guild's categories (manager-only). Diff-based so existing ids
 * survive a rename/reorder (and the `Form.categoryId` references that point at
 * them); removed categories are deleted and their forms fall back to
 * uncategorized via the FK SET NULL. Order is assigned by array position.
 */
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

  const parsed = categoriesSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid categories." },
      { status: 422 },
    );
  }
  const incoming = parsed.data;

  // Only ids that already belong to this guild may be updated in place; any
  // other id (stale or from another guild) is treated as a new category here.
  const existing = await prisma.formCategory.findMany({
    where: { guildId },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((c) => c.id));
  const keepIds = incoming
    .map((c) => c.id)
    .filter((id): id is string => !!id && existingIds.has(id));

  const ops = [
    prisma.formCategory.deleteMany({ where: { guildId, id: { notIn: keepIds } } }),
    ...incoming.map((c, i) =>
      c.id && existingIds.has(c.id)
        ? prisma.formCategory.update({
            where: { id: c.id },
            data: { name: c.name, color: c.color ?? null, order: i },
          })
        : prisma.formCategory.create({
            data: { guildId, name: c.name, color: c.color ?? null, order: i },
          }),
    ),
  ];
  await prisma.$transaction(ops);

  // Return the saved set so the client can pick up new ids (avoids re-creating
  // freshly-added rows on a second save).
  const categories = await prisma.formCategory.findMany({
    where: { guildId },
    orderBy: { order: "asc" },
    select: { id: true, name: true, color: true, order: true },
  });
  return NextResponse.json({ categories });
}
