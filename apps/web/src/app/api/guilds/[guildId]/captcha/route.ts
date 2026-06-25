import { prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { encryptSecret } from "@/lib/crypto";
import { canManageForms } from "@/lib/guild";
import { isGuildPro } from "@/lib/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Set the guild's own Cloudflare Turnstile keys (Pro+). Lets the captcha work on
 * the guild's custom domain, where the global site key (hostname-bound) can't.
 * Owner/admin only. The secret is stored encrypted; an empty secret keeps the
 * existing one.
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
    | { siteKey?: unknown; secret?: unknown }
    | null;
  const siteKey = typeof body?.siteKey === "string" ? body.siteKey.trim() : "";
  const secret = typeof body?.secret === "string" ? body.secret.trim() : "";

  if (!siteKey || siteKey.length > 100) {
    return NextResponse.json({ error: "Enter a valid Turnstile site key." }, { status: 422 });
  }
  if (secret.length > 200) {
    return NextResponse.json({ error: "Invalid secret." }, { status: 422 });
  }

  const existing = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { captchaSecret: true },
  });

  let secretToStore = existing?.captchaSecret ?? null;
  if (secret) {
    secretToStore = encryptSecret(secret);
  } else if (!secretToStore) {
    return NextResponse.json({ error: "Enter the secret key." }, { status: 422 });
  }

  await prisma.guild.update({
    where: { id: guildId },
    data: { captchaSiteKey: siteKey, captchaSecret: secretToStore },
  });
  return NextResponse.json({ ok: true, hasSecret: true });
}

/** Remove the guild's custom Turnstile keys. Owner/admin only. */
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
    data: { captchaSiteKey: null, captchaSecret: null },
  });
  return NextResponse.json({ ok: true });
}
