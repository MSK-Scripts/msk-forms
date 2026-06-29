import { prisma } from "@msk-forms/db";
import { experimentActive, FREE_FORM_LIMIT, formScheduleStatus, parseFormSettings } from "@msk-forms/shared";
import { Card, StatusBadge } from "@msk-forms/ui";
import type { Route } from "next";
import Link from "next/link";
import QRCode from "qrcode";

import { ManageBillingButton } from "@/components/billing/manage-billing-button";
import { UpgradeActions } from "@/components/billing/upgrade-button";
import { DeleteFormButton } from "@/components/dashboard/delete-form-button";
import { ImportFormButton, ReplaceFormButton } from "@/components/dashboard/form-io";
import { ShareButton } from "@/components/dashboard/share-button";
import { LocalDateTime } from "@/components/public/local-datetime";
import { requireUser } from "@/lib/auth";
import { appBaseUrl } from "@/lib/url";
import { canManageForms, getGuildForms } from "@/lib/guild";
import { getGuildPlan } from "@/lib/plan";
import { enterpriseEnabled, stripeEnabled } from "@/lib/stripe";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FORM_STATUS_COLORS: Record<string, string> = {
  draft: "#6b6b72",
  live: "#5eb131",
  closed: "#f5a623",
  archived: "#6b6b72",
};

export default async function GuildFormsPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/forms`);
  const [forms, canManage, plan] = await Promise.all([
    getGuildForms(guildId),
    canManageForms(guildId, user.id),
    getGuildPlan(guildId),
  ]);
  const base = appBaseUrl();
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
  const statusLabel: Record<string, string> = {
    draft: dict.builder.statusDraft,
    live: dict.builder.statusLive,
    closed: dict.builder.statusClosed,
    archived: dict.builder.statusArchived,
  };

  // Pre-render a QR code (server-side, no client dependency) for each live form.
  const qrByForm: Record<string, string> = {};
  await Promise.all(
    forms
      .filter((f) => f.status === "live")
      .map(async (f) => {
        qrByForm[f.id] = await QRCode.toDataURL(`${base}/f/${f.slug}`, { width: 220, margin: 1 });
      }),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {forms.length} {forms.length === 1 ? t.countForm : t.countForms}
        </h2>
        <div className="flex items-center gap-2">
        {canUpgradeToEnterprise && (
          <UpgradeActions guildId={guildId} enterpriseLabel={dict.pro.upgradeEnterprise} />
        )}
        {guildBilling?.stripeSubscriptionId && (
          <ManageBillingButton guildId={guildId} label={dict.pro.manage} />
        )}
        {canManage && plan.isPro && (
          <ImportFormButton
            guildId={guildId}
            t={{ import: t.formIo.import, importing: t.formIo.importing, importErr: t.formIo.importErr }}
          />
        )}
        {canManage &&
          (atFormLimit ? (
            <span className="cursor-not-allowed rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
              + {t.newForm}
            </span>
          ) : (
            <Link
              href={`/dashboard/${guildId}/forms/new` as Route}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              + {t.newForm}
            </Link>
          ))}
        </div>
      </div>

      {atFormLimit && (
        <p className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-muted-foreground">
          ★ {dict.pro.formLimit}
        </p>
      )}

      {forms.length === 0 ? (
        <Card className="p-8">
          <p className="text-muted-foreground">{t.noForms}</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {forms.map((form) => {
            const qr = qrByForm[form.id];
            const sched = formScheduleStatus(form.openAt, form.closeAt, new Date());
            return (
              <Card key={form.id} className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="truncate font-medium text-foreground">{form.title}</span>
                      <StatusBadge
                        label={statusLabel[form.status] ?? form.status}
                        color={FORM_STATUS_COLORS[form.status] ?? "#6b6b72"}
                      />
                      {form.status === "live" && sched.endingSoon && (
                        <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                          ⏳ {dict.form.endingSoon}
                        </span>
                      )}
                    </div>
                    {(form.openAt || form.closeAt) && (
                      <span className="text-xs text-muted-foreground">
                        {form.openAt && (
                          <>
                            {dict.form.opensAt} <LocalDateTime iso={form.openAt.toISOString()} />
                          </>
                        )}
                        {form.openAt && form.closeAt && " · "}
                        {form.closeAt && (
                          <>
                            {dict.form.closesAt} <LocalDateTime iso={form.closeAt.toISOString()} />
                          </>
                        )}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {form._count.submissions}{" "}
                      {form._count.submissions === 1 ? t.countSubmission : t.countSubmissions}
                      {form.status === "live" && (
                        <>
                          {" · "}
                          <a
                            href={`${base}/f/${form.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline"
                          >
                            /f/{form.slug}
                          </a>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {form._count.submissions > 0 && (
                      <div className="flex items-center gap-2.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground">
                        <span className="text-xs uppercase tracking-wide">{t.exportLabel}</span>
                        <a
                          href={`/api/guilds/${guildId}/forms/${form.id}/export?format=csv`}
                          className="transition-colors hover:text-foreground"
                        >
                          CSV
                        </a>
                        {plan.isPro && (
                          <>
                            <a
                              href={`/api/guilds/${guildId}/forms/${form.id}/export?format=xlsx`}
                              className="transition-colors hover:text-foreground"
                            >
                              XLSX
                            </a>
                            <a
                              href={`/api/guilds/${guildId}/forms/${form.id}/export?format=json`}
                              className="transition-colors hover:text-foreground"
                            >
                              JSON
                            </a>
                            <a
                              href={`/api/guilds/${guildId}/forms/${form.id}/export?format=pdf`}
                              className="transition-colors hover:text-foreground"
                            >
                              PDF
                            </a>
                          </>
                        )}
                      </div>
                    )}
                    {canManage && plan.isPro && (
                      <a
                        href={`/api/guilds/${guildId}/forms/${form.id}/definition`}
                        className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                      >
                        {t.formIo.export}
                      </a>
                    )}
                    {canManage && (
                      <Link
                        href={`/dashboard/${guildId}/forms/${form.id}/edit` as Route}
                        className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                      >
                        {t.edit}
                      </Link>
                    )}
                    {canManage && plan.isPro && (
                      <ReplaceFormButton
                        guildId={guildId}
                        formId={form.id}
                        t={{
                          replace: t.formIo.replace,
                          replaceTitle: t.formIo.replaceTitle,
                          replaceConfirm: t.formIo.replaceConfirm,
                          cancel: t.cancel,
                          importErr: t.formIo.importErr,
                        }}
                      />
                    )}
                    {canManage && experimentActive(parseFormSettings(form.settings).experiment) && (
                      <Link
                        href={`/dashboard/${guildId}/forms/${form.id}/experiment` as Route}
                        className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                      >
                        {t.experimentLink}
                      </Link>
                    )}
                    {canManage && (
                      <DeleteFormButton
                        guildId={guildId}
                        formId={form.id}
                        t={{
                          delete: t.deleteForm,
                          title: t.deleteFormTitle,
                          confirm: t.deleteFormConfirm,
                          cancel: t.cancel,
                          failed: t.deleteFormFailed,
                        }}
                      />
                    )}
                  </div>
                </div>
                {form.status === "live" && qr && (
                  <ShareButton url={`${base}/f/${form.slug}`} qrDataUrl={qr} t={dict.share} />
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
