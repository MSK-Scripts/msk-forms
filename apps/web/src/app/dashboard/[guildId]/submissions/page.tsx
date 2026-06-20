import { Card, StatusBadge } from "@msk-forms/ui";

import { getGuildSubmissions } from "@/lib/guild";
import { resolveStatus } from "@/lib/forms";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function GuildSubmissionsPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const submissions = await getGuildSubmissions(guildId);
  const t = (await getDict()).dashboard;

  if (submissions.length === 0) {
    return (
      <Card className="p-8">
        <p className="text-muted-foreground">{t.noSubmissions}</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-medium">{t.colApplicant}</th>
            <th className="px-4 py-3 font-medium">{t.colForm}</th>
            <th className="px-4 py-3 font-medium">{t.colDate}</th>
            <th className="px-4 py-3 font-medium">{t.colStatus}</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => {
            const status = resolveStatus(s.status, []);
            return (
              <tr key={s.id} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {s.user?.avatar && (
                      <img src={s.user.avatar} alt="" width={24} height={24} className="rounded-full" />
                    )}
                    <span className="text-foreground">{s.user?.username ?? t.anonymous}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{s.form.title}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {s.submittedAt.toISOString().slice(0, 10)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge label={status.label} color={status.color} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
