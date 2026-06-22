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
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          {t.yourGuilds}
        </h1>
        <p className="text-sm text-muted-foreground">{t.yourGuildsHint}</p>
      </div>

      {guilds.length === 0 ? (
        <Card className="flex flex-col items-start gap-3 p-8">
          <p className="text-muted-foreground">{t.noGuilds}</p>
          <p className="text-sm text-muted-foreground">{t.noGuildsHint}</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guilds.map((guild) => (
            <Link key={guild.id} href={`/dashboard/${guild.id}/forms` as Route} className="group">
              <Card className="flex h-full flex-col gap-4 p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
                <div className="flex items-center gap-3">
                  {guild.icon ? (
                    <img src={guild.icon} alt="" width={44} height={44} className="rounded-lg" />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted font-heading text-lg text-muted-foreground">
                      {guild.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      translate="no"
                      className="truncate font-heading text-base font-semibold text-foreground"
                    >
                      {guild.name}
                    </p>
                    <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-primary">
                      {guild.role}
                    </span>
                  </div>
                </div>
                <div className="mt-auto grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                    <p className="font-heading text-lg font-semibold tabular-nums text-foreground">
                      {guild._count.forms}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {guild._count.forms === 1 ? t.countForm : t.countForms}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                    <p className="font-heading text-lg font-semibold tabular-nums text-foreground">
                      {guild._count.submissions}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {guild._count.submissions === 1 ? t.countSubmission : t.countSubmissions}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
