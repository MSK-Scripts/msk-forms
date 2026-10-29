import { EmptyState, PageHeader } from "@/components/dashboard-kit";
import { GuildTable } from "@/components/dashboard/guild-table";
import { Plus } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { getDict } from "@/i18n";
import { requireUser } from "@/lib/auth";
import { logoUrl as guildLogoUrl, parseBranding } from "@/lib/branding";
import { getUserGuilds } from "@/lib/guild";
import { botInviteUrl } from "@/lib/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function GuildsPage() {
  const user = await requireUser("/dashboard");
  const guilds = await getUserGuilds(user.id);
  const dict = await getDict();
  const t = dict.dashboard;
  const roleLabel: Record<string, string> = {
    owner: dict.members.roleOwner,
    admin: dict.members.roleAdmin,
    reviewer: dict.members.roleReviewer,
    viewer: dict.members.roleViewer,
  };
  const invite = botInviteUrl();
  const addButton = (variant: "primary" | "outline") => (
    <Button asChild variant={variant}>
      <a href={invite} target="_blank" rel="noopener noreferrer">
        <Plus className="h-4 w-4" />
        {dict.kit.guildSwitcher.add}
      </a>
    </Button>
  );

  return (
    <>
      <PageHeader
        title={t.yourGuilds}
        description={t.yourGuildsHint}
        action={guilds.length > 0 ? addButton("outline") : undefined}
      />
      <GuildTable
        rows={guilds.map((g) => ({
          id: g.id,
          name: g.name,
          iconUrl: g.icon,
          logoUrl: guildLogoUrl(g.id, parseBranding(g.branding)),
          role: roleLabel[g.role] ?? g.role,
          forms: g._count.forms,
          submissions: g._count.submissions,
        }))}
        empty={
          <EmptyState kind="first-use" title={t.noGuilds} action={addButton("primary")}>
            {t.noGuildsHint}
          </EmptyState>
        }
        copy={{
          caption: t.yourGuilds,
          server: t.picker.colServer,
          role: t.picker.colRole,
          forms: t.formsTab,
          submissions: t.submissionsTab,
          open: t.open,
        }}
      />
    </>
  );
}
