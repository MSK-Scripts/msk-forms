import type { FormField, FormSpec } from "@msk-forms/shared";
import { StatusBadge } from "@msk-forms/ui";
import { notFound } from "next/navigation";

import { getSubmissionForStatus, resolveStatus } from "@/lib/forms";
import { getDict, type Dictionary } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StatusDict = Dictionary["status"];

const LAYOUT = ["section_break", "heading", "paragraph", "image_block", "divider", "spacer"];

function formatAnswer(field: FormField, value: unknown, t: StatusDict): string {
  if (value === undefined || value === null || value === "") return t.notAnswered;
  if (typeof value === "boolean") return value ? t.yes : t.no;

  const labelFor = (v: string) => field.options?.find((o) => o.value === v)?.label ?? v;

  if (Array.isArray(value)) return value.map((v) => labelFor(String(v))).join(", ");
  if (field.options) return labelFor(String(value));
  return String(value);
}

function AnswerSummary({
  spec,
  answers,
  t,
}: {
  spec: FormSpec;
  answers: Record<string, unknown>;
  t: StatusDict;
}) {
  const fields = spec.pages.flatMap((p) => p.fields).filter((f) => !LAYOUT.includes(f.type));
  return (
    <dl className="flex flex-col divide-y divide-border">
      {fields.map((field) => (
        <div key={field.id} className="flex flex-col gap-1 py-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {field.label ?? field.id}
          </dt>
          <dd className="text-sm text-foreground">{formatAnswer(field, answers[field.id], t)}</dd>
        </div>
      ))}
    </dl>
  );
}

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

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
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
          <AnswerSummary spec={submission.spec} answers={answers} t={t} />
        </section>
      )}
    </main>
  );
}
