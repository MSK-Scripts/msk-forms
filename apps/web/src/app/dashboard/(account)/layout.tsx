import { DashboardFrame } from "@/components/dashboard/dashboard-frame";
import { requireUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The server list and "My submissions": the shell without a guild, so only the account group. */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/dashboard");
  return (
    <DashboardFrame user={user} guildId={null} areas={[]}>
      {children}
    </DashboardFrame>
  );
}
