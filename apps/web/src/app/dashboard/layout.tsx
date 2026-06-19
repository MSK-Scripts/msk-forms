import { NavTabs } from "@/components/dashboard/nav-tabs";
import { requireUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser("/dashboard");

  return (
    <div className="container py-8">
      <NavTabs
        tabs={[
          { href: "/dashboard", label: "Guilds" },
          { href: "/dashboard/me", label: "My Submissions" },
        ]}
      />
      <div className="mt-8">{children}</div>
    </div>
  );
}
