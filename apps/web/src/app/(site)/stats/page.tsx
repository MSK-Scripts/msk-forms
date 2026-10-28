import type { Metadata } from "next";

import { prisma } from "@msk-forms/db";

import { PageHero } from "@/components/page/page-hero";
import { getDict, getLocale } from "@/i18n";

export const runtime = "nodejs";
// Public, anonymized aggregate counts — cache for 5 minutes to spare the DB.
export const revalidate = 300;

export const metadata: Metadata = { title: "Stats · MSK Forms" };

/**
 * Platform statistics after the shop's statistics pages: the head on the
 * anthracite band, the figures as a definition list grouped by hairlines
 * instead of a grid of icon cards. Every figure is a count from the
 * database; nothing here is estimated.
 */
export default async function StatsPage() {
  const [dict, locale] = await Promise.all([getDict(), getLocale()]);
  const t = dict.stats;
  const nf = new Intl.NumberFormat(locale);

  // Aggregate counts only. Nothing here identifies a guild, form, or person.
  const [guilds, forms, submissions, liveForms] = await Promise.all([
    prisma.guild.count(),
    prisma.form.count(),
    prisma.submission.count(),
    prisma.form.count({ where: { status: "live", archivedAt: null } }),
  ]);

  const figures = [
    { label: t.guilds, value: guilds },
    { label: t.forms, value: forms },
    { label: t.submissions, value: submissions },
    { label: t.liveForms, value: liveForms },
  ];

  return (
    <>
      <PageHero id="stats-title" kicker={t.eyebrow} title={t.title} lead={t.sub} />

      {/* No landmark name of its own: it would repeat the page head's. */}
      <section className="py-[var(--space-section)]">
        <div className="container-page grid gap-[var(--space-stack)]">
          {/* Visible it would repeat the page title; it gives the list its
              place below the h1. */}
          <h2 id="stats-figures" className="sr-only">
            {t.title}
          </h2>
          {/* Four figures: one row on a desktop, two by two on a tablet. */}
          <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-x-[clamp(2rem,3vw,4rem)]">
            {figures.map((f) => (
              <div key={f.label} className="grid content-start gap-1 border-t border-border py-5">
                <dt className="font-semibold">{f.label}</dt>
                <dd className="font-display text-display font-bold tracking-[-0.02em] tabular-nums">
                  {nf.format(f.value)}
                </dd>
              </div>
            ))}
          </dl>
          <p className="max-w-[65ch] text-small text-muted-foreground">{t.note}</p>
        </div>
      </section>
    </>
  );
}
