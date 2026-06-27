import { IconBroadcast, IconForms, IconInbox, IconServer } from "@tabler/icons-react";
import type { Metadata } from "next";

import { prisma } from "@msk-forms/db";

import { Card, CardContent } from "@/components/ui/card";
import { getDict, getLocale } from "@/i18n";

export const runtime = "nodejs";
// Public, anonymized aggregate counts — cache for 5 minutes to spare the DB.
export const revalidate = 300;

export const metadata: Metadata = { title: "Stats — MSK Forms" };

export default async function StatsPage() {
  const t = (await getDict()).stats;
  const nf = new Intl.NumberFormat(await getLocale());

  // Aggregate counts only. Nothing here identifies a guild, form, or person.
  const [guilds, forms, submissions, liveForms] = await Promise.all([
    prisma.guild.count(),
    prisma.form.count(),
    prisma.submission.count(),
    prisma.form.count({ where: { status: "live" } }),
  ]);

  const metrics = [
    { icon: IconServer, label: t.guilds, value: guilds },
    { icon: IconForms, label: t.forms, value: forms },
    { icon: IconInbox, label: t.submissions, value: submissions },
    { icon: IconBroadcast, label: t.liveForms, value: liveForms },
  ];

  return (
    <main className="container py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow justify-center">{t.eyebrow}</span>
        <h1 className="mt-4 text-balance font-heading text-4xl font-bold tracking-tight md:text-5xl">
          {t.title}
        </h1>
        <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">{t.sub}</p>
      </div>

      <div className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ icon: Icon, label, value }) => (
          <Card
            key={label}
            className="transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
          >
            <CardContent className="flex flex-col items-center gap-3 p-7 text-center">
              <Icon size={28} stroke={1.75} className="text-primary" />
              <span className="font-heading text-4xl font-bold tracking-tight tabular-nums">
                {nf.format(value)}
              </span>
              <span className="text-sm text-muted-foreground">{label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-muted-foreground">{t.note}</p>
    </main>
  );
}
