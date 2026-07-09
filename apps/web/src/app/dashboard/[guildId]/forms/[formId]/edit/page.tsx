import { Card } from "@msk-forms/ui";
import { notFound } from "next/navigation";

import { acceptedRoleIdsOf, parseFormSettings } from "@msk-forms/shared";

import { FormBuilder } from "@/components/builder/form-builder";
import { requireUser } from "@/lib/auth";
import {
  getFormForEdit,
  getGuildCategories,
  getStatusOptionsForGuild,
  parseFormSpec,
} from "@/lib/forms";
import { canManageForm } from "@/lib/guild";
import { isGuildPro } from "@/lib/plan";
import { getDict } from "@/i18n";

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
      <Card className="p-8">
        <p className="text-muted-foreground">{t.dashboard.noPermEdit}</p>
      </Card>
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
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-semibold text-foreground">
        {t.dashboard.editFormTitle}
      </h2>
      <FormBuilder
        guildId={guildId}
        formId={form.id}
        t={t.builder}
        statusOptions={statusOpts}
        categories={categories}
        isPro={pro}
        automationsProBody={t.pro.automationsBody}
        experimentProBody={t.pro.experimentBody}
        dateLabels={{ today: t.form.dateToday, clear: t.form.dateClear, now: t.form.dateNow }}
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
        }}
      />
    </div>
  );
}
