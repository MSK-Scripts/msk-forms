import { Card, StatusBadge } from "@msk-forms/ui";

import { getGuildSubmissions } from "@/lib/guild";
import { resolveStatus } from "@/lib/forms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function GuildSubmissionsPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  const submissions = await getGuildSubmissions(guildId);

  if (submissions.length === 0) {
    return (
      <Card className="p-8">
        <p className="text-muted-foreground">No submissions yet.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <th className="px-4 py-3 font-normal">Applicant</th>
            <th className="px-4 py-3 font-normal">Form</th>
            <th className="px-4 py-3 font-normal">Date</th>
            <th className="px-4 py-3 font-normal">Status</th>
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
                    <span className="text-foreground">{s.user?.username ?? "Anonymous"}</span>
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
