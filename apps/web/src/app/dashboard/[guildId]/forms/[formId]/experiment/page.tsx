import { prisma } from "@msk-forms/db";
import { experimentActive, parseFormSettings } from "@msk-forms/shared";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ExperimentResultsTable } from "@/components/builder/experiment-results-table";
import { EmptyState, PageHeader, StatGrid, StatTile } from "@/components/dashboard-kit";
import { PencilSimple } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { getDict, getLocale } from "@/i18n";
import { requireUser } from "@/lib/auth";
import { getFormForEdit } from "@/lib/forms";
import { canManageForms } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ExperimentResultsPage({
  params,
}: {
  params: Promise<{ guildId: string; formId: string }>;
}) {
  const { guildId, formId } = await params;
  const user = await requireUser(`/dashboard/${guildId}/forms/${formId}/experiment`);
  const dict = await getDict();
  const t = dict.experiment;
  const formsHref = `/dashboard/${guildId}/forms`;

  if (!(await canManageForms(guildId, user.id))) {
    return (
      <>
        <PageHeader
          title={t.title}
          breadcrumbs={[{ label: dict.dashboard.formsTab, href: formsHref }, { label: dict.dashboard.experimentLink }]}
          breadcrumbLabel={dict.kit.breadcrumb}
        />
        <EmptyState kind="unavailable" title={dict.dashboard.noPermEdit} />
      </>
    );
  }

  const form = await getFormForEdit(formId, guildId);
  if (!form) notFound();

  const experiment = parseFormSettings(form.settings).experiment;
  const stats = await prisma.experimentStat.findMany({
    where: { formId },
    select: { variantId: true, views: true, submissions: true },
  });
  const byId = new Map(stats.map((s) => [s.variantId, s]));
  const locale = await getLocale();
  const pct = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 });
  const count = new Intl.NumberFormat(locale);

  const rows = (experiment?.variants ?? []).map((v) => {
    const s = byId.get(v.id);
    const views = s?.views ?? 0;
    const submissions = s?.submissions ?? 0;
    return { id: v.id, name: v.name, views, submissions, rate: views > 0 ? submissions / views : 0 };
  });
  // Highlight the leader (needs a meaningful sample so a 1/1 fluke doesn't "win").
  const ranked = [...rows].filter((r) => r.views >= 10).sort((a, b) => b.rate - a.rate);
  const winnerId = ranked.length > 1 && ranked[0]!.rate > ranked[1]!.rate ? ranked[0]!.id : null;
  const winner = rows.find((r) => r.id === winnerId);

  const totalViews = rows.reduce((sum, r) => sum + r.views, 0);
  const totalSubmissions = rows.reduce((sum, r) => sum + r.submissions, 0);
  const editHref = `/dashboard/${guildId}/forms/${formId}/edit`;

  return (
    <>
      <PageHeader
        title={t.title}
        description={t.hint}
        breadcrumbs={[
          { label: dict.dashboard.formsTab, href: formsHref },
          { label: <span translate="no">{form.title}</span>, href: editHref },
          { label: dict.dashboard.experimentLink },
        ]}
        breadcrumbLabel={dict.kit.breadcrumb}
      />

      {!experimentActive(experiment) ? (
        <EmptyState
          kind="first-use"
          title={t.inactive}
          action={
            <Button asChild variant="outline">
              <Link href={editHref as Route} prefetch={false}>
                <PencilSimple className="h-4 w-4" />
                {dict.dashboard.editFormTitle}
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5">
          <StatGrid>
            <StatTile label={t.views} value={count.format(totalViews)} hint={t.allVariants} />
            <StatTile label={t.submissions} value={count.format(totalSubmissions)} hint={t.allVariants} />
            <StatTile
              label={t.rate}
              value={totalViews > 0 ? pct.format(totalSubmissions / totalViews) : t.noViews}
              hint={t.allVariants}
            />
            <StatTile
              label={t.winner}
              value={winner ? <span translate="no">{winner.name}</span> : t.noLeader}
              hint={winner ? pct.format(winner.rate) : t.leaderHint}
            />
          </StatGrid>

          <ExperimentResultsTable
            rows={rows.map((r) => ({
              id: r.id,
              name: r.name,
              views: r.views,
              submissions: r.submissions,
              rate: r.views > 0 ? r.rate : null,
              viewsLabel: count.format(r.views),
              submissionsLabel: count.format(r.submissions),
              rateLabel: r.views > 0 ? pct.format(r.rate) : t.noViews,
              leading: r.id === winnerId,
            }))}
            copy={{
              caption: t.title,
              variant: t.variant,
              views: t.views,
              submissions: t.submissions,
              rate: t.rate,
              winner: t.winner,
            }}
            empty={<EmptyState kind="no-results" title={t.inactive} />}
          />
        </div>
      )}
    </>
  );
}
