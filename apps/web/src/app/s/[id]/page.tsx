import type { FormField, FormSpec } from "@msk-forms/shared";
import { StatusBadge } from "@msk-forms/ui";
import { notFound } from "next/navigation";

import { getSubmissionForStatus, resolveStatus } from "@/lib/forms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LAYOUT = ["section_break", "heading", "paragraph", "image_block", "divider", "spacer"];

/** Human-readable rendering of a stored answer value. */
function formatAnswer(field: FormField, value: unknown): string {
  if (value === undefined || value === null || value === "") return "Not answered";
  if (typeof value === "boolean") return value ? "Yes" : "No";

  const labelFor = (v: string) =>
    field.options?.find((o) => o.value === v)?.label ?? v;

  if (Array.isArray(value)) return value.map((v) => labelFor(String(v))).join(", ");
  if (field.options) return labelFor(String(value));
  return String(value);
}

function AnswerSummary({ spec, answers }: { spec: FormSpec; answers: Record<string, unknown> }) {
  const fields = spec.pages.flatMap((p) => p.fields).filter((f) => !LAYOUT.includes(f.type));
  return (
    <dl className="flex flex-col divide-y divide-border">
      {fields.map((field) => (
        <div key={field.id} className="flex flex-col gap-1 py-3">
          <dt className="font-mono text-xs uppercase tracking-widest text-text-muted">
            {field.label ?? field.id}
          </dt>
          <dd className="text-sm text-text-primary">{formatAnswer(field, answers[field.id])}</dd>
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

  const status = resolveStatus(submission.status, submission.statusDefs);
  const answers = (submission.answers ?? {}) as Record<string, unknown>;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-3">
        <span className="font-mono text-xs uppercase tracking-widest text-accent">
          Your submission
        </span>
        <h1 className="font-heading text-3xl font-bold text-text-primary">
          {submission.form.title}
        </h1>
        <div className="flex items-center gap-3">
          <StatusBadge label={status.label} color={status.color} />
          <span className="font-mono text-xs text-text-muted">
            Submitted {submission.submittedAt.toISOString().slice(0, 10)}
          </span>
        </div>
      </header>

      {submission.events.length > 0 && (
        <section className="rounded-lg border border-border bg-bg-panel p-6 shadow-panel">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-text-secondary">
            Activity
          </h2>
          <ol className="flex flex-col gap-4">
            {submission.events.map((ev) => (
              <li key={ev.id} className="flex flex-col gap-1 border-l-2 border-accent pl-3">
                <span className="font-mono text-xs text-text-muted">
                  {ev.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                </span>
                <span className="text-sm text-text-primary">
                  {ev.type === "status_change" && ev.toStatus
                    ? `Status changed to “${resolveStatus(ev.toStatus, submission.statusDefs).label}”`
                    : (ev.message ?? "Update")}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {submission.spec && (
        <section className="rounded-lg border border-border bg-bg-panel p-6 shadow-panel">
          <h2 className="mb-2 font-mono text-xs uppercase tracking-widest text-text-secondary">
            Your answers
          </h2>
          <AnswerSummary spec={submission.spec} answers={answers} />
        </section>
      )}
    </main>
  );
}
