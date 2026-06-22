import { prisma } from "@msk-forms/db";
import { Card } from "@msk-forms/ui";

import { ProNotice } from "@/components/pro-notice";
import { WebhooksManager, type WebhookRow } from "@/components/webhooks/webhooks-manager";
import { requireUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";
import { isGuildPro } from "@/lib/plan";
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
        <ProNotice title={dict.pro.title} body={dict.pro.body} />
      </div>
    );
  }

  const webhooks = (await prisma.webhook.findMany({
    where: { guildId },
    orderBy: { createdAt: "asc" },
    select: { id: true, url: true, secret: true, events: true, active: true },
  })) as WebhookRow[];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-semibold text-foreground">{t.title}</h2>
        <p className="text-sm text-muted-foreground">{t.intro}</p>
      </div>
      <WebhooksManager guildId={guildId} initial={webhooks} t={t} />
    </div>
  );
}
