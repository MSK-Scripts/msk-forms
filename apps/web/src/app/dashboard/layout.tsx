import { requireUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Every dashboard page needs a signed-in person. The frame (the kit's
 * AppShell) comes from the layouts below: `(account)` for the server list and
 * the person's own submissions, `[guildId]` for a guild, whose sidebar lists
 * the guild's areas.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireUser("/dashboard");
  return children;
}
