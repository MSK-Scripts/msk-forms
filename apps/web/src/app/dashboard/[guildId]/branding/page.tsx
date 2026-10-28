import { prisma } from "@msk-forms/db";

import { BrandingForm } from "@/components/branding/branding-form";
import { LogoForm } from "@/components/branding/logo-form";
import { EmptyState, PageHeader } from "@/components/dashboard-kit";
import { requireUser } from "@/lib/auth";
import { logoUrl, parseBranding } from "@/lib/branding";
import { canManageForms } from "@/lib/guild";
import { isGuildPro } from "@/lib/plan";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function BrandingPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/branding`);
  const t = await getDict();

  if (!(await canManageForms(guildId, user.id))) {
    return (
      <>
        <PageHeader title={t.branding.title} />
        <EmptyState kind="unavailable" title={t.branding.noPerm} />
      </>
    );
  }

  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { branding: true },
  });
  const branding = parseBranding(guild?.branding);
  const pro = await isGuildPro(guildId);

  return (
    <>
      <PageHeader title={t.branding.title} description={t.branding.intro} />
      <div>
        {/* The logo saves on upload; accent and CSS below share the SaveBar at the end. */}
        <LogoForm guildId={guildId} logoUrl={logoUrl(guildId, branding)} t={t.branding} />
        <BrandingForm
          guildId={guildId}
          initial={branding}
          canCss={pro}
          cssProBody={t.pro.cssBody}
          proTitle={t.pro.title}
          t={t.branding}
          kit={{ saveBar: t.kit.saveBar, dismiss: t.kit.dismiss }}
        />
      </div>
    </>
  );
}
