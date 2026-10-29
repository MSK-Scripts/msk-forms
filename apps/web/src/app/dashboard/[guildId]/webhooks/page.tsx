import { prisma } from "@msk-forms/db";

import { UpgradeActions } from "@/components/billing/upgrade-button";
import { EmptyState, PageHeader } from "@/components/dashboard-kit";
import { ProNotice } from "@/components/pro-notice";
import { WebhooksManager, type WebhookRow } from "@/components/webhooks/webhooks-manager";
import { requireUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";
import { isGuildPro } from "@/lib/plan";
import { enterpriseEnabled, stripeEnabled } from "@/lib/stripe";
import { upgradeCopy } from "@/lib/upgrade-copy";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function WebhooksPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/webhooks`);
  const dict = await getDict();
  const t = dict.webhooks;

  if (!(await canManageForms(guildId, user.id))) {
    return (
      <>
        <PageHeader title={t.title} />
        <EmptyState kind="unavailable" title={t.noPerm} />
      </>
    );
  }

  if (!(await isGuildPro(guildId))) {
    return (
      <>
        <PageHeader title={t.title} description={t.intro} />
        <ProNotice
          title={dict.pro.title}
          body={dict.pro.body}
          action={
            stripeEnabled() ? (
              <UpgradeActions
                guildId={guildId}
                copy={await upgradeCopy()}
                proLabel={dict.pro.upgrade}
                enterpriseLabel={enterpriseEnabled() ? dict.pro.upgradeEnterprise : undefined}
              />
            ) : undefined
          }
        />
      </>
    );
  }

  const [rawWebhooks, forms] = await Promise.all([
    prisma.webhook.findMany({
      // Audit-log hooks have their own page.
      where: { guildId, kind: "event" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        url: true,
        secret: true,
        events: true,
        active: true,
        source: true,
        format: true,
        formId: true,
      },
    }),
    prisma.form.findMany({
      where: { guildId },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    }),
  ]);

  // Latest delivery per webhook, so the dashboard can show whether events are
  // actually getting through (the top reason a "test submission didn't log").
  const latest = await prisma.webhookDelivery.findMany({
    where: { webhookId: { in: rawWebhooks.map((w) => w.id) } },
    orderBy: { createdAt: "desc" },
    distinct: ["webhookId"],
    select: { webhookId: true, status: true, lastError: true, createdAt: true, deliveredAt: true },
  });
  const lastByHook = new Map(latest.map((d) => [d.webhookId, d]));

  const webhooks: WebhookRow[] = rawWebhooks.map((w) => {
    const d = lastByHook.get(w.id);
    return {
      ...w,
      lastDelivery: d
        ? {
            status: d.status,
            error: d.lastError,
            at: (d.deliveredAt ?? d.createdAt).toISOString(),
          }
        : null,
    };
  });

  return (
    <>
      <PageHeader title={t.title} description={t.intro} />
      <WebhooksManager
        guildId={guildId}
        initial={webhooks}
        forms={forms}
        t={t}
        kit={{ copyField: dict.kit.copyField, dismiss: dict.kit.dismiss }}
      />
    </>
  );
}
