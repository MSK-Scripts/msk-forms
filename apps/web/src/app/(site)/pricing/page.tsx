import type { Metadata } from "next";

import { Notice } from "@/components/dashboard-kit/notice";
import { Check, Minus } from "@/components/icons";
import { DiscordMark } from "@/components/icons/brand-marks";
import { PageHero } from "@/components/page/page-hero";
import { Section } from "@/components/page/section";
import { Button } from "@/components/ui/button";
import { botInviteUrl } from "@/lib/url";
import { getDict, getLocale } from "@/i18n";

export const metadata: Metadata = { title: "Pricing · MSK Forms" };

type Cell = boolean | string;

export default async function PricingPage() {
  const [dict, locale] = await Promise.all([getDict(), getLocale()]);
  const t = dict.pricing;
  const c = t.compare;
  const invite = botInviteUrl();
  const nf = new Intl.NumberFormat(locale);

  // The comparison matrix reflects what's actually enforced (single source).
  const groups: { name: string; rows: { label: string; vals: [Cell, Cell, Cell] }[] }[] = [
    {
      name: c.groups.build,
      rows: [
        { label: c.rows.builder, vals: [true, true, true] },
        { label: c.rows.changeType, vals: [true, true, true] },
        { label: c.rows.logic, vals: [true, true, true] },
        { label: c.rows.quiz, vals: [true, true, true] },
        { label: c.rows.categories, vals: [true, true, true] },
        { label: c.rows.preview, vals: [true, true, true] },
        { label: c.rows.forms, vals: ["3", c.unlimited, c.unlimited] },
        { label: c.rows.submissions, vals: [nf.format(100), nf.format(5000), c.unlimited] },
        { label: c.rows.abtest, vals: [false, true, true] },
        { label: c.rows.realtime, vals: [true, true, true] },
        { label: c.rows.languages, vals: ["7", "7", "7"] },
      ],
    },
    {
      name: c.groups.discord,
      rows: [
        { label: c.rows.bot, vals: [true, true, true] },
        { label: c.rows.acceptRole, vals: [true, true, true] },
        { label: c.rows.activityLog, vals: [true, true, true] },
      ],
    },
    {
      name: c.groups.branding,
      rows: [
        { label: c.rows.colorLogo, vals: [true, true, true] },
        { label: c.rows.hub, vals: [true, true, true] },
        { label: c.rows.domain, vals: [false, true, true] },
        { label: c.rows.domainAuth, vals: [false, true, true] },
        { label: c.rows.css, vals: [false, true, true] },
        { label: c.rows.badge, vals: [c.shown, c.removed, c.removed] },
      ],
    },
    {
      name: c.groups.workflow,
      rows: [
        { label: c.rows.statuses, vals: [true, true, true] },
        { label: c.rows.webhooks, vals: [false, true, true] },
        { label: c.rows.automations, vals: [false, true, true] },
        { label: c.rows.integrations, vals: [false, false, true] },
        { label: c.rows.formIo, vals: [false, true, true] },
        { label: c.rows.exports, vals: [c.rows.exportsFree, c.rows.exportsPaid, c.rows.exportsEnt] },
      ],
    },
    {
      name: c.groups.team,
      rows: [
        { label: c.rows.members, vals: ["2", "15", c.unlimited] },
        { label: c.rows.perForm, vals: [true, true, true] },
      ],
    },
  ];

  // A sign and a word for each cell, never the sign alone.
  const renderCell = (v: Cell) =>
    typeof v === "string" ? (
      <span>{v}</span>
    ) : v ? (
      <>
        <Check className="mx-auto h-5 w-5 text-primary" weight="bold" />
        <span className="sr-only">{dict.marketing.included}</span>
      </>
    ) : (
      <>
        <Minus className="mx-auto h-5 w-5 text-muted-foreground" weight="bold" />
        <span className="sr-only">{dict.marketing.notIncluded}</span>
      </>
    );

  // All three plans stand side by side as equals: no "most popular" badge,
  // since nothing the code knows would back it.
  const tiers = [
    { key: "free" as const, data: t.tiers.free },
    { key: "pro" as const, data: t.tiers.pro },
    { key: "enterprise" as const, data: t.tiers.enterprise },
  ];

  return (
    <>
      <PageHero id="pricing-title" kicker={t.eyebrow} title={t.title} lead={t.sub} />

      <section aria-label={t.eyebrow} className="py-[var(--space-section)]">
        <div className="container-page grid gap-[var(--space-stack)]">
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,var(--grid-card)),1fr))] gap-[clamp(1rem,0.5rem+1.5vw,2.5rem)]">
            {tiers.map(({ key, data }) => (
              <li
                key={key}
                className="grid grid-rows-[auto_1fr_auto] gap-6 rounded-lg border border-border bg-card p-[clamp(1.5rem,1rem+1vw,2.5rem)] text-card-foreground shadow-[var(--shadow-card)]"
              >
                <div className="grid gap-2">
                  <h2 className="font-display text-h3 font-[650]">{data.name}</h2>
                  <p className="text-small text-muted-foreground">{data.desc}</p>
                  <p className="mt-2 flex items-baseline gap-1">
                    <span className="font-display text-h2 font-bold tracking-[-0.015em] tabular-nums">{data.price}</span>
                    <span className="text-small text-muted-foreground">{t.perMonth}</span>
                  </p>
                </div>
                <ul className="grid content-start gap-2.5">
                  {data.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="mt-[0.3em] h-4 w-4 shrink-0 text-primary" weight="bold" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {key === "free" ? (
                  <Button asChild variant="discord" className="w-full">
                    <a href={invite} target="_blank" rel="noopener noreferrer">
                      <DiscordMark className="h-4 w-4" />
                      {t.ctaFree}
                      <span className="sr-only"> {dict.site.newTab}</span>
                    </a>
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full">
                    <a href="/dashboard">{t.ctaUpgrade}</a>
                  </Button>
                )}
              </li>
            ))}
          </ul>

          <Notice tone="info" title={t.perGuildTitle} className="max-w-[60rem]">
            {t.perGuildBody}
          </Notice>
        </div>
      </section>

      <Section id="compare-title" title={c.title}>
        {/* A named group, not a second landmark: the section around it is
            already the region "compare-title" names. */}
        <div
          role="group"
          aria-labelledby="compare-title"
          tabIndex={0}
          // `relative`: the sr-only words in the cells are positioned, and
          // without a positioned ancestor they would widen the page itself.
          className="relative overflow-x-auto rounded-lg border border-border bg-card"
        >
          <table className="w-full min-w-[36rem] border-collapse text-start">
            <caption className="sr-only">{c.title}</caption>
            <thead>
              <tr className="border-b border-border bg-muted">
                <th scope="col" className="px-4 py-3 text-start text-label font-semibold tracking-[0.08em] uppercase">
                  {c.feature}
                </th>
                {[c.free, c.pro, c.enterprise].map((name) => (
                  <th
                    key={name}
                    scope="col"
                    className="w-[18%] px-4 py-3 text-center text-label font-semibold tracking-[0.08em] uppercase"
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            {groups.map((g) => (
              <tbody key={g.name}>
                <tr>
                  <th
                    scope="colgroup"
                    colSpan={4}
                    className="border-b border-border px-4 pt-6 pb-2 text-start font-display text-lead font-[650]"
                  >
                    {g.name}
                  </th>
                </tr>
                {g.rows.map((row) => (
                  <tr key={row.label} className="border-b border-border last:border-b-0">
                    <th scope="row" className="px-4 py-3 text-start font-normal text-foreground">
                      {row.label}
                    </th>
                    {row.vals.map((v, i) => (
                      <td key={i} className="px-4 py-3 text-center text-small tabular-nums">
                        {renderCell(v)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </Section>
    </>
  );
}
