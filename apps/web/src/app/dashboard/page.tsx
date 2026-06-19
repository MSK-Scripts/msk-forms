import { Card } from "@msk-forms/ui";
import type { Route } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { getUserGuilds } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function GuildsPage() {
  const user = await requireUser("/dashboard");
  const guilds = await getUserGuilds(user.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">Your guilds</h1>
      </div>

      {guilds.length === 0 ? (
        <Card className="flex flex-col items-start gap-3 p-8">
          <p className="text-muted-foreground">
            You aren&apos;t managing any guilds yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Connecting a guild happens through the Discord bot invite. That flow
            lands in a later slice. For now, an admin can add you to a guild.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guilds.map((guild) => (
            <Link key={guild.id} href={`/dashboard/${guild.id}/forms` as Route}>
              <Card className="flex h-full flex-col gap-3 p-5 transition-colors hover:border-primary/40">
                <div className="flex items-center gap-3">
                  {guild.icon ? (
                    <img src={guild.icon} alt="" width={40} height={40} className="rounded-md" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted font-heading text-lg text-muted-foreground">
                      {guild.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{guild.name}</p>
                    <p className="font-mono text-xs uppercase tracking-widest text-primary">
                      {guild.role}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 font-mono text-xs text-muted-foreground">
                  <span>{guild._count.forms} forms</span>
                  <span>{guild._count.submissions} submissions</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
