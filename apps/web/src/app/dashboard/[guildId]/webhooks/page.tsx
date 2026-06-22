import { prisma } from "@msk-forms/db";
import { Card } from "@msk-forms/ui";

import { WebhooksManager, type WebhookRow } from "@/components/webhooks/webhooks-manager";
import { requireUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";
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
  const t = (await getDict()).webhooks;

  if (!(await canManageForms(guildId, user.id))) {
    return (
      <Card className="p-8">
        <p className="text-muted-foreground">{t.noPerm}</p>
      </Card>
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
