"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import {
  AppShell,
  currentNavId,
  GuildSwitcher,
  type GuildSwitcherCopy,
  type ShellCopy,
  type ShellNavGroup,
  type SwitcherGuild,
} from "@/components/dashboard-kit";
import {
  ChatText,
  ClipboardText,
  ClockCounterClockwise,
  Flag,
  FolderSimple,
  Globe,
  Kanban,
  Key,
  PaintBrush,
  PaperPlaneTilt,
  Robot,
  SquaresFour,
  Tray,
  UsersThree,
  WebhooksLogo,
  type IconComponent,
} from "@/components/icons";
import type { Locale } from "@/i18n/dictionaries";
import { logoutAction } from "@/lib/auth-actions";
import { guildAreaHref, type GuildArea } from "@/lib/dashboard-nav";

const ICON: Record<GuildArea, IconComponent> = {
  forms: ClipboardText,
  submissions: Tray,
  board: Kanban,
  statuses: Flag,
  messages: ChatText,
  categories: FolderSimple,
  branding: PaintBrush,
  domain: Globe,
  bot: Robot,
  members: UsersThree,
  webhooks: WebhooksLogo,
  api: Key,
  "audit-log": ClockCounterClockwise,
};

/** The sidebar groups an area belongs to, in order. */
const GROUPS: { id: "work" | "workflow" | "setup" | "team"; areas: GuildArea[] }[] = [
  { id: "work", areas: ["forms", "submissions", "board"] },
  { id: "workflow", areas: ["statuses", "messages", "categories"] },
  { id: "setup", areas: ["branding", "domain", "bot"] },
  { id: "team", areas: ["members", "webhooks", "api", "audit-log"] },
];

/**
 * The daily work, also in the bar at the bottom of a phone: reviewing happens
 * on the go, and for a reviewer these three are all there is. The setup areas
 * are used at a desk and stay in the menu.
 */
const MOBILE: readonly GuildArea[] = ["forms", "submissions", "board"];

export interface DashboardShellCopy {
  shell: ShellCopy;
  switcher: GuildSwitcherCopy;
  groups: { work: string; workflow: string; setup: string; team: string; account: string };
  allServers: string;
  mySubmissions: string;
  areas: Record<GuildArea, string>;
}

/**
 * The dashboard inside the kit's AppShell: the guild switcher at the top of
 * the sidebar and the guild's areas in labelled groups. All servers and the
 * person's own submissions are the account's places: in the account menu of
 * the top bar everywhere, and the sidebar's only group outside a guild, where
 * there are no areas.
 *
 * The server decides which areas are listed (`areas`, from
 * lib/dashboard-nav.ts) and hands over plain data; icons and links are put
 * together here because components cannot cross into a client component.
 * Signing out posts the existing logout Server Action from a plain form, so it
 * works before hydration.
 */
export function DashboardShell({
  guildId,
  areas,
  guilds,
  inviteHref,
  userName,
  locale,
  copy,
  children,
}: {
  /** The guild whose pages these are; null on the server list and on "My submissions". */
  guildId: string | null;
  /** The areas this person sees in the guild, in sidebar order. */
  areas: readonly GuildArea[];
  /** Every guild the person is a member of, for the switcher. */
  guilds: SwitcherGuild[];
  inviteHref: string;
  userName: string;
  locale: Locale;
  copy: DashboardShellCopy;
  children: ReactNode;
}) {
  const pathname = usePathname();

  const nav: ShellNavGroup[] = [];
  if (guildId) {
    for (const group of GROUPS) {
      const items = group.areas
        .filter((area) => areas.includes(area))
        .map((area) => ({
          id: area,
          href: guildAreaHref(guildId, area),
          label: copy.areas[area],
          icon: ICON[area],
          mobile: MOBILE.includes(area),
        }));
      if (items.length > 0) nav.push({ id: group.id, label: copy.groups[group.id], items });
    }
  }
  const accountItems = [
    // `exact`: inside a guild every address lies below /dashboard.
    { id: "servers", href: "/dashboard", label: copy.allServers, icon: SquaresFour, exact: true, mobile: true },
    { id: "me", href: "/dashboard/me", label: copy.mySubmissions, icon: PaperPlaneTilt, mobile: true },
  ];
  if (!guildId) nav.push({ id: "account", label: copy.groups.account, items: accountItems });

  const current = currentNavId(nav, pathname);
  const accountCurrent = currentNavId([{ id: "account", label: "", items: accountItems }], pathname);
  const pageTitle = nav.flatMap((g) => g.items).find((item) => item.id === current)?.label;

  return (
    <AppShell
      productName="MSK Forms"
      homeHref="/dashboard"
      nav={nav}
      currentId={current}
      pageTitle={pageTitle}
      switcher={<GuildSwitcher guilds={guilds} currentId={guildId} addHref={inviteHref} copy={copy.switcher} />}
      account={{
        name: userName,
        links: accountItems.map(({ id, href, label, icon }) => ({ id, href, label, icon, current: id === accountCurrent })),
        signOut: logoutAction,
      }}
      locale={locale}
      copy={copy.shell}
    >
      {children}
    </AppShell>
  );
}
