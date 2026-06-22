import { prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";

import { generateApiKey } from "@/lib/api-key";
import { getCurrentUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";
import { isGuildEnterprise } from "@/lib/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_KEYS = 10;

/** List a guild's API keys (metadata only — the secret is never returned). Manager-only. */
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

  const keys = await prisma.apiKey.findMany({
    where: { guildId },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, lastUsedAt: true, createdAt: true },
  });
  return NextResponse.json({ keys });
}

/** Create an API key (Enterprise + manager). Returns the plaintext secret once. */
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
  if (!(await isGuildEnterprise(guildId))) {
    return NextResponse.json(
      { error: "The API is an Enterprise feature.", code: "enterprise_required" },
      { status: 402 },
    );
  }

  const body = (await request.json().catch(() => null)) as { name?: unknown } | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 60) {
    return NextResponse.json({ error: "A name is required." }, { status: 422 });
  }
  if ((await prisma.apiKey.count({ where: { guildId } })) >= MAX_KEYS) {
    return NextResponse.json({ error: "Too many API keys." }, { status: 422 });
  }

  const { plain, hash } = generateApiKey();
  const key = await prisma.apiKey.create({
    data: { guildId, name, hashedKey: hash },
    select: { id: true, name: true, createdAt: true },
  });
  // The plaintext is shown exactly once — only the hash is stored.
  return NextResponse.json({ key, secret: plain }, { status: 201 });
}
