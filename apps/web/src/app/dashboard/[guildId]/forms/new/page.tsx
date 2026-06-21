import { Card } from "@msk-forms/ui";

import { FormBuilder } from "@/components/builder/form-builder";
import { requireUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";
import { getDict } from "@/i18n";

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

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-semibold text-foreground">
        {t.dashboard.newFormTitle}
      </h2>
      <FormBuilder
        guildId={guildId}
        t={t.builder}
        initial={{
          title: "",
          description: "",
          slug: "",
          status: "draft",
          visibility: "public",
          acceptedRoleId: "",
          pages: [{ id: "p1", title: "", fields: [] }],
        }}
      />
    </div>
  );
}
