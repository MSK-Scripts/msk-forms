"use client";

import type { FormField, FormSpec } from "@msk-forms/shared";
import { Button, Field } from "@msk-forms/ui";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FieldInput, LAYOUT_TYPES, type FieldValue } from "./field-input";
import { LayoutBlock } from "./layout-block";

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

export function FormRenderer({ slug, spec }: { slug: string; spec: FormSpec }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
        next[field.id] = "This field is required.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/forms/${slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Submission failed.");
      }
      const { submissionId } = (await res.json()) as { submissionId: string };
      router.push(`/s/${submissionId}` as Route);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed.");
      setSubmitting(false);
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
            />
          </Field>
        ),
      )}

      {submitError && (
        <p className="font-mono text-xs text-red-400">{submitError}</p>
      )}

      <div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit"}
        </Button>
      </div>
    </form>
  );
}
