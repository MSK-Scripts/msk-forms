import { prisma } from "@msk-forms/db";
import type { CategoryInput } from "@msk-forms/shared";
import { Card } from "@msk-forms/ui";

import { CategoryListForm } from "@/components/categories/category-list-form";
import { requireUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/categories`);
  const t = (await getDict()).dashboard;

  if (!(await canManageForms(guildId, user.id))) {
    return (
      <Card className="p-8">
        <p className="text-muted-foreground">{t.categories.noPerm}</p>
      </Card>
    );
  }

  const categories = await prisma.formCategory.findMany({
    where: { guildId },
    orderBy: { order: "asc" },
    select: { id: true, name: true, color: true, order: true },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-semibold text-foreground">{t.categories.title}</h2>
        <p className="text-sm text-muted-foreground">{t.categories.intro}</p>
      </div>

      <CategoryListForm
        guildId={guildId}
        initial={categories as CategoryInput[]}
        t={t.categories}
      />
    </div>
  );
}
