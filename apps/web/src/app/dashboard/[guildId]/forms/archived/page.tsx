import { Card } from "@msk-forms/ui";
import { IconArrowLeft } from "@tabler/icons-react";
import type { Route } from "next";
import Link from "next/link";

import { FormActionButton } from "@/components/dashboard/form-action-button";
import { LocalDateTime } from "@/components/public/local-datetime";
import { requireUser } from "@/lib/auth";
import { canDeleteForms, getArchivedForms, getManageScope, getReviewScope } from "@/lib/guild";
import { getGuildPlan } from "@/lib/plan";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ArchivedFormsPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/forms/archived`);
  const dict = await getDict();
  const t = dict.dashboard;
  const a = t.formArchive;

  const [manageScope, reviewScope, mayDelete, plan] = await Promise.all([
    getManageScope(guildId, user.id),
    getReviewScope(guildId, user.id),
    canDeleteForms(guildId, user.id),
    getGuildPlan(guildId),
  ]);
  const forms = await getArchivedForms(guildId, manageScope);
  const mayReview = (formId: string) => reviewScope.all || reviewScope.formIds.includes(formId);

  const header = (
    <div className="flex flex-col gap-1">
      <Link
        href={`/dashboard/${guildId}/forms` as Route}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <IconArrowLeft size={16} stroke={1.75} />
        {a.backToForms}
      </Link>
      <h2 className="font-heading text-xl font-semibold text-foreground">{a.title}</h2>
      <p className="text-sm text-muted-foreground">{a.intro}</p>
      {!mayDelete && forms.length > 0 && (
        <p className="text-xs text-muted-foreground">{a.deleteOwnerOnly}</p>
      )}
    </div>
  );

  if (forms.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        {header}
        <Card className="p-8">
          <p className="text-muted-foreground">{a.empty}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {header}
      <div className="flex flex-col gap-2">
        {forms.map((form) => (
          <Card
            key={form.id}
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <span className="truncate font-medium text-foreground">{form.title}</span>
              <span className="text-xs text-muted-foreground">
                {a.archivedOn}{" "}
                {form.archivedAt && <LocalDateTime iso={form.archivedAt.toISOString()} />}
                {form.archivedBy && (
                  <>
                    {" "}
                    {a.archivedBy} <span translate="no">{form.archivedBy.username}</span>
                  </>
                )}
                {" · "}
                {form._count.submissions}{" "}
                {form._count.submissions === 1 ? t.countSubmission : t.countSubmissions}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
              {form._count.submissions > 0 && mayReview(form.id) && (
                <Link
                  href={`/dashboard/${guildId}/forms/archived/${form.id}` as Route}
                  className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {a.viewSubmissions}
                </Link>
              )}
              <FormActionButton
                url={`/api/guilds/${guildId}/forms/${form.id}/archive`}
                method="POST"
                body={{ archived: false }}
                variant="primary"
                t={{
                  label: a.restore,
                  title: a.restoreTitle,
                  confirm: a.restoreConfirm,
                  cancel: t.cancel,
                  failed: a.restoreFailed,
                  codes: plan.isPro ? undefined : { pro_required: dict.pro.formLimit },
                }}
              />
              {mayDelete && (
                <FormActionButton
                  url={`/api/guilds/${guildId}/forms/${form.id}`}
                  method="DELETE"
                  variant="danger"
                  t={{
                    label: a.deleteForever,
                    title: a.deleteForeverTitle,
                    confirm: a.deleteForeverConfirm,
                    cancel: t.cancel,
                    failed: a.deleteForeverFailed,
                  }}
                />
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
