import { prisma } from "@msk-forms/db";
import {
  AUDIT_WEBHOOK_KIND,
  auditActionFromEvent,
  maskDiscordWebhookUrl,
  parseBotConfig,
  type LogAction,
} from "@msk-forms/shared";
import type { Route } from "next";
import Link from "next/link";

import { AuditLogManager, type AuditHookRow } from "@/components/audit-log/audit-log-manager";
import { EmptyState, Notice, PageHeader } from "@/components/dashboard-kit";
import { requireUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AuditLogPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/audit-log`);
  const dict = await getDict();
  const t = dict.auditLog;

  if (!(await canManageForms(guildId, user.id))) {
    return (
      <>
        <PageHeader title={t.title} />
        <EmptyState kind="unavailable" title={t.noPerm} />
      </>
    );
  }

  const [rawHooks, forms, guild] = await Promise.all([
    prisma.webhook.findMany({
      where: { guildId, kind: AUDIT_WEBHOOK_KIND },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, url: true, events: true, active: true, formId: true },
    }),
    prisma.form.findMany({
      where: { guildId },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    }),
    prisma.guild.findUnique({ where: { id: guildId }, select: { botConfig: true } }),
  ]);

  const latest = rawHooks.length
    ? await prisma.webhookDelivery.findMany({
        where: { webhookId: { in: rawHooks.map((h) => h.id) } },
        orderBy: { createdAt: "desc" },
        distinct: ["webhookId"],
        select: {
          webhookId: true,
          status: true,
          lastError: true,
          createdAt: true,
          deliveredAt: true,
        },
      })
    : [];
  const lastByHook = new Map(latest.map((d) => [d.webhookId, d]));

  // The full URL carries the webhook token, so it never leaves the server.
  const hooks: AuditHookRow[] = rawHooks.map((h) => {
    const d = lastByHook.get(h.id);
    return {
      id: h.id,
      name: h.name,
      maskedUrl: maskDiscordWebhookUrl(h.url),
      actions: h.events.map(auditActionFromEvent).filter((a): a is LogAction => a !== null),
      active: h.active,
      formId: h.formId,
      lastDelivery: d
        ? { status: d.status, error: d.lastError, at: (d.deliveredAt ?? d.createdAt).toISOString() }
        : null,
    };
  });

  const hasLogChannel = Boolean(parseBotConfig(guild?.botConfig).logChannelId);

  return (
    <>
      <PageHeader title={t.title} description={t.intro} />
      <div className="grid gap-[var(--app-gutter-y)]">
        {hasLogChannel && (
          <Notice
            tone="info"
            action={
              <Link
                href={`/dashboard/${guildId}/bot` as Route}
                prefetch={false}
                className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline"
              >
                {dict.dashboard.botTab}
              </Link>
            }
          >
            {t.channelNote}
          </Notice>
        )}
        <AuditLogManager
          guildId={guildId}
          initial={hooks}
          forms={forms}
          t={t}
          kit={{ dismiss: dict.kit.dismiss }}
        />
      </div>
    </>
  );
}
