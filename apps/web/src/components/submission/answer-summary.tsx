import type { FormField, FormSpec } from "@msk-forms/shared";

/** Labels needed to format answers, shared by the public + reviewer views. */
export interface AnswerLabels {
  notAnswered: string;
  yes: string;
  no: string;
}

/** Layout-only field types carry no answer and are skipped in the summary. */
const LAYOUT = ["section_break", "heading", "paragraph", "image_block", "divider", "spacer"];

function formatAnswer(field: FormField, value: unknown, t: AnswerLabels): string {
  if (value === undefined || value === null || value === "") return t.notAnswered;
  if (typeof value === "boolean") return value ? t.yes : t.no;

  const labelFor = (v: string) => field.options?.find((o) => o.value === v)?.label ?? v;

  if (Array.isArray(value)) return value.map((v) => labelFor(String(v))).join(", ");
  if (field.options) return labelFor(String(value));
  return String(value);
}

/** Read-only definition list of a submission's answers, by form field. */
export function AnswerSummary({
  spec,
  answers,
  labels,
}: {
  spec: FormSpec;
  answers: Record<string, unknown>;
  labels: AnswerLabels;
}) {
  const fields = spec.pages.flatMap((p) => p.fields).filter((f) => !LAYOUT.includes(f.type));
  return (
    <dl className="flex flex-col divide-y divide-border">
      {fields.map((field) => (
        <div key={field.id} className="flex flex-col gap-1 py-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {field.label ?? field.id}
          </dt>
          <dd className="text-sm text-foreground">{formatAnswer(field, answers[field.id], labels)}</dd>
        </div>
      ))}
    </dl>
  );
}
