import { acceptedRoleIdsOf, parseFormSettings } from "@msk-forms/shared";
import { notFound } from "next/navigation";

import { FormBuilder } from "@/components/builder/form-builder";
import { EmptyState, PageHeader } from "@/components/dashboard-kit";
import { dateLabels } from "@/components/form/form-labels";
import { getDict } from "@/i18n";
import { requireUser } from "@/lib/auth";
import {
  getFormForEdit,
  getGuildCategories,
  getStatusOptionsForGuild,
  parseFormSpec,
} from "@/lib/forms";
import { canManageForm } from "@/lib/guild";
import { isGuildPro } from "@/lib/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function EditFormPage({
  params,
}: {
  params: Promise<{ guildId: string; formId: string }>;
}) {
  const { guildId, formId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/forms/${formId}/edit`);
  const t = await getDict();
  if (!(await canManageForm(guildId, user.id, formId))) {
    return (
      <>
        <PageHeader
          title={t.dashboard.editFormTitle}
          breadcrumbs={[
            { label: t.dashboard.formsTab, href: `/dashboard/${guildId}/forms` },
            { label: t.dashboard.editFormTitle },
          ]}
          breadcrumbLabel={t.kit.breadcrumb}
        />
        <EmptyState kind="unavailable" title={t.dashboard.noPermEdit} />
      </>
    );
  }

  const form = await getFormForEdit(formId, guildId);
  if (!form) notFound();

  const spec = parseFormSpec(form.schema);
  const settings = parseFormSettings(form.settings);
  const [statusOpts, categories, pro] = await Promise.all([
    getStatusOptionsForGuild(guildId, t.statusLabels),
    getGuildCategories(guildId),
    isGuildPro(guildId),
  ]);

  return (
    <FormBuilder
      guildId={guildId}
      formId={form.id}
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
      dateLabels={dateLabels(t)}
      initial={{
        title: form.title,
        description: form.description ?? "",
        slug: form.slug,
        status: form.status,
        visibility: form.visibility,
        acceptedRoles: acceptedRoleIdsOf(settings).join(", "),
        reviewChannelId: settings.reviewChannelId ?? "",
        openAt: form.openAt?.toISOString() ?? "",
        closeAt: form.closeAt?.toISOString() ?? "",
        showCountdown: settings.showCountdown === true,
        singleSubmission: settings.singleSubmission !== false,
        categoryId: form.categoryId,
        pages: spec?.pages.length ? spec.pages : [{ id: "p1", title: "", fields: [] }],
        automations: settings.automations,
        experiment: settings.experiment ?? { enabled: false, variants: [] },
        statusMessages: settings.statusMessages ?? {},
      }}
    />
  );
}
