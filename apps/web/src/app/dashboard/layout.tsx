import type { Route } from "next";
import Link from "next/link";

import { NavTabs } from "@/components/dashboard/nav-tabs";
import { LogoutButton } from "@/components/logout-button";
import { requireUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("/dashboard");

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-bg-panel">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href={"/dashboard" as Route} className="font-heading text-lg font-bold text-text-primary">
              MSK<span className="text-accent">Forms</span>
            </Link>
            <NavTabs
              tabs={[
                { href: "/dashboard", label: "Guilds" },
                { href: "/dashboard/me", label: "My Submissions" },
              ]}
            />
          </div>
          <div className="flex items-center gap-3">
            {user.avatar && (
              <img src={user.avatar} alt="" width={28} height={28} className="rounded-full" />
            )}
            <span className="hidden font-mono text-xs text-text-secondary sm:inline">
              {user.username}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
