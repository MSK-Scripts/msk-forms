"use client";

import {
  computePagePath,
  evaluateFormula,
  isAnswerMissing,
  isComputedField,
  isFieldRequired,
  isFieldVisible,
  isLayoutField,
  type FormField,
  type FormPage,
  type FormSpec,
} from "@msk-forms/shared";
import { Button, Field, fieldDescribedBy } from "@msk-forms/ui";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Info, WarningCircle } from "@/components/icons";

import { FieldInput, isGroupField, type FieldValue } from "./field-input";
import { LayoutBlock } from "./layout-block";
import { TurnstileWidget } from "./turnstile-widget";

type Answers = Record<string, FieldValue>;

function isLayout(field: FormField): boolean {
  return isLayoutField(field.type);
}

export interface FormLabels {
  /** The app's language, for dates. */
  locale: string;
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
  dateToday: string;
  dateClear: string;
  dateNow: string;
  dateEmpty: string;
  timeEmpty: string;
  datetimeEmpty: string;
  prevMonth: string;
  nextMonth: string;
  hour: string;
  minute: string;
  previewNote: string;
  yes: string;
  no: string;
  selectPlaceholder: string;
  agree: string;
  calculatedEmpty: string;
  countryCode: string;
  uploaded: string;
}

export function FormRenderer({
  slug,
  spec,
  labels,
  captchaSiteKey,
  experimentVariant,
  preview = false,
}: {
  slug: string;
  spec: FormSpec;
  labels: FormLabels;
  captchaSiteKey?: string | null;
  /** Assigned A/B-test variant, sent with the submission for conversion tracking. */
  experimentVariant?: string;
  /** Render-only mode for managers: validates and navigates but never submits. */
  preview?: boolean;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const stepRef = useRef<HTMLParagraphElement>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [previewDone, setPreviewDone] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  // Turnstile tokens are single-use; bump this to remount the widget (and get a
  // fresh token) after a failed submit.
  const [captchaNonce, setCaptchaNonce] = useState(0);

  const pages = spec.pages;
  // For resolving {fieldId} references in calculated fields.
  const fieldsById = new Map(pages.flatMap((p) => p.fields).map((f) => [f.id, f]));
  const visibleFieldsOf = (page: FormPage) => page.fields.filter((f) => isFieldVisible(f, answers));
  // The flow follows `skip_to` jumps from page 0, then within that path a page is
  // shown only if it still has a visible field. Pages off the path or fully
  // hidden are skipped for navigation, progress and validation alike.
  const shownPageIndices = computePagePath(pages, answers).filter(
    (i) => visibleFieldsOf(pages[i]!).length > 0,
  );
  // Fall back to the first shown page if the current step was hidden away.
  const activeIndex = shownPageIndices.includes(step) ? step : (shownPageIndices[0] ?? 0);
  const position = Math.max(0, shownPageIndices.indexOf(activeIndex));
  const totalSteps = shownPageIndices.length;
  const isFirst = position <= 0;
  const isLast = position >= totalSteps - 1;
  const activeFields = visibleFieldsOf(pages[activeIndex] ?? { id: "", fields: [] });

  function setAnswer(id: string, value: FieldValue) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    if (previewDone) setPreviewDone(false);
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
      // Layout has no value; calculated fields are derived, never entered.
      if (isLayout(field) || isComputedField(field.type) || !isFieldVisible(field, answers))
        continue;
      if (isFieldRequired(field, answers) && isAnswerMissing(field, answers[field.id])) {
        out[field.id] = labels.required;
      }
    }
    return out;
  }

  /**
   * After a failed check the focus goes to the first field with an error, so
   * a keyboard or screen reader user lands on it instead of searching.
   */
  function focusFirstError() {
    requestAnimationFrame(() => {
      const form = formRef.current;
      const el =
        form?.querySelector<HTMLElement>('[aria-invalid="true"]') ??
        form?.querySelector<HTMLElement>(
          'fieldset[aria-describedby$="-error"] input, fieldset[aria-describedby$="-error"] button',
        );
      el?.focus();
    });
  }

  /**
   * A new step replaces the button that was pressed, so the focus would fall
   * back to the top of the document. It goes to the step line instead, which
   * names the step, and the page scrolls there.
   */
  function focusStep() {
    requestAnimationFrame(() => {
      stepRef.current?.focus();
      stepRef.current?.scrollIntoView({ block: "nearest" });
    });
  }

  function goNext() {
    const pageErrors = collectErrors(activeFields);
    if (Object.keys(pageErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...pageErrors }));
      focusFirstError();
      return;
    }
    const nextIndex = shownPageIndices[position + 1];
    if (nextIndex !== undefined) {
      setStep(nextIndex);
      focusStep();
    }
  }

  function goBack() {
    const prevIndex = shownPageIndices[position - 1];
    if (prevIndex !== undefined) {
      setStep(prevIndex);
      focusStep();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    // A submit from a non-final step (e.g. pressing Enter in a field) must only
    // advance, never submit — otherwise the remaining pages are skipped. The
    // captcha token check used to mask this; it no longer runs on custom domains.
    if (!isLast) {
      goNext();
      return;
    }

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
      focusFirstError();
      return;
    }
    // Preview mode (managers): the form passed validation, but never submit.
    if (preview) {
      setPreviewDone(true);
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
        body: JSON.stringify({ answers, captchaToken, experimentVariant }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
          submissionId?: string;
        } | null;
        // Already has an active submission → send them to its status page
        // rather than showing an error.
        if (res.status === 409 && data?.submissionId) {
          router.push(`/s/${data.submissionId}` as Route);
          return;
        }
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

  const fieldLabels = {
    yes: labels.yes,
    no: labels.no,
    selectPlaceholder: labels.selectPlaceholder,
    agree: labels.agree,
    calculatedEmpty: labels.calculatedEmpty,
    countryCode: labels.countryCode,
    file: {
      uploading: labels.fileUploading,
      remove: labels.fileRemove,
      uploadFailed: labels.uploadFailed,
      clear: labels.signatureClear,
      uploaded: labels.uploaded,
    },
    date: {
      locale: labels.locale,
      today: labels.dateToday,
      clear: labels.dateClear,
      now: labels.dateNow,
      empty: { date: labels.dateEmpty, time: labels.timeEmpty, datetime: labels.datetimeEmpty },
      prevMonth: labels.prevMonth,
      nextMonth: labels.nextMonth,
      hour: labels.hour,
      minute: labels.minute,
    },
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="grid gap-7" noValidate>
      {totalSteps > 1 && (
        <div className="grid gap-2">
          <p
            ref={stepRef}
            tabIndex={-1}
            className="text-small font-semibold text-muted-foreground focus:outline-none"
          >
            {labels.step} {position + 1} / {totalSteps}
            {pages[activeIndex]?.title ? ` · ${pages[activeIndex]!.title}` : ""}
          </p>
          <div aria-hidden className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            {/* A width from state has no class; style-src allows it (proxy.ts). */}
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200"
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
            hint={
              field.type === "consent" || field.type === "age_check" ? undefined : field.description
            }
            error={errors[field.id]}
            group={isGroupField(field.type)}
            errorIcon={<WarningCircle className="mt-0.5 h-4 w-4 shrink-0" weight="bold" />}
          >
            <FieldInput
              field={field}
              value={
                isComputedField(field.type)
                  ? (evaluateFormula(field.formula, fieldsById, answers) ?? undefined)
                  : answers[field.id]
              }
              onChange={(v) => setAnswer(field.id, v)}
              invalid={Boolean(errors[field.id])}
              disabled={submitting}
              describedBy={fieldDescribedBy(field.id, {
                hint:
                  field.type === "consent" || field.type === "age_check"
                    ? undefined
                    : field.description,
                error: errors[field.id],
              })}
              slug={slug}
              labels={fieldLabels}
            />
          </Field>
        ),
      )}

      {isLast && captchaSiteKey && (
        <TurnstileWidget key={captchaNonce} siteKey={captchaSiteKey} onToken={setCaptchaToken} />
      )}

      {submitError && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md border-l-4 border-danger bg-muted px-4 py-3 font-semibold text-danger"
        >
          <WarningCircle className="mt-0.5 h-5 w-5 shrink-0" weight="bold" />
          {submitError}
        </p>
      )}

      {previewDone && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-md border-l-4 border-primary bg-accent-soft px-4 py-3 font-semibold text-primary"
        >
          <Info className="mt-0.5 h-5 w-5 shrink-0" weight="bold" />
          {labels.previewNote}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {!isFirst && (
          <Button type="button" variant="ghost" onClick={goBack} disabled={submitting}>
            {labels.back}
          </Button>
        )}
        {isLast ? (
          // Distinct keys so React mounts a fresh node instead of reusing the
          // "Next" button and morphing its `type` to "submit". Without this, a
          // "Next" click's setStep flushes synchronously (discrete event), the
          // same <button> node becomes type="submit", and the click's default
          // action submits the form — skipping the remaining pages. (Masked on
          // the primary host by the captcha gate; visible on custom domains.)
          <Button key="step-submit" type="submit" disabled={submitting}>
            {submitting ? labels.submitting : labels.submit}
          </Button>
        ) : (
          <Button
            key="step-next"
            type="button"
            onClick={(e) => {
              // Belt-and-suspenders: prevent any default form submission from
              // this click even if the node still morphs mid-flush.
              e.preventDefault();
              goNext();
            }}
          >
            {labels.next}
          </Button>
        )}
      </div>
    </form>
  );
}
