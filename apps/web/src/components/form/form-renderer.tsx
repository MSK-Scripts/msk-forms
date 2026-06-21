"use client";

import {
  isFieldRequired,
  isFieldVisible,
  isLayoutField,
  type FormField,
  type FormPage,
  type FormSpec,
} from "@msk-forms/shared";
import { Button, Field } from "@msk-forms/ui";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FieldInput, type FieldValue } from "./field-input";
import { LayoutBlock } from "./layout-block";
import { TurnstileWidget } from "./turnstile-widget";

type Answers = Record<string, FieldValue>;

function isLayout(field: FormField): boolean {
  return isLayoutField(field.type);
}

/** True when a required field has no meaningful answer. */
function isEmpty(value: FieldValue): boolean {
  if (value === undefined || value === null || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  if (value === false) return true; // unchecked consent/age_check
  // Matrix answer ({ rowId: column }) with nothing picked yet.
  if (typeof value === "object" && Object.keys(value).length === 0) return true;
  return false;
}

export interface FormLabels {
  submit: string;
  submitting: string;
  required: string;
  submitFailed: string;
  captchaRequired: string;
  fileUploading: string;
  fileRemove: string;
  uploadFailed: string;
  signatureClear: string;
  next: string;
  back: string;
  step: string;
}

export function FormRenderer({
  slug,
  spec,
  labels,
  captchaSiteKey,
}: {
  slug: string;
  spec: FormSpec;
  labels: FormLabels;
  captchaSiteKey?: string | null;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  // Turnstile tokens are single-use; bump this to remount the widget (and get a
  // fresh token) after a failed submit.
  const [captchaNonce, setCaptchaNonce] = useState(0);

  const pages = spec.pages;
  // A page is shown only if it has at least one currently-visible field, so a
  // page whose fields are all hidden by conditions is skipped during paging.
  const visibleFieldsOf = (page: FormPage) => page.fields.filter((f) => isFieldVisible(f, answers));
  const shownPageIndices = pages
    .map((_, i) => i)
    .filter((i) => visibleFieldsOf(pages[i]!).length > 0);
  // Fall back to the first shown page if the current step was hidden away.
  const activeIndex = shownPageIndices.includes(step) ? step : (shownPageIndices[0] ?? 0);
  const position = Math.max(0, shownPageIndices.indexOf(activeIndex));
  const totalSteps = shownPageIndices.length;
  const isFirst = position <= 0;
  const isLast = position >= totalSteps - 1;
  const activeFields = visibleFieldsOf(pages[activeIndex] ?? { id: "", fields: [] });

  function setAnswer(id: string, value: FieldValue) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  /** Required-field errors for a set of fields (visible ones only). */
  function collectErrors(fields: FormField[]): Record<string, string> {
    const out: Record<string, string> = {};
    for (const field of fields) {
      if (isLayout(field) || !isFieldVisible(field, answers)) continue;
      if (isFieldRequired(field, answers) && isEmpty(answers[field.id])) {
        out[field.id] = labels.required;
      }
    }
    return out;
  }

  function goNext() {
    const pageErrors = collectErrors(activeFields);
    if (Object.keys(pageErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...pageErrors }));
      return;
    }
    const nextIndex = shownPageIndices[position + 1];
    if (nextIndex !== undefined) setStep(nextIndex);
  }

  function goBack() {
    const prevIndex = shownPageIndices[position - 1];
    if (prevIndex !== undefined) setStep(prevIndex);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    // Validate every visible field across all shown pages.
    const allShownFields = shownPageIndices.flatMap((i) => visibleFieldsOf(pages[i]!));
    const allErrors = collectErrors(allShownFields);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      // Jump to the first shown page that has an error.
      const bad = shownPageIndices.find((i) =>
        visibleFieldsOf(pages[i]!).some((f) => allErrors[f.id]),
      );
      if (bad !== undefined) setStep(bad);
      return;
    }
    if (captchaSiteKey && !captchaToken) {
      setSubmitError(labels.captchaRequired);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/forms/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, captchaToken }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? labels.submitFailed);
      }
      const { submissionId } = (await res.json()) as { submissionId: string };
      router.push(`/s/${submissionId}` as Route);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : labels.submitFailed);
      setSubmitting(false);
      // The consumed token can't be reused — force a fresh challenge.
      if (captchaSiteKey) {
        setCaptchaToken(null);
        setCaptchaNonce((n) => n + 1);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
      {totalSteps > 1 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {labels.step} {position + 1} / {totalSteps}
            {pages[activeIndex]?.title ? ` — ${pages[activeIndex]!.title}` : ""}
          </p>
          <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${((position + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      {activeFields.map((field) =>
        isLayout(field) ? (
          <LayoutBlock key={field.id} field={field} />
        ) : (
          <Field
            key={field.id}
            htmlFor={field.id}
            label={field.label}
            required={isFieldRequired(field, answers)}
            hint={field.description}
            error={errors[field.id]}
          >
            <FieldInput
              field={field}
              value={answers[field.id]}
              onChange={(v) => setAnswer(field.id, v)}
              invalid={Boolean(errors[field.id])}
              disabled={submitting}
              slug={slug}
              fileLabels={{
                uploading: labels.fileUploading,
                remove: labels.fileRemove,
                uploadFailed: labels.uploadFailed,
                clear: labels.signatureClear,
              }}
            />
          </Field>
        ),
      )}

      {isLast && captchaSiteKey && (
        <TurnstileWidget key={captchaNonce} siteKey={captchaSiteKey} onToken={setCaptchaToken} />
      )}

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <div className="flex items-center gap-3">
        {!isFirst && (
          <Button type="button" variant="ghost" onClick={goBack} disabled={submitting}>
            {labels.back}
          </Button>
        )}
        {isLast ? (
          <Button type="submit" disabled={submitting}>
            {submitting ? labels.submitting : labels.submit}
          </Button>
        ) : (
          <Button type="button" onClick={goNext}>
            {labels.next}
          </Button>
        )}
      </div>
    </form>
  );
}
