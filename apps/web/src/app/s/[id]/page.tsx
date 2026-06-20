import { StatusBadge } from "@msk-forms/ui";
import { notFound } from "next/navigation";

import { AnswerSummary } from "@/components/submission/answer-summary";
import { brandStyle, parseBranding } from "@/lib/branding";
import { getSubmissionForStatus, resolveStatus } from "@/lib/forms";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function SubmissionStatusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submission = await getSubmissionForStatus(id);
  if (!submission) notFound();

  const t = (await getDict()).status;
  const status = resolveStatus(submission.status, submission.statusDefs);
  const answers = (submission.answers ?? {}) as Record<string, unknown>;
  const brand = brandStyle(parseBranding(submission.form.guild.branding));

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12" style={brand}>
      <header className="flex flex-col gap-3">
        <span className="text-sm font-medium text-primary">{t.yourSubmission}</span>
        <h1 className="font-heading text-3xl font-bold text-foreground">
          {submission.form.title}
        </h1>
        <div className="flex items-center gap-3">
          <StatusBadge label={status.label} color={status.color} />
          <span className="text-xs text-muted-foreground">
            {t.submitted} {submission.submittedAt.toISOString().slice(0, 10)}
          </span>
        </div>
      </header>

      {submission.events.length > 0 && (
        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t.activity}
          </h2>
          <ol className="flex flex-col gap-4">
            {submission.events.map((ev) => (
              <li key={ev.id} className="flex flex-col gap-1 border-l-2 border-primary pl-3">
                <span className="text-xs text-muted-foreground">
                  {ev.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                </span>
                <span className="text-sm text-foreground">
                  {ev.type === "status_change" && ev.toStatus
                    ? `${t.statusChangedTo} “${resolveStatus(ev.toStatus, submission.statusDefs).label}”`
                    : (ev.message ?? t.update)}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {submission.spec && (
        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t.yourAnswers}
          </h2>
          <AnswerSummary
            spec={submission.spec}
            answers={answers}
            labels={{ notAnswered: t.notAnswered, yes: t.yes, no: t.no }}
            files={submission.files}
          />
        </section>
      )}
    </main>
  );
}
