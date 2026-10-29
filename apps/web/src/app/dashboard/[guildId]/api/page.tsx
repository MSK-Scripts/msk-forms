import { prisma } from "@msk-forms/db";

import { ApiKeysManager, type ApiKeyRow } from "@/components/api/api-keys-manager";
import { IntegrationsCard } from "@/components/api/integrations-card";
import { UpgradeActions } from "@/components/billing/upgrade-button";
import { EmptyState, PageHeader } from "@/components/dashboard-kit";
import { ProNotice } from "@/components/pro-notice";
import { requireUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";
import { isGuildEnterprise } from "@/lib/plan";
import { enterpriseEnabled, stripeEnabled } from "@/lib/stripe";
import { upgradeCopy } from "@/lib/upgrade-copy";
import { appBaseUrl } from "@/lib/url";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ApiPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/api`);
  const dict = await getDict();
  const t = dict.api;

  if (!(await canManageForms(guildId, user.id))) {
    return (
      <>
        <PageHeader title={t.title} />
        <EmptyState kind="unavailable" title={t.noPerm} />
      </>
    );
  }

  if (!(await isGuildEnterprise(guildId))) {
    return (
      <>
        <PageHeader title={t.title} description={t.intro} />
        <ProNotice
          title={t.enterpriseTitle}
          body={t.enterpriseBody}
          action={
            stripeEnabled() && enterpriseEnabled() ? (
              <UpgradeActions
                guildId={guildId}
                copy={await upgradeCopy()}
                enterpriseLabel={dict.pro.upgradeEnterprise}
              />
            ) : undefined
          }
        />
      </>
    );
  }

  const keys = (await prisma.apiKey.findMany({
    where: { guildId },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, lastUsedAt: true, createdAt: true },
  })) as ApiKeyRow[];

  return (
    <>
      <PageHeader title={t.title} description={t.intro} />
      <div className="grid gap-[var(--app-gutter-y)]">
        <ApiKeysManager
          guildId={guildId}
          initial={keys}
          baseUrl={appBaseUrl()}
          t={t}
          kit={{ copyField: dict.kit.copyField, dismiss: dict.kit.dismiss }}
        />
        <IntegrationsCard baseUrl={appBaseUrl()} t={t} />
      </div>
    </>
  );
}
