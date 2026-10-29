import type { ReactNode } from "react";

import { getDict, getLocale } from "@/i18n";
import { logoUrl, parseBranding } from "@/lib/branding";
import type { GuildArea } from "@/lib/dashboard-nav";
import { getUserGuilds } from "@/lib/guild";
import { botInviteUrl } from "@/lib/url";

import { DashboardShell } from "./dashboard-shell";

type Member = Awaited<ReturnType<typeof getUserGuilds>>[number];

/**
 * Loads what the dashboard shell shows on every page (the guilds of the
 * switcher, the copy, the language) and renders it around a page. Used by
 * the layout of the server list and by the layout of a guild.
 */
export async function DashboardFrame({
  user,
  guildId,
  areas,
  children,
}: {
  user: { id: string; username: string };
  guildId: string | null;
  areas: readonly GuildArea[];
  children: ReactNode;
}) {
  const [dict, locale, memberships] = await Promise.all([
    getDict(),
    getLocale(),
    getUserGuilds(user.id),
  ]);
  const t = dict.dashboard;
  const roleLabel: Record<Member["role"], string> = {
    owner: dict.members.roleOwner,
    admin: dict.members.roleAdmin,
    reviewer: dict.members.roleReviewer,
    viewer: dict.members.roleViewer,
  };

  return (
    <DashboardShell
      guildId={guildId}
      areas={areas}
      guilds={memberships.map((g) => ({
        id: g.id,
        name: g.name,
        detail: roleLabel[g.role],
        iconUrl: g.icon,
        logoUrl: logoUrl(g.id, parseBranding(g.branding)),
        href: `/dashboard/${g.id}/forms`,
      }))}
      inviteHref={botInviteUrl()}
      userName={user.username}
      locale={locale}
      copy={{
        shell: dict.kit.shell,
        switcher: dict.kit.guildSwitcher,
        groups: {
          work: t.nav.work,
          workflow: t.nav.workflow,
          setup: t.nav.setup,
          team: t.nav.team,
          account: t.nav.account,
        },
        allServers: t.nav.allServers,
        mySubmissions: t.mySubmissions,
        areas: {
          forms: t.formsTab,
          submissions: t.submissionsTab,
          board: t.boardTab,
          statuses: t.statusesTab,
          messages: t.messagesTab,
          categories: t.categoriesTab,
          branding: t.brandingTab,
          domain: t.domainTab,
          bot: t.botTab,
          members: t.membersTab,
          webhooks: t.webhooksTab,
          api: t.apiTab,
          "audit-log": t.logsTab,
        },
      }}
    >
      {children}
    </DashboardShell>
  );
}
