import {
  FILE_FIELD_TYPES,
  formatAnswerValue,
  isLayoutField,
  type FormField,
  type FormSpec,
} from "@msk-forms/shared";

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
    <dl className="flex flex-col divide-y divide-border">
      {fields.map((field) => {
        const file = isFileField(field) ? files.find((x) => x.fieldId === field.id) : undefined;
        return (
          <div key={field.id} className="flex flex-col gap-1 py-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {field.label ?? field.id}
            </dt>
            <dd className="text-sm text-foreground">
              {isFileField(field) ? (
                file ? (
                  <a
                    href={`/api/files/${file.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    {file.filename}
                  </a>
                ) : (
                  labels.notAnswered
                )
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
