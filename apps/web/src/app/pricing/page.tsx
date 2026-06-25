import { IconBrandDiscord, IconCheck, IconMinus, IconUsersGroup } from "@tabler/icons-react";
import type { Metadata } from "next";
import { Fragment } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { botInviteUrl } from "@/lib/url";
import { getDict, getLocale } from "@/i18n";

export const metadata: Metadata = { title: "Pricing — MSK Forms" };

type Cell = boolean | string;

export default async function PricingPage() {
  const dict = await getDict();
  const t = dict.pricing;
  const c = t.compare;
  const invite = botInviteUrl();
  const nf = new Intl.NumberFormat(await getLocale());

  // The comparison matrix reflects what's actually enforced (single source).
  const groups: { name: string; rows: { label: string; vals: [Cell, Cell, Cell] }[] }[] = [
    {
      name: c.groups.build,
      rows: [
        { label: c.rows.builder, vals: [true, true, true] },
        { label: c.rows.logic, vals: [true, true, true] },
        { label: c.rows.quiz, vals: [true, true, true] },
        { label: c.rows.forms, vals: ["3", c.unlimited, c.unlimited] },
        { label: c.rows.submissions, vals: [nf.format(100), nf.format(5000), c.unlimited] },
        { label: c.rows.abtest, vals: [false, true, true] },
        { label: c.rows.realtime, vals: [true, true, true] },
      ],
    },
    {
      name: c.groups.discord,
      rows: [
        { label: c.rows.bot, vals: [true, true, true] },
        { label: c.rows.acceptRole, vals: [true, true, true] },
      ],
    },
    {
      name: c.groups.branding,
      rows: [
        { label: c.rows.colorLogo, vals: [true, true, true] },
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

  const renderCell = (v: Cell) =>
    typeof v === "string" ? (
      <span className="text-sm text-foreground">{v}</span>
    ) : v ? (
      <IconCheck size={18} stroke={2} className="mx-auto text-primary" />
    ) : (
      <IconMinus size={16} stroke={2} className="mx-auto text-muted-foreground/40" />
    );

  const tiers = [
    { key: "free" as const, data: t.tiers.free, highlight: false, href: invite, cta: t.ctaFree, external: true },
    { key: "pro" as const, data: t.tiers.pro, highlight: true, href: "/dashboard", cta: t.ctaUpgrade, external: false },
    { key: "enterprise" as const, data: t.tiers.enterprise, highlight: false, href: "/dashboard", cta: t.ctaUpgrade, external: false },
  ];

  return (
    <main className="container py-16 lg:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-balance font-heading text-4xl font-bold tracking-tight md:text-5xl">
          {t.title}
        </h1>
        <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">{t.sub}</p>
      </div>

      <div className="mt-14 grid items-start gap-6 lg:grid-cols-3">
        {tiers.map(({ key, data, highlight, href, cta, external }) => (
          <Card
            key={key}
            className={
              highlight
                ? "relative border-primary shadow-lg shadow-primary/10 lg:-mt-3"
                : "relative"
            }
          >
            {highlight && (
              <Badge className="absolute -top-3 start-6 border-transparent bg-primary text-primary-foreground shadow-sm">
                {t.badgePopular}
              </Badge>
            )}
            <CardContent className="flex h-full flex-col gap-6 p-7">
              <div>
                <h2 className="font-heading text-xl font-bold">{data.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{data.desc}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-heading text-4xl font-bold tracking-tight">{data.price}</span>
                  <span className="text-sm text-muted-foreground">{t.perMonth}</span>
                </div>
              </div>

              <ul className="flex flex-1 flex-col gap-2.5">
                {data.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <IconCheck size={18} stroke={2} className="mt-0.5 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button asChild variant={highlight ? "default" : "outline"} className="w-full">
                <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  {key === "free" && <IconBrandDiscord size={16} stroke={1.75} />}
                  {cta}
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mx-auto mt-12 max-w-3xl border-primary/30 bg-primary/5">
        <CardContent className="flex items-start gap-4 p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <IconUsersGroup size={22} stroke={1.75} />
          </span>
          <div>
            <h3 className="font-heading text-base font-bold">{t.perGuildTitle}</h3>
            <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
              {t.perGuildBody}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Full feature comparison */}
      <section className="mt-20">
        <h2 className="text-center font-heading text-2xl font-bold tracking-tight md:text-3xl">
          {c.title}
        </h2>
        <div className="mx-auto mt-8 max-w-4xl overflow-x-auto">
          <table className="w-full border-collapse text-start">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pe-4 text-sm font-semibold text-foreground">{c.feature}</th>
                <th className="w-28 py-3 text-center text-sm font-semibold text-foreground">{c.free}</th>
                <th className="w-28 py-3 text-center text-sm font-semibold text-primary">{c.pro}</th>
                <th className="w-28 py-3 text-center text-sm font-semibold text-foreground">{c.enterprise}</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <Fragment key={g.name}>
                  <tr className="bg-muted/40">
                    <td colSpan={4} className="px-1 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {g.name}
                    </td>
                  </tr>
                  {g.rows.map((row) => (
                    <tr key={row.label} className="border-b border-border/60">
                      <td className="py-3 pe-4 text-sm text-muted-foreground">{row.label}</td>
                      {row.vals.map((v, i) => (
                        <td key={i} className="py-3 text-center">
                          {renderCell(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
