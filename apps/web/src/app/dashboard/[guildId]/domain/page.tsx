import { prisma } from "@msk-forms/db";
import { Card } from "@msk-forms/ui";

import { UpgradeActions } from "@/components/billing/upgrade-button";
import { CaptchaForm } from "@/components/domain/captcha-form";
import { DomainForm } from "@/components/domain/domain-form";
import { OAuthForm } from "@/components/domain/oauth-form";
import { ProNotice } from "@/components/pro-notice";
import { requireUser } from "@/lib/auth";
import { primaryHostname } from "@/lib/custom-domain";
import { canManageForms } from "@/lib/guild";
import { isGuildPro } from "@/lib/plan";
import { enterpriseEnabled, stripeEnabled } from "@/lib/stripe";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DomainPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/domain`);
  const dict = await getDict();
  const t = dict.domain;

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

  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: {
      customDomain: true,
      customDomainToken: true,
      customDomainVerifiedAt: true,
      oauthClientId: true,
      oauthClientSecret: true,
      captchaSiteKey: true,
      captchaSecret: true,
    },
  });
  const verifiedDomain = guild?.customDomainVerifiedAt ? (guild.customDomain ?? "") : "";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-semibold text-foreground">{t.title}</h2>
        <p className="text-sm text-muted-foreground">{t.intro}</p>
      </div>
      <DomainForm
        guildId={guildId}
        cnameTarget={primaryHostname()}
        initial={{
          domain: guild?.customDomain ?? "",
          token: guild?.customDomainToken ?? "",
          verified: Boolean(guild?.customDomainVerifiedAt),
        }}
        t={t}
      />
      <OAuthForm
        guildId={guildId}
        customDomain={verifiedDomain}
        initial={{ clientId: guild?.oauthClientId ?? "", hasSecret: Boolean(guild?.oauthClientSecret) }}
        t={t.oauth}
      />
      <CaptchaForm
        guildId={guildId}
        customDomain={verifiedDomain}
        initial={{ siteKey: guild?.captchaSiteKey ?? "", hasSecret: Boolean(guild?.captchaSecret) }}
        t={t.captcha}
      />
    </div>
  );
}
