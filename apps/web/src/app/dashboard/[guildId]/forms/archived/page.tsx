import { EmptyState, Notice, PageHeader } from "@/components/dashboard-kit";
import { ArchivedFormsTable } from "@/components/dashboard/archived-forms-table";
import { getDict } from "@/i18n";
import { requireUser } from "@/lib/auth";
import { canDeleteForms, getArchivedForms, getManageScope, getReviewScope } from "@/lib/guild";
import { getGuildPlan } from "@/lib/plan";

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

  return (
    <>
      <PageHeader
        title={a.title}
        description={a.intro}
        breadcrumbs={[{ label: t.formsTab, href: `/dashboard/${guildId}/forms` }, { label: a.title }]}
        breadcrumbLabel={dict.kit.breadcrumb}
      />
      <div className="grid gap-5">
        {!mayDelete && forms.length > 0 && <Notice tone="info" title={a.deleteOwnerOnly} />}
        <ArchivedFormsTable
          guildId={guildId}
          mayDelete={mayDelete}
          rows={forms.map((form) => ({
            id: form.id,
            title: form.title,
            archivedAt: form.archivedAt?.toISOString() ?? null,
            archivedBy: form.archivedBy?.username ?? null,
            submissions: form._count.submissions,
            mayReview: mayReview(form.id),
          }))}
          empty={<EmptyState kind="no-results" title={a.empty} />}
          copy={{
            caption: a.title,
            form: t.colForm,
            archived: a.archivedOn,
            by: a.archivedBy,
            submissions: t.submissionsTab,
            actions: t.formsList.actions,
            moreFor: t.formsList.moreFor,
            viewSubmissions: a.viewSubmissions,
            typeName: a.typeName,
            restore: {
              label: a.restore,
              title: a.restoreTitle,
              confirm: a.restoreConfirm,
              cancel: t.cancel,
              failed: a.restoreFailed,
              codes: plan.isPro ? undefined : { pro_required: dict.pro.formLimit },
            },
            remove: {
              label: a.deleteForever,
              title: a.deleteForeverTitle,
              confirm: a.deleteForeverConfirm,
              cancel: t.cancel,
              failed: a.deleteForeverFailed,
            },
          }}
        />
      </div>
    </>
  );
}
