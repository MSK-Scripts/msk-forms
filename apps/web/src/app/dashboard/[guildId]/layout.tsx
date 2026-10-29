import Link from "next/link";

import { DashboardFrame } from "@/components/dashboard/dashboard-frame";
import { EmptyState, PageHeader } from "@/components/dashboard-kit";
import { Button } from "@/components/ui/button";
import { getDict } from "@/i18n";
import { requireUser } from "@/lib/auth";
import { dashboardAccess, visibleGuildAreas } from "@/lib/dashboard-nav";
import { getReviewScope, requireGuildMembership } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A guild's dashboard. Membership is checked here (404 for anyone else), the
 * sidebar lists the areas the member's role and grants open
 * (lib/dashboard-nav.ts), and every page checks its own permission again.
 * A member who can neither manage nor review sees that the access is pending
 * instead of the page.
 */
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
  const scope = await getReviewScope(guildId, user.id);
  const areas = visibleGuildAreas(dashboardAccess(guild.role, scope));

  if (areas.length > 0) {
    return (
      <DashboardFrame user={user} guildId={guildId} areas={areas}>
        {children}
      </DashboardFrame>
    );
  }

  const t = (await getDict()).dashboard;
  return (
    <DashboardFrame user={user} guildId={guildId} areas={areas}>
      <PageHeader title={<span translate="no">{guild.name}</span>} />
      <EmptyState
        kind="unavailable"
        title={t.pendingTitle}
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard" prefetch={false}>
              {t.nav.allServers}
            </Link>
          </Button>
        }
      >
        {t.pendingAccess}
      </EmptyState>
    </DashboardFrame>
  );
}
