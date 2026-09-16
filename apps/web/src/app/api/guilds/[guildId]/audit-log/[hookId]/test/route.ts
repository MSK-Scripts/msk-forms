import { prisma } from "@msk-forms/db";
import { AUDIT_WEBHOOK_KIND } from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { actorLine, postDiscordEmbed } from "@/lib/discord-webhook";
import { canManageForms } from "@/lib/guild";
import { rateLimit } from "@/lib/rate-limit";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Send a test entry to an audit hook right now and report whether Discord took
 * it. Synchronous on purpose: the point is an answer while the user is still
 * looking at the page, not a queued row they have to come back for.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ guildId: string; hookId: string }> },
) {
  const { guildId, hookId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!(await canManageForms(guildId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const rl = await rateLimit(`audit-hook-test:${guildId}`, 5, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests.", code: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const hook = await prisma.webhook.findFirst({
    where: { id: hookId, guildId, kind: AUDIT_WEBHOOK_KIND },
    select: { url: true },
  });
  if (!hook) return NextResponse.json({ error: "Webhook not found." }, { status: 404 });

  const t = (await getDict()).auditLog;
  const failure = await postDiscordEmbed(hook.url, {
    title: `🧪 ${t.testTitle}`,
    description: t.testBody,
    color: 0x5865f2,
    fields: [{ name: t.byLabel, value: actorLine(user) }],
  });
  if (failure) {
    return NextResponse.json({ error: "Delivery failed.", code: failure }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
