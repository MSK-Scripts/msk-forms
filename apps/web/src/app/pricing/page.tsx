import { IconBrandDiscord, IconCheck, IconUsersGroup } from "@tabler/icons-react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { botInviteUrl } from "@/lib/url";
import { getDict } from "@/i18n";

export const metadata: Metadata = { title: "Pricing — MSK Forms" };

export default async function PricingPage() {
  const t = (await getDict()).pricing;
  const invite = botInviteUrl();

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
              <Badge className="absolute -top-3 left-6">{t.badgePopular}</Badge>
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
    </main>
  );
}
