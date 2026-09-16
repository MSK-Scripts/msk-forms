import { enqueueGuildLog, prisma } from "@msk-forms/db";
import {
  AUDIT_WEBHOOK_KIND,
  auditActionFromEvent,
  auditEvent,
  auditWebhookUpdateSchema,
} from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { actor } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth";
import { actorLine, postDiscordEmbed } from "@/lib/discord-webhook";
import { canManageForms } from "@/lib/guild";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ guildId: string; hookId: string }> };

async function authorize(guildId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  if (!(await canManageForms(guildId, user.id))) {
    return { error: NextResponse.json({ error: "Forbidden." }, { status: 403 }) };
  }
  return { user };
}

/**
 * Change what an audit hook receives, rename it, rescope it, or switch it on or
 * off (manager-only). The URL is deliberately not editable: it carries the
 * token, and a changed URL is a different webhook, so remove and re-add.
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  const { guildId, hookId } = await params;
  const auth = await authorize(guildId);
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const parsed = auditWebhookUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 422 },
    );
  }
  const input = parsed.data;

  const hook = await prisma.webhook.findFirst({
    where: { id: hookId, guildId, kind: AUDIT_WEBHOOK_KIND },
    select: { id: true, name: true, events: true, active: true, formId: true },
  });
  if (!hook) return NextResponse.json({ error: "Webhook not found." }, { status: 404 });

  if (input.formId) {
    const form = await prisma.form.findFirst({
      where: { id: input.formId, guildId },
      select: { id: true },
    });
    if (!form) return NextResponse.json({ error: "Form not found." }, { status: 422 });
  }

  const changes: string[] = [];
  if (input.active !== undefined && input.active !== hook.active) {
    changes.push(input.active ? "enabled" : "disabled");
  }
  if (input.actions) {
    const before = new Set(hook.events.map(auditActionFromEvent).filter(Boolean) as string[]);
    const after = new Set<string>(input.actions);
    const added = [...after].filter((a) => !before.has(a));
    const removed = [...before].filter((a) => !after.has(a));
    if (added.length) changes.push(`now also logs ${added.join(", ")}`);
    if (removed.length) changes.push(`no longer logs ${removed.join(", ")}`);
  }
  if (input.formId !== undefined && (input.formId ?? null) !== hook.formId) {
    changes.push(input.formId ? "scoped to one form" : "scoped to every form");
  }
  if (input.name !== undefined && (input.name || null) !== hook.name) {
    changes.push(`renamed to "${input.name || "Discord webhook"}"`);
  }

  const updated = await prisma.$transaction(async (tx) => {
    // Log before applying, so the entry still reaches this hook when the change
    // switches it off or unsubscribes it from webhook changes. Removing
    // yourself from the trail should leave a last line in it.
    if (changes.length) {
      await enqueueGuildLog(tx, guildId, {
        action: "webhook_updated",
        ...actor(user),
        detail: `Audit log "${hook.name ?? "Discord webhook"}": ${changes.join("; ")}`,
      });
    }
    return tx.webhook.update({
      where: { id: hook.id },
      data: {
        ...(input.active !== undefined ? { active: input.active } : {}),
        ...(input.actions ? { events: input.actions.map(auditEvent) } : {}),
        ...(input.formId !== undefined ? { formId: input.formId ?? null } : {}),
        ...(input.name !== undefined ? { name: input.name || null } : {}),
      },
      select: { id: true, name: true, events: true, active: true, formId: true },
    });
  });

  return NextResponse.json({ webhook: updated });
}

/**
 * Remove an audit hook (manager-only). Its queued deliveries go with it, so the
 * hook gets one last message straight away saying who removed it. Without that,
 * whoever wants to hide something could simply delete the log first.
 */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { guildId, hookId } = await params;
  const auth = await authorize(guildId);
  if ("error" in auth) return auth.error;
  const { user } = auth;

  const hook = await prisma.webhook.findFirst({
    where: { id: hookId, guildId, kind: AUDIT_WEBHOOK_KIND },
    select: { id: true, name: true, url: true, active: true },
  });
  if (!hook) return NextResponse.json({ error: "Webhook not found." }, { status: 404 });

  const t = (await getDict()).auditLog;
  await postDiscordEmbed(hook.url, {
    title: `🪝 ${t.removedTitle}`,
    description: t.removedBody,
    color: 0xff5252,
    fields: [{ name: t.byLabel, value: actorLine(user) }],
  });

  await prisma.$transaction(async (tx) => {
    await tx.webhook.delete({ where: { id: hook.id } });
    // After the delete, so the entry goes to the remaining hooks and the log channel.
    await enqueueGuildLog(tx, guildId, {
      action: "webhook_deleted",
      ...actor(user),
      detail: `Audit log "${hook.name ?? "Discord webhook"}" removed`,
    });
  });

  return NextResponse.json({ ok: true });
}
