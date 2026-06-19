import { Card } from "@msk-forms/ui";
import { notFound } from "next/navigation";

import { FormBuilder } from "@/components/builder/form-builder";
import { requireUser } from "@/lib/auth";
import { getFormForEdit, parseFormSpec } from "@/lib/forms";
import { canManageForms } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function EditFormPage({
  params,
}: {
  params: Promise<{ guildId: string; formId: string }>;
}) {
  const { guildId, formId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/forms/${formId}/edit`);
  if (!(await canManageForms(guildId, user.id))) {
    return (
      <Card className="p-8">
        <p className="text-text-secondary">You don&apos;t have permission to edit forms.</p>
      </Card>
    );
  }

  const form = await getFormForEdit(formId, guildId);
  if (!form) notFound();

  const spec = parseFormSpec(form.schema);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-semibold text-text-primary">Edit form</h2>
      <FormBuilder
        guildId={guildId}
        formId={form.id}
        initial={{
          title: form.title,
          description: form.description ?? "",
          slug: form.slug,
          status: form.status,
          visibility: form.visibility,
          fields: spec?.pages.flatMap((p) => p.fields) ?? [],
        }}
      />
    </div>
  );
}
