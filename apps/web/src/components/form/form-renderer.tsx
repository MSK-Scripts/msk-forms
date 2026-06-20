"use client";

import type { FormField, FormSpec } from "@msk-forms/shared";
import { Button, Field } from "@msk-forms/ui";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FieldInput, LAYOUT_TYPES, type FieldValue } from "./field-input";
import { LayoutBlock } from "./layout-block";
import { TurnstileWidget } from "./turnstile-widget";

type Answers = Record<string, FieldValue>;

function isLayout(field: FormField): boolean {
  return (LAYOUT_TYPES as readonly string[]).includes(field.type);
}

/** True when a required field has no meaningful answer. */
function isEmpty(value: FieldValue): boolean {
  if (value === undefined || value === null || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  if (value === false) return true; // unchecked consent/age_check
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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  // Turnstile tokens are single-use; bump this to remount the widget (and get a
  // fresh token) after a failed submit.
  const [captchaNonce, setCaptchaNonce] = useState(0);

  const fields = spec.pages.flatMap((p) => p.fields);

  function setAnswer(id: string, value: FieldValue) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    for (const field of fields) {
      if (isLayout(field)) continue;
      if (field.validation.required && isEmpty(answers[field.id])) {
        next[field.id] = labels.required;
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
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
      {fields.map((field) =>
        isLayout(field) ? (
          <LayoutBlock key={field.id} field={field} />
        ) : (
          <Field
            key={field.id}
            htmlFor={field.id}
            label={field.label}
            required={field.validation.required}
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
              }}
            />
          </Field>
        ),
      )}

      {captchaSiteKey && (
        <TurnstileWidget
          key={captchaNonce}
          siteKey={captchaSiteKey}
          onToken={setCaptchaToken}
        />
      )}

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <div>
        <Button type="submit" disabled={submitting}>
          {submitting ? labels.submitting : labels.submit}
        </Button>
      </div>
    </form>
  );
}
