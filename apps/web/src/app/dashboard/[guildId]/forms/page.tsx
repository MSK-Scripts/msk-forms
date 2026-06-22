import { prisma } from "@msk-forms/db";
import { FREE_FORM_LIMIT } from "@msk-forms/shared";
import { Card, StatusBadge } from "@msk-forms/ui";
import type { Route } from "next";
import Link from "next/link";
import QRCode from "qrcode";

import { ManageBillingButton } from "@/components/billing/manage-billing-button";
import { DeleteFormButton } from "@/components/dashboard/delete-form-button";
import { ShareButton } from "@/components/dashboard/share-button";
import { requireUser } from "@/lib/auth";
import { appBaseUrl } from "@/lib/url";
import { canManageForms, getGuildForms } from "@/lib/guild";
import { isGuildPro } from "@/lib/plan";
import { stripeEnabled } from "@/lib/stripe";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FORM_STATUS_COLORS: Record<string, string> = {
  draft: "#6b6b72",
  live: "#00E676",
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
  const [forms, canManage, pro] = await Promise.all([
    getGuildForms(guildId),
    canManageForms(guildId, user.id),
    isGuildPro(guildId),
  ]);
  const base = appBaseUrl();
  const dict = await getDict();
  const t = dict.dashboard;
  const atFormLimit = !pro && forms.length >= FREE_FORM_LIMIT;
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
        {guildBilling?.stripeSubscriptionId && (
          <ManageBillingButton guildId={guildId} label={dict.pro.manage} />
        )}
        {atFormLimit ? (
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
        )}
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
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {form._count.submissions} {t.countSubmissions}
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
                      <a
                        href={`/api/guilds/${guildId}/forms/${form.id}/export`}
                        className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                      >
                        {t.exportCsv}
                      </a>
                    )}
                    <Link
                      href={`/dashboard/${guildId}/forms/${form.id}/edit` as Route}
                      className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      {t.edit}
                    </Link>
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
