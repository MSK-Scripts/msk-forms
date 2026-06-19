import type { Route } from "next";

import { NavTabs } from "@/components/dashboard/nav-tabs";
import { requireUser } from "@/lib/auth";
import { requireGuildMembership } from "@/lib/guild";

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        {guild.icon ? (
          <img src={guild.icon} alt="" width={36} height={36} className="rounded-md" />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-bg-input font-heading text-text-secondary">
            {guild.name.charAt(0)}
          </div>
        )}
        <h1 className="font-heading text-2xl font-bold text-text-primary">{guild.name}</h1>
      </div>

      <NavTabs
        tabs={[
          { href: `/dashboard/${guildId}/forms` as Route, label: "Forms", prefix: true },
          { href: `/dashboard/${guildId}/submissions` as Route, label: "Submissions", prefix: true },
        ]}
      />

      <div>{children}</div>
    </div>
  );
}
