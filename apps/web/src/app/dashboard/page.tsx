import { Card } from "@msk-forms/ui";
import type { Route } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { getUserGuilds } from "@/lib/guild";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function GuildsPage() {
  const user = await requireUser("/dashboard");
  const guilds = await getUserGuilds(user.id);
  const t = (await getDict()).dashboard;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">{t.yourGuilds}</h1>
      </div>

      {guilds.length === 0 ? (
        <Card className="flex flex-col items-start gap-3 p-8">
          <p className="text-muted-foreground">{t.noGuilds}</p>
          <p className="text-sm text-muted-foreground">{t.noGuildsHint}</p>
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
                    <p translate="no" className="truncate font-heading text-base font-semibold text-foreground">
                      {guild.name}
                    </p>
                    <p className="font-mono text-xs uppercase tracking-widest text-primary">
                      {guild.role}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>
                    <span className="font-mono font-medium text-foreground">{guild._count.forms}</span>{" "}
                    {guild._count.forms === 1 ? t.countForm : t.countForms}
                  </span>
                  <span>
                    <span className="font-mono font-medium text-foreground">
                      {guild._count.submissions}
                    </span>{" "}
                    {guild._count.submissions === 1 ? t.countSubmission : t.countSubmissions}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
