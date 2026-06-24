import { Resolver, resolveTxt } from "node:dns/promises";

import { prisma } from "@msk-forms/db";
import { verificationRecordName, verificationRecordValue } from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { requestDomainSync } from "@/lib/domain-sync";
import { canManageForms } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Resolve TXT records for `name`. We query public resolvers (Cloudflare, then
 * Google) directly before falling back to the host resolver: the host's
 * systemd-resolved often negatively-caches the record from a Verify click made
 * before DNS propagated, and would keep returning NXDOMAIN until that cache
 * expires. Public resolvers give a fresh answer the moment the record is live.
 */
async function lookupTxt(name: string): Promise<string[][]> {
  for (const servers of [["1.1.1.1", "1.0.0.1"], ["8.8.8.8", "8.8.4.4"]]) {
    try {
      const resolver = new Resolver({ timeout: 5000, tries: 2 });
      resolver.setServers(servers);
      const records = await resolver.resolveTxt(name);
      if (records.length > 0) return records;
    } catch {
      // Try the next resolver group.
    }
  }
  try {
    return await resolveTxt(name); // Fallback: host resolver.
  } catch {
    return []; // NXDOMAIN / no TXT yet.
  }
}

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
  const records = await lookupTxt(verificationRecordName(guild.customDomain));
  // Each record is an array of string chunks; join then compare.
  const found = records.some((chunks) => chunks.join("").trim() === expected);

  if (!found) {
    return NextResponse.json({ verified: false });
  }

  await prisma.guild.update({
    where: { id: guildId },
    data: { customDomainVerifiedAt: new Date() },
  });

  // Provision the Apache vhost + TLS certificate immediately instead of waiting
  // up to 3 minutes for the periodic sync timer (best-effort).
  await requestDomainSync();

  return NextResponse.json({ verified: true });
}
