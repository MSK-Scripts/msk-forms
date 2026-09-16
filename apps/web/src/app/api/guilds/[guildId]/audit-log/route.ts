import { randomBytes } from "node:crypto";

import { enqueueGuildLog, prisma } from "@msk-forms/db";
import {
  AUDIT_WEBHOOK_KIND,
  auditEvent,
  auditWebhookInputSchema,
  MAX_AUDIT_WEBHOOKS,
} from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { actor } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";
import { checkDiscordWebhook } from "@/lib/discord-webhook";
import { canManageForms } from "@/lib/guild";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Add an audit-log webhook (manager-only, every plan). The URL is checked
 * against Discord before it is saved, so a typo shows up here and not as a
 * silently failing delivery a day later.
 */
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

  const rl = await rateLimit(`audit-hook:${guildId}`, 10, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const parsed = auditWebhookInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid webhook.", code: "invalid" },
      { status: 422 },
    );
  }
  const input = parsed.data;

  const count = await prisma.webhook.count({ where: { guildId, kind: AUDIT_WEBHOOK_KIND } });
  if (count >= MAX_AUDIT_WEBHOOKS) {
    return NextResponse.json({ error: "Too many webhooks.", code: "limit" }, { status: 422 });
  }

  const formId = input.formId ?? null;
  let formTitle: string | undefined;
  if (formId) {
    const form = await prisma.form.findFirst({
      where: { id: formId, guildId },
      select: { title: true },
    });
    if (!form) return NextResponse.json({ error: "Form not found." }, { status: 422 });
    formTitle = form.title;
  }

  const check = await checkDiscordWebhook(input.url);
  if (!check.ok) {
    return NextResponse.json(
      { error: "Discord did not accept this webhook URL.", code: check.reason },
      { status: 422 },
    );
  }

  const name = input.name || check.name || null;
  const created = await prisma.$transaction(async (tx) => {
    const hook = await tx.webhook.create({
      data: {
        guildId,
        kind: AUDIT_WEBHOOK_KIND,
        format: "discord",
        name,
        url: input.url,
        events: input.actions.map(auditEvent),
        formId,
        // Unused for Discord (it verifies no signature), but the column is required.
        secret: randomBytes(24).toString("hex"),
      },
      select: { id: true, name: true, events: true, active: true, formId: true },
    });
    // Enqueued after the insert, so the new hook receives its own creation
    // entry when it subscribed to webhook changes: an immediate sign of life.
    await enqueueGuildLog(tx, guildId, {
      action: "webhook_created",
      ...actor(user),
      detail: `Audit log "${name ?? "Discord webhook"}": ${input.actions.length} event types${
        formTitle ? `, only ${formTitle}` : ""
      }`,
    });
    return hook;
  });

  return NextResponse.json({ webhook: created }, { status: 201 });
}
