import { prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { encryptSecret } from "@/lib/crypto";
import { canManageForms } from "@/lib/guild";
import { isGuildPro } from "@/lib/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Discord application (client) IDs are snowflakes. */
const CLIENT_ID_RE = /^\d{17,20}$/;

/**
 * Set the guild's own Discord OAuth app (Pro+). Lets the guild's custom domain
 * run login end-to-end instead of bouncing to the primary host. Owner/admin only.
 * The client secret is stored encrypted; an empty secret keeps the existing one.
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
  if (!(await isGuildPro(guildId))) {
    return NextResponse.json({ error: "Pro plan required.", code: "pro_required" }, { status: 402 });
  }

  const body = (await request.json().catch(() => null)) as
    | { clientId?: unknown; clientSecret?: unknown }
    | null;
  const clientId = typeof body?.clientId === "string" ? body.clientId.trim() : "";
  const clientSecret = typeof body?.clientSecret === "string" ? body.clientSecret.trim() : "";

  if (!CLIENT_ID_RE.test(clientId)) {
    return NextResponse.json({ error: "Enter a valid Discord application (client) ID." }, { status: 422 });
  }

  const existing = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { oauthClientSecret: true },
  });

  // A blank secret keeps the stored one (so saving the ID alone doesn't wipe it);
  // require a secret the first time it's configured.
  let secretToStore = existing?.oauthClientSecret ?? null;
  if (clientSecret) {
    secretToStore = encryptSecret(clientSecret);
  } else if (!secretToStore) {
    return NextResponse.json({ error: "Enter the client secret." }, { status: 422 });
  }

  await prisma.guild.update({
    where: { id: guildId },
    data: { oauthClientId: clientId, oauthClientSecret: secretToStore },
  });
  return NextResponse.json({ ok: true, hasSecret: true });
}

/** Remove the guild's custom Discord OAuth app. Owner/admin only. */
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
    data: { oauthClientId: null, oauthClientSecret: null },
  });
  return NextResponse.json({ ok: true });
}
