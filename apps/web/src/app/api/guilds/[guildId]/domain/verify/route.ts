import { resolveTxt } from "node:dns/promises";

import { prisma } from "@msk-forms/db";
import { verificationRecordName, verificationRecordValue } from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Verify domain ownership via the DNS TXT challenge. Owner/admin only. */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string }> },
) {
  const { guildId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!(await canManageForms(guildId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { customDomain: true, customDomainToken: true, customDomainVerifiedAt: true },
  });
  if (!guild?.customDomain || !guild.customDomainToken) {
    return NextResponse.json({ error: "No domain to verify." }, { status: 422 });
  }
  if (guild.customDomainVerifiedAt) {
    return NextResponse.json({ verified: true });
  }

  const expected = verificationRecordValue(guild.customDomainToken);
  let found = false;
  try {
    const records = await resolveTxt(verificationRecordName(guild.customDomain));
    // Each record is an array of string chunks; join then compare.
    found = records.some((chunks) => chunks.join("").trim() === expected);
  } catch {
    found = false; // NXDOMAIN / no TXT yet
  }

  if (!found) {
    return NextResponse.json({ verified: false });
  }

  await prisma.guild.update({
    where: { id: guildId },
    data: { customDomainVerifiedAt: new Date() },
  });
  return NextResponse.json({ verified: true });
}
