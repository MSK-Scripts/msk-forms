import { prisma } from "@msk-forms/db";
import type { CategoryInput } from "@msk-forms/shared";

import { CategoryListForm } from "@/components/categories/category-list-form";
import { EmptyState, PageHeader } from "@/components/dashboard-kit";
import { requireUser } from "@/lib/auth";
import { canManageForms } from "@/lib/guild";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function CategoriesPage({ params }: { params: Promise<{ guildId: string }> }) {
  const { guildId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/categories`);
  const dict = await getDict();
  const t = dict.dashboard;

  if (!(await canManageForms(guildId, user.id))) {
    return (
      <>
        <PageHeader title={t.categoriesTab} />
        <EmptyState kind="unavailable" title={t.categories.noPerm} />
      </>
    );
  }

  const categories = await prisma.formCategory.findMany({
    where: { guildId },
    orderBy: { order: "asc" },
    select: { id: true, name: true, color: true, order: true },
  });

  return (
    <>
      <PageHeader title={t.categoriesTab} description={t.categories.intro} />
      <div>
        <CategoryListForm
          guildId={guildId}
          initial={categories as CategoryInput[]}
          t={t.categories}
          kit={{ saveBar: dict.kit.saveBar, dismiss: dict.kit.dismiss }}
        />
      </div>
    </>
  );
}
