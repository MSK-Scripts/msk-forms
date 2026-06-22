import { prisma } from "@msk-forms/db";
import { Card } from "@msk-forms/ui";

import { DomainForm } from "@/components/domain/domain-form";
import { requireUser } from "@/lib/auth";
import { primaryHostname } from "@/lib/custom-domain";
import { canManageForms } from "@/lib/guild";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DomainPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/domain`);
  const t = (await getDict()).domain;

  if (!(await canManageForms(guildId, user.id))) {
    return (
      <Card className="p-8">
        <p className="text-muted-foreground">{t.noPerm}</p>
      </Card>
    );
  }

  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    select: { customDomain: true, customDomainToken: true, customDomainVerifiedAt: true },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-semibold text-foreground">{t.title}</h2>
        <p className="text-sm text-muted-foreground">{t.intro}</p>
      </div>
      <DomainForm
        guildId={guildId}
        cnameTarget={primaryHostname()}
        initial={{
          domain: guild?.customDomain ?? "",
          token: guild?.customDomainToken ?? "",
          verified: Boolean(guild?.customDomainVerifiedAt),
        }}
        t={t}
      />
    </div>
  );
}
