import { prisma } from "@msk-forms/db";
import { Card } from "@msk-forms/ui";

import { UpgradeActions } from "@/components/billing/upgrade-button";
import { ProNotice } from "@/components/pro-notice";
import { WebhooksManager, type WebhookRow } from "@/components/webhooks/webhooks-manager";
import { requireUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";
import { isGuildPro } from "@/lib/plan";
import { enterpriseEnabled, stripeEnabled } from "@/lib/stripe";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function WebhooksPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/webhooks`);
  const dict = await getDict();
  const t = dict.webhooks;

  if (!(await canManageForms(guildId, user.id))) {
    return (
      <Card className="p-8">
        <p className="text-muted-foreground">{t.noPerm}</p>
      </Card>
    );
  }

  if (!(await isGuildPro(guildId))) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">{t.title}</h2>
        <ProNotice
          title={dict.pro.title}
          body={dict.pro.body}
          action={
            stripeEnabled() ? (
              <UpgradeActions
                guildId={guildId}
                proLabel={dict.pro.upgrade}
                enterpriseLabel={enterpriseEnabled() ? dict.pro.upgradeEnterprise : undefined}
              />
            ) : undefined
          }
        />
      </div>
    );
  }

  const [rawWebhooks, forms] = await Promise.all([
    prisma.webhook.findMany({
      where: { guildId },
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-semibold text-foreground">{t.title}</h2>
        <p className="text-sm text-muted-foreground">{t.intro}</p>
      </div>
      <WebhooksManager guildId={guildId} initial={webhooks} forms={forms} t={t} />
    </div>
  );
}
