import { prisma } from "@msk-forms/db";
import { FREE_FORM_LIMIT } from "@msk-forms/shared";

import { UpgradeActions } from "@/components/billing/upgrade-button";
import { FormBuilder } from "@/components/builder/form-builder";
import { EmptyState, PageHeader } from "@/components/dashboard-kit";
import { dateLabels } from "@/components/form/form-labels";
import { DpaGate } from "@/components/legal/dpa-gate";
import { ProNotice } from "@/components/pro-notice";
import { getDict, getLocale } from "@/i18n";
import { requireUser } from "@/lib/auth";
import { getGuildCategories, getStatusOptionsForGuild } from "@/lib/forms";
import { canManageForms } from "@/lib/guild";
import { shopLegalUrl } from "@/lib/legal";
import { isGuildPro } from "@/lib/plan";
import { enterpriseEnabled, stripeEnabled } from "@/lib/stripe";
import { upgradeCopy } from "@/lib/upgrade-copy";

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
  // Head of the page while the builder is not shown (no permission, the
  // agreement or the plan limit come first). The builder renders its own.
  const header = (
    <PageHeader
      title={t.dashboard.newFormTitle}
      breadcrumbs={[
        { label: t.dashboard.formsTab, href: `/dashboard/${guildId}/forms` },
        { label: t.dashboard.newFormTitle },
      ]}
      breadcrumbLabel={t.kit.breadcrumb}
    />
  );

  if (!(await canManageForms(guildId, user.id))) {
    return (
      <>
        {header}
        <EmptyState kind="unavailable" title={t.dashboard.noPermCreate} />
      </>
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
      <>
        {header}
        <DpaGate guildId={guildId} t={t.legal} href={shopLegalUrl(await getLocale(), "/legal/dpa")} />
      </>
    );
  }

  const pro = await isGuildPro(guildId);
  if (!pro && (await prisma.form.count({ where: { guildId, archivedAt: null } })) >= FREE_FORM_LIMIT) {
    return (
      <>
        {header}
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
      </>
    );
  }

  const [statusOpts, categories] = await Promise.all([
    getStatusOptionsForGuild(guildId, t.statusLabels),
    getGuildCategories(guildId),
  ]);

  return (
    <FormBuilder
      guildId={guildId}
      t={t.builder}
      copy={{
        formsTab: t.dashboard.formsTab,
        newFormTitle: t.dashboard.newFormTitle,
        breadcrumb: t.kit.breadcrumb,
        dismiss: t.kit.dismiss,
        proTitle: t.pro.title,
      }}
      statusOptions={statusOpts}
      categories={categories}
      isPro={pro}
      automationsProBody={t.pro.automationsBody}
      experimentProBody={t.pro.experimentBody}
      dateLabels={dateLabels(t, await getLocale())}
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
  );
}
