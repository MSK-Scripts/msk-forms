import { prisma } from "@msk-forms/db";
import { Card } from "@msk-forms/ui";

import { UpgradeActions } from "@/components/billing/upgrade-button";
import { ApiKeysManager, type ApiKeyRow } from "@/components/api/api-keys-manager";
import { IntegrationsCard } from "@/components/api/integrations-card";
import { ProNotice } from "@/components/pro-notice";
import { requireUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";
import { isGuildEnterprise } from "@/lib/plan";
import { enterpriseEnabled, stripeEnabled } from "@/lib/stripe";
import { appBaseUrl } from "@/lib/url";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ApiPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/api`);
  const dict = await getDict();
  const t = dict.api;

  if (!(await canManageForms(guildId, user.id))) {
    return (
      <Card className="p-8">
        <p className="text-muted-foreground">{t.noPerm}</p>
      </Card>
    );
  }

  if (!(await isGuildEnterprise(guildId))) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">{t.title}</h2>
        <ProNotice
          title={t.enterpriseTitle}
          body={t.enterpriseBody}
          action={
            stripeEnabled() && enterpriseEnabled() ? (
              <UpgradeActions guildId={guildId} enterpriseLabel={dict.pro.upgradeEnterprise} />
            ) : undefined
          }
        />
      </div>
    );
  }

  const keys = (await prisma.apiKey.findMany({
    where: { guildId },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, lastUsedAt: true, createdAt: true },
  })) as ApiKeyRow[];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-semibold text-foreground">{t.title}</h2>
        <p className="text-sm text-muted-foreground">{t.intro}</p>
      </div>
      <ApiKeysManager guildId={guildId} initial={keys} baseUrl={appBaseUrl()} t={t} />
      <IntegrationsCard baseUrl={appBaseUrl()} t={t} />
    </div>
  );
}
