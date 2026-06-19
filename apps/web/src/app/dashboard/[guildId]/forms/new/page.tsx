import { Card } from "@msk-forms/ui";

import { FormBuilder } from "@/components/builder/form-builder";
import { requireUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function NewFormPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/forms/new`);
  if (!(await canManageForms(guildId, user.id))) {
    return (
      <Card className="p-8">
        <p className="text-text-secondary">You don&apos;t have permission to create forms.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-semibold text-text-primary">New form</h2>
      <FormBuilder
        guildId={guildId}
        initial={{
          title: "",
          description: "",
          slug: "",
          status: "draft",
          visibility: "public",
          fields: [],
        }}
      />
    </div>
  );
}
