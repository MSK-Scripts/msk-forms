import { prisma } from "@msk-forms/db";
import { experimentActive, FREE_FORM_LIMIT, formScheduleStatus, parseFormSettings } from "@msk-forms/shared";
import type { Route } from "next";
import Link from "next/link";
import QRCode from "qrcode";

import { ManageBillingButton } from "@/components/billing/manage-billing-button";
import { UpgradeActions } from "@/components/billing/upgrade-button";
import { EmptyState, Notice, PageHeader } from "@/components/dashboard-kit";
import { ImportFormButton } from "@/components/dashboard/form-io";
import { formStatus } from "@/components/dashboard/form-state-badge";
import { FormsTable } from "@/components/dashboard/forms-table";
import { Archive, Plus } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { getDict } from "@/i18n";
import { requireUser } from "@/lib/auth";
import {
  canManageForms,
  countArchivedForms,
  getGuildForms,
  getManageScope,
  getReviewScope,
} from "@/lib/guild";
import { getGuildPlan } from "@/lib/plan";
import { enterpriseEnabled, stripeEnabled } from "@/lib/stripe";
import { upgradeCopy } from "@/lib/upgrade-copy";
import { appBaseUrl } from "@/lib/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function GuildFormsPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/forms`);
  const scope = await getReviewScope(guildId, user.id);
  const [forms, canManage, manageScope, plan] = await Promise.all([
    getGuildForms(guildId, scope),
    canManageForms(guildId, user.id),
    getManageScope(guildId, user.id),
    getGuildPlan(guildId),
  ]);
  const archivedCount = await countArchivedForms(guildId, manageScope);
  // Whether the viewer may fully manage a given form (guild manager or a per-form
  // manage grant). Drives the per-form edit/preview/archive/export-definition actions.
  const manages = (formId: string) => manageScope.all || manageScope.formIds.includes(formId);
  // Public form links (share link, QR code) point at the guild's verified
  // custom domain when it has one, falling back to the primary domain otherwise.
  const guildDomain = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { customDomain: true, customDomainVerifiedAt: true },
  });
  const base =
    guildDomain?.customDomain && guildDomain.customDomainVerifiedAt
      ? `https://${guildDomain.customDomain}`
      : appBaseUrl();
  const dict = await getDict();
  const t = dict.dashboard;
  const atFormLimit = !plan.isPro && forms.length >= FREE_FORM_LIMIT;
  // A Pro guild can still move up to Enterprise (Free guilds upgrade on the gated tabs).
  const canUpgradeToEnterprise =
    canManage && stripeEnabled() && enterpriseEnabled() && plan.tier === "pro";
  // Show "Manage subscription" only to guilds that actually pay (not grandfathered).
  const guildBilling =
    canManage && stripeEnabled()
      ? await prisma.guild.findUnique({
          where: { id: guildId },
          select: { stripeSubscriptionId: true },
        })
      : null;

  // Pre-render a QR code (server-side, no client dependency) for each live form.
  const qrByForm: Record<string, string> = {};
  await Promise.all(
    forms
      .filter((f) => f.status === "live")
      .map(async (f) => {
        qrByForm[f.id] = await QRCode.toDataURL(`${base}/f/${f.slug}`, { width: 220, margin: 1 });
      }),
  );

  const now = new Date();
  const newForm =
    canManage &&
    (atFormLimit ? (
      // A button, not a link: there is nowhere to go until the plan allows it.
      <Button disabled aria-describedby="form-limit">
        <Plus className="h-4 w-4" />
        {t.newForm}
      </Button>
    ) : (
      <Button asChild>
        <Link href={`/dashboard/${guildId}/forms/new` as Route} prefetch={false}>
          <Plus className="h-4 w-4" />
          {t.newForm}
        </Link>
      </Button>
    ));
  const tools = [
    archivedCount > 0 && (
      <Button key="archive" asChild variant="outline">
        <Link href={`/dashboard/${guildId}/forms/archived` as Route} prefetch={false}>
          <Archive className="h-4 w-4" />
          {t.formArchive.link}
          <span className="tabular-nums text-muted-foreground">{archivedCount}</span>
        </Link>
      </Button>
    ),
    canManage && plan.isPro && (
      <ImportFormButton
        key="import"
        guildId={guildId}
        t={{ import: t.formIo.import, importing: t.formIo.importing, importErr: t.formIo.importErr }}
      />
    ),
    guildBilling?.stripeSubscriptionId && (
      <ManageBillingButton key="billing" guildId={guildId} label={dict.pro.manage} />
    ),
    canUpgradeToEnterprise && (
      <UpgradeActions
        key="upgrade"
        guildId={guildId}
        copy={await upgradeCopy()}
        enterpriseLabel={dict.pro.upgradeEnterprise}
      />
    ),
  ].filter(Boolean);

  return (
    <>
      <PageHeader
        title={t.formsTab}
        description={`${forms.length} ${forms.length === 1 ? t.countForm : t.countForms}`}
        action={newForm || undefined}
      />

      <div className="grid gap-5">
        {tools.length > 0 && (
          <div role="group" aria-label={t.formsList.tools} className="flex flex-wrap items-start gap-3">
            {tools}
          </div>
        )}

        {atFormLimit && (
          <div id="form-limit">
            <Notice tone="info" title={dict.pro.formLimit} />
          </div>
        )}

        <FormsTable
          guildId={guildId}
          isPro={plan.isPro}
          canManage={canManage}
          rows={forms.map((form) => {
            const status = formStatus(form.status);
            const live = form.status === "live";
            return {
              id: form.id,
              title: form.title,
              slug: form.slug,
              status,
              endingSoon: live && formScheduleStatus(form.openAt, form.closeAt, now).endingSoon,
              openAt: form.openAt?.toISOString() ?? null,
              closeAt: form.closeAt?.toISOString() ?? null,
              submissions: form._count.submissions,
              url: live ? `${base}/f/${form.slug}` : null,
              qr: qrByForm[form.id] ?? null,
              manages: manages(form.id),
              experiment: canManage && experimentActive(parseFormSettings(form.settings).experiment),
            };
          })}
          empty={
            <EmptyState
              kind="first-use"
              title={t.noForms}
              action={
                canManage && !atFormLimit ? (
                  <Button asChild>
                    <Link href={`/dashboard/${guildId}/forms/new` as Route} prefetch={false}>
                      <Plus className="h-4 w-4" />
                      {t.newForm}
                    </Link>
                  </Button>
                ) : undefined
              }
            />
          }
          copy={{
            caption: t.formsTab,
            form: t.colForm,
            status: t.colStatus,
            submissions: t.submissionsTab,
            actions: t.formsList.actions,
            moreFor: t.formsList.moreFor,
            statusLabel: {
              draft: dict.builder.statusDraft,
              live: dict.builder.statusLive,
              closed: dict.builder.statusClosed,
            },
            endingSoon: t.formsList.endingSoon,
            opensAt: dict.form.opensAt,
            closesAt: dict.form.closesAt,
            noLink: t.formsList.noLink,
            edit: t.edit,
            preview: t.preview,
            share: dict.share,
            shareTitle: t.formsList.shareTitle,
            qrAlt: t.formsList.qrAlt,
            close: dict.kit.close,
            copyField: dict.kit.copyField,
            submissionsAs: t.formsList.submissionsAs,
            definition: t.formsList.definition,
            abResults: t.formsList.abResults,
            archive: {
              label: t.formArchive.archive,
              title: t.formArchive.archiveTitle,
              confirm: t.formArchive.archiveConfirm,
              cancel: t.cancel,
              failed: t.formArchive.archiveFailed,
            },
            replace: {
              replace: t.formIo.replace,
              replaceTitle: t.formIo.replaceTitle,
              replaceConfirm: t.formIo.replaceConfirm,
              cancel: t.cancel,
              importErr: t.formIo.importErr,
            },
          }}
        />
      </div>
    </>
  );
}
