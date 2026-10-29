import {
  FILE_FIELD_TYPES,
  formatAnswerValue,
  isLayoutField,
  scaleBounds,
  type FormField,
  type FormSpec,
} from "@msk-forms/shared";

import { Star } from "@/components/icons";

/** Labels needed to format answers, shared by the public + reviewer views. */
export interface AnswerLabels {
  notAnswered: string;
  yes: string;
  no: string;
}

/** Uploaded files for the submission, matched to their field by `fieldId`. */
export interface SubmissionFile {
  id: string;
  fieldId: string;
  filename: string;
}

function formatAnswer(field: FormField, value: unknown, t: AnswerLabels): string {
  return formatAnswerValue(field, value, { empty: t.notAnswered, yes: t.yes, no: t.no });
}

/**
 * A star rating as its figure on its scale ("4 / 5"), which is what a
 * screen reader reads, with the stars beside it as a picture only. The
 * figure is never a row of glyphs that would be read out one by one.
 */
function StarAnswer({ value, max }: { value: number; max: number }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <span aria-hidden className="inline-flex gap-0.5">
        {Array.from({ length: max }, (_, i) => (
          <Star
            key={i}
            weight={i < value ? "fill" : "regular"}
            className={i < value ? "h-4 w-4 text-primary" : "h-4 w-4 text-muted-foreground"}
          />
        ))}
      </span>
      <span className="tabular-nums">
        {value} / {max}
      </span>
    </span>
  );
}

/** Read-only definition list of a submission's answers, by form field. */
export function AnswerSummary({
  spec,
  answers,
  labels,
  files = [],
}: {
  spec: FormSpec;
  answers: Record<string, unknown>;
  labels: AnswerLabels;
  files?: SubmissionFile[];
}) {
  const fields = spec.pages.flatMap((p) => p.fields).filter((f) => !isLayoutField(f.type));
  const isFileField = (f: FormField) => (FILE_FIELD_TYPES as readonly string[]).includes(f.type);

  return (
    <dl className="grid divide-y divide-border">
      {fields.map((field) => {
        const file = isFileField(field) ? files.find((x) => x.fieldId === field.id) : undefined;
        return (
          <div key={field.id} className="grid gap-1 py-3.5">
            <dt className="text-small font-semibold text-muted-foreground">
              {field.label ?? field.id}
            </dt>
            <dd className="break-words text-foreground">
              {isFileField(field) ? (
                file ? (
                  <a
                    href={`/api/files/${file.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-primary underline underline-offset-4 hover:text-primary-hover"
                  >
                    {file.filename}
                  </a>
                ) : (
                  labels.notAnswered
                )
              ) : field.type === "rating_stars" && typeof answers[field.id] === "number" ? (
                <StarAnswer value={answers[field.id] as number} max={scaleBounds(field).max} />
              ) : (
                formatAnswer(field, answers[field.id], labels)
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
