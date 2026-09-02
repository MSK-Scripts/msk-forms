import { prisma } from "@msk-forms/db";
import { FREE_FORM_LIMIT } from "@msk-forms/shared";
import { Card } from "@msk-forms/ui";

import { UpgradeActions } from "@/components/billing/upgrade-button";
import { upgradeCopy } from "@/lib/upgrade-copy";
import { FormBuilder } from "@/components/builder/form-builder";
import { DpaGate } from "@/components/legal/dpa-gate";
import { ProNotice } from "@/components/pro-notice";
import { requireUser } from "@/lib/auth";
import { getGuildCategories, getStatusOptionsForGuild } from "@/lib/forms";
import { canManageForms } from "@/lib/guild";
import { shopLegalUrl } from "@/lib/legal";
import { isGuildPro } from "@/lib/plan";
import { enterpriseEnabled, stripeEnabled } from "@/lib/stripe";
import { getDict, getLocale } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function NewFormPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/forms/new`);
  const t = await getDict();
  if (!(await canManageForms(guildId, user.id))) {
    return (
      <Card className="p-8">
        <p className="text-muted-foreground">{t.dashboard.noPermCreate}</p>
      </Card>
    );
  }

  // Art. 28 GDPR: the agreement has to be in place before the processing
  // starts, and it starts when a live form collects its first answer. Creating
  // a form is the last moment at which nothing has been collected yet, so the
  // builder stays behind this gate until the guild has accepted once.
  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { dpaAcceptedAt: true },
  });
  if (!guild?.dpaAcceptedAt) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          {t.dashboard.newFormTitle}
        </h2>
        <DpaGate
          guildId={guildId}
          t={t.legal}
          href={shopLegalUrl(await getLocale(), "/terms/avv")}
        />
      </div>
    );
  }

  const pro = await isGuildPro(guildId);
  if (!pro && (await prisma.form.count({ where: { guildId } })) >= FREE_FORM_LIMIT) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          {t.dashboard.newFormTitle}
        </h2>
        <ProNotice
          title={t.pro.title}
          body={t.pro.formLimit}
          action={
            stripeEnabled() ? (
              <UpgradeActions
                guildId={guildId}
                copy={await upgradeCopy()}
                proLabel={t.pro.upgrade}
                enterpriseLabel={enterpriseEnabled() ? t.pro.upgradeEnterprise : undefined}
              />
            ) : undefined
          }
        />
      </div>
    );
  }

  const [statusOpts, categories] = await Promise.all([
    getStatusOptionsForGuild(guildId, t.statusLabels),
    getGuildCategories(guildId),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-semibold text-foreground">
        {t.dashboard.newFormTitle}
      </h2>
      <FormBuilder
        guildId={guildId}
        t={t.builder}
        statusOptions={statusOpts}
        categories={categories}
        isPro={pro}
        automationsProBody={t.pro.automationsBody}
        experimentProBody={t.pro.experimentBody}
        dateLabels={{ today: t.form.dateToday, clear: t.form.dateClear, now: t.form.dateNow }}
        initial={{
          title: "",
          description: "",
          slug: "",
          status: "draft",
          visibility: "public",
          acceptedRoles: "",
          reviewChannelId: "",
          openAt: "",
          closeAt: "",
          showCountdown: false,
          singleSubmission: true,
          categoryId: null,
          pages: [{ id: "p1", title: "", fields: [] }],
          automations: [],
          experiment: { enabled: false, variants: [] },
          statusMessages: {},
        }}
      />
    </div>
  );
}
