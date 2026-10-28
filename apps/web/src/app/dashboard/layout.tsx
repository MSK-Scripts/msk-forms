import { NavTabs } from "@/components/dashboard/nav-tabs";
import { SiteChrome } from "@/components/site/site-chrome";
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

  // Until the dashboard moves onto the AppShell (phase 3 of the redesign) it
  // keeps the site header and footer it had from the root layout before.
  return (
    <SiteChrome>
    <div className="container py-8">
      <NavTabs
        tabs={[
          { href: "/dashboard", label: t.guilds },
          { href: "/dashboard/me", label: t.mySubmissions },
        ]}
      />
      <div className="mt-8">{children}</div>
    </div>
    </SiteChrome>
  );
}
