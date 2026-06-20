import { NavTabs, type NavTab } from "@/components/dashboard/nav-tabs";
import { requireUser } from "@/lib/auth";
import { MANAGER_ROLES, requireGuildMembership } from "@/lib/guild";
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
  const tabs: NavTab[] = [
    { href: `/dashboard/${guildId}/forms`, label: t.formsTab, prefix: true },
    { href: `/dashboard/${guildId}/submissions`, label: t.submissionsTab, prefix: true },
    ...(canManage
      ? [
          { href: `/dashboard/${guildId}/branding`, label: t.brandingTab, prefix: true },
          { href: `/dashboard/${guildId}/bot`, label: t.botTab, prefix: true },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        {guild.icon ? (
          <img src={guild.icon} alt="" width={36} height={36} className="rounded-md" />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted font-heading text-muted-foreground">
            {guild.name.charAt(0)}
          </div>
        )}
        <h1 className="font-heading text-2xl font-bold text-foreground">{guild.name}</h1>
      </div>

      <NavTabs tabs={tabs} />

      <div>{children}</div>
    </div>
  );
}
