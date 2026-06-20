import { NavTabs } from "@/components/dashboard/nav-tabs";
import { requireUser } from "@/lib/auth";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser("/dashboard");
  const t = (await getDict()).dashboard;

  return (
    <div className="container py-8">
      <NavTabs
        tabs={[
          { href: "/dashboard", label: t.guilds },
          { href: "/dashboard/me", label: t.mySubmissions },
        ]}
      />
      <div className="mt-8">{children}</div>
    </div>
  );
}
