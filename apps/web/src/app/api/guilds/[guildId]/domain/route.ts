import { randomBytes } from "node:crypto";

import { prisma } from "@msk-forms/db";
import { customDomainSchema } from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { primaryHostname } from "@/lib/custom-domain";
import { canManageForms } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Set (or change) a guild's custom domain. Owner/admin only. Resets verification. */
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

  const parsed = customDomainSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid domain." },
      { status: 422 },
    );
  }
  const domain = parsed.data.domain;

  if (domain === primaryHostname()) {
    return NextResponse.json({ error: "That domain is not allowed." }, { status: 422 });
  }

  // No two guilds can claim the same domain.
  const clash = await prisma.guild.findFirst({
    where: { customDomain: domain, id: { not: guildId } },
    select: { id: true },
  });
  if (clash) {
    return NextResponse.json({ error: "That domain is already in use." }, { status: 409 });
  }

  const current = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { customDomain: true, customDomainToken: true },
  });
  // Keep the token (and verification) when the domain is unchanged.
  const unchanged = current?.customDomain === domain && current?.customDomainToken;
  const token = unchanged ? current!.customDomainToken! : randomBytes(16).toString("hex");

  await prisma.guild.update({
    where: { id: guildId },
    data: {
      customDomain: domain,
      customDomainToken: token,
      ...(unchanged ? {} : { customDomainVerifiedAt: null }),
    },
  });
  return NextResponse.json({ ok: true, token });
}

/** Remove a guild's custom domain. Owner/admin only. */
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

  await prisma.guild.update({
    where: { id: guildId },
    data: { customDomain: null, customDomainToken: null, customDomainVerifiedAt: null },
  });
  return NextResponse.json({ ok: true });
}
