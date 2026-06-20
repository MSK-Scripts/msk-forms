import { prisma } from "@msk-forms/db";
import { Card } from "@msk-forms/ui";

import { BrandingForm } from "@/components/branding/branding-form";
import { LogoForm } from "@/components/branding/logo-form";
import { requireUser } from "@/lib/auth";
import { logoUrl, parseBranding } from "@/lib/branding";
import { canManageForms } from "@/lib/guild";
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
      <Card className="p-8">
        <p className="text-muted-foreground">{t.branding.noPerm}</p>
      </Card>
    );
  }

  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { branding: true },
  });
  const branding = parseBranding(guild?.branding);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-semibold text-foreground">{t.branding.title}</h2>
      <BrandingForm guildId={guildId} initial={branding} t={t.branding} />
      <LogoForm guildId={guildId} logoUrl={logoUrl(guildId, branding)} t={t.branding} />
    </div>
  );
}
