import { Card } from "@msk-forms/ui";

import { GuildIcon } from "@/components/dashboard/guild-icon";
import { NavTabs, type NavTab } from "@/components/dashboard/nav-tabs";
import { requireUser } from "@/lib/auth";
import { getReviewScope, MANAGER_ROLES, requireGuildMembership } from "@/lib/guild";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function GuildLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/forms`);
  const guild = await requireGuildMembership(guildId, user.id);
  const t = (await getDict()).dashboard;

  const canManage = (MANAGER_ROLES as readonly string[]).includes(guild.role);
  const scope = await getReviewScope(guildId, user.id);
  const canReview = scope.all || scope.formIds.length > 0;
  const tabs: NavTab[] = [
    ...(canManage || canReview
      ? [{ href: `/dashboard/${guildId}/forms`, label: t.formsTab, prefix: true }]
      : []),
    ...(canReview
      ? [
          { href: `/dashboard/${guildId}/submissions`, label: t.submissionsTab, prefix: true },
          { href: `/dashboard/${guildId}/board`, label: t.boardTab, prefix: true },
        ]
      : []),
    ...(canManage
      ? [
          { href: `/dashboard/${guildId}/statuses`, label: t.statusesTab, prefix: true },
          { href: `/dashboard/${guildId}/branding`, label: t.brandingTab, prefix: true },
          { href: `/dashboard/${guildId}/bot`, label: t.botTab, prefix: true },
          { href: `/dashboard/${guildId}/webhooks`, label: t.webhooksTab, prefix: true },
          { href: `/dashboard/${guildId}/domain`, label: t.domainTab, prefix: true },
          { href: `/dashboard/${guildId}/api`, label: t.apiTab, prefix: true },
          { href: `/dashboard/${guildId}/members`, label: t.membersTab, prefix: true },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <GuildIcon icon={guild.icon} name={guild.name} size={36} className="rounded-md" />
        <h1 translate="no" className="font-heading text-2xl font-bold text-foreground">{guild.name}</h1>
      </div>

      {canManage || canReview ? (
        <>
          <NavTabs tabs={tabs} />
          <div>{children}</div>
        </>
      ) : (
        <Card className="p-8">
          <p className="text-muted-foreground">{t.pendingAccess}</p>
        </Card>
      )}
    </div>
  );
}
