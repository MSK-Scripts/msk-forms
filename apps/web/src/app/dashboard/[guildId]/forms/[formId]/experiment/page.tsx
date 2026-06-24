import { prisma } from "@msk-forms/db";
import { experimentActive, parseFormSettings } from "@msk-forms/shared";
import { Card } from "@msk-forms/ui";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { getFormForEdit } from "@/lib/forms";
import { canManageForms } from "@/lib/guild";
import { getDict, getLocale } from "@/i18n";

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

  if (!(await canManageForms(guildId, user.id))) {
    return (
      <Card className="p-8">
        <p className="text-muted-foreground">{dict.dashboard.noPermEdit}</p>
      </Card>
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
  const pct = new Intl.NumberFormat(await getLocale(), { style: "percent", maximumFractionDigits: 1 });

  const rows = (experiment?.variants ?? []).map((v) => {
    const s = byId.get(v.id);
    const views = s?.views ?? 0;
    const submissions = s?.submissions ?? 0;
    return { id: v.id, name: v.name, views, submissions, rate: views > 0 ? submissions / views : 0 };
  });
  // Highlight the leader (needs a meaningful sample so a 1/1 fluke doesn't "win").
  const ranked = [...rows].filter((r) => r.views >= 10).sort((a, b) => b.rate - a.rate);
  const winnerId = ranked.length > 1 && ranked[0]!.rate > ranked[1]!.rate ? ranked[0]!.id : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-semibold text-foreground">{t.title}</h2>
        <p className="text-sm text-muted-foreground">{form.title}</p>
      </div>

      {!experimentActive(experiment) ? (
        <Card className="p-8">
          <p className="text-muted-foreground">{t.inactive}</p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-start font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-3 text-start font-medium">{t.variant}</th>
                <th className="px-4 py-3 text-end font-medium">{t.views}</th>
                <th className="px-4 py-3 text-end font-medium">{t.submissions}</th>
                <th className="px-4 py-3 text-end font-medium">{t.rate}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {r.name}
                    {winnerId === r.id && (
                      <span className="ms-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                        {t.winner}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-end text-sm tabular-nums text-muted-foreground">{r.views}</td>
                  <td className="px-4 py-3 text-end text-sm tabular-nums text-muted-foreground">{r.submissions}</td>
                  <td className="px-4 py-3 text-end text-sm font-medium tabular-nums text-foreground">
                    {r.views > 0 ? pct.format(r.rate) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">{t.hint}</p>
    </div>
  );
}
