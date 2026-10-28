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
    {/* The site column, capped at the dashboard's old 1180 px until then. */}
    <div className="container-page py-8">
    <div className="max-w-[73.75rem]">
      <NavTabs
        tabs={[
          { href: "/dashboard", label: t.guilds },
          { href: "/dashboard/me", label: t.mySubmissions },
        ]}
      />
      <div className="mt-8">{children}</div>
    </div>
    </div>
    </SiteChrome>
  );
}
