import { Card, StatusBadge } from "@msk-forms/ui";
import type { Route } from "next";
import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { resolveStatus } from "@/lib/forms";
import { getUserSubmissions } from "@/lib/guild";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function MySubmissionsPage() {
  const user = await requireUser("/dashboard/me");
  const submissions = await getUserSubmissions(user.id);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-bold text-text-primary">My submissions</h1>

      {submissions.length === 0 ? (
        <Card className="p-8">
          <p className="text-text-secondary">
            You haven&apos;t submitted any forms yet.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {submissions.map((s) => {
            const status = resolveStatus(s.status, []);
            return (
              <Link key={s.id} href={`/s/${s.id}` as Route}>
                <Card className="flex items-center justify-between gap-4 p-4 transition-colors hover:border-border-accent">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate font-medium text-text-primary">{s.form.title}</span>
                    <span className="font-mono text-xs text-text-muted">
                      {s.guild.name} · {s.submittedAt.toISOString().slice(0, 10)}
                    </span>
                  </div>
                  <StatusBadge label={status.label} color={status.color} />
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
