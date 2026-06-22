import "server-only";

import { prisma } from "@msk-forms/db";
import {
  DEFAULT_STATUSES,
  formSpecSchema,
  type FormSpec,
} from "@msk-forms/shared";

/** A status resolved to display metadata (label + color). */
export interface ResolvedStatus {
  key: string;
  label: string;
  color: string;
}

/**
 * Localized labels for the built-in default statuses, keyed by status key
 * (e.g. `dict.statusLabels`). Custom guild statuses keep their own label.
 */
export type StatusLabelMap = Record<string, string | undefined>;

/**
 * Resolve a status key to its label/color, preferring guild/form-specific
 * definitions and falling back to the built-in default pipeline. When `labels`
 * is provided, built-in statuses use the localized label.
 */
export function resolveStatus(
  key: string,
  defs: { key: string; label: string; color: string }[],
  labels?: StatusLabelMap,
): ResolvedStatus {
  const custom = defs.find((d) => d.key === key);
  if (custom) return { key, label: custom.label, color: custom.color };
  const fallback = DEFAULT_STATUSES.find((s) => s.key === key);
  return {
    key,
    label: labels?.[key] ?? fallback?.label ?? key,
    color: fallback?.color ?? "#6b6b72",
  };
}

/**
 * The full set of statuses a reviewer can move a submission to: the built-in
 * default pipeline, with guild/form-specific definitions overriding the label
 * and color of matching keys and appending any custom keys (ordered). When
 * `labels` is provided, non-overridden built-in statuses use the localized label.
 */
export function statusOptions(
  defs: { key: string; label: string; color: string; order?: number }[],
  labels?: StatusLabelMap,
): ResolvedStatus[] {
  const base: ResolvedStatus[] = DEFAULT_STATUSES.map((s) => {
    const override = defs.find((d) => d.key === s.key);
    return {
      key: s.key,
      label: override?.label ?? labels?.[s.key] ?? s.label,
      color: override?.color ?? s.color,
    };
  });
  const extra = defs
    .filter((d) => !DEFAULT_STATUSES.some((s) => s.key === d.key))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((d) => ({ key: d.key, label: d.label, color: d.color }));
  return [...base, ...extra];
}

/** Safely parse a stored Form.schema JSON blob into a typed FormSpec. */
export function parseFormSpec(schema: unknown): FormSpec | null {
  const result = formSpecSchema.safeParse(schema);
  return result.success ? result.data : null;
}

/** Load a form for the builder (edit mode), scoped to its guild. */
export async function getFormForEdit(formId: string, guildId: string) {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: {
      id: true,
      guildId: true,
      slug: true,
      title: true,
      description: true,
      status: true,
      visibility: true,
      schema: true,
      settings: true,
    },
  });
  if (!form || form.guildId !== guildId) return null;
  return form;
}

/** Load a live (published) form by slug for the public submission page. */
export async function getLiveFormBySlug(slug: string) {
  const form = await prisma.form.findUnique({
    where: { slug },
    select: {
      id: true,
      guildId: true,
      slug: true,
      title: true,
      description: true,
      status: true,
      visibility: true,
      schema: true,
      settings: true,
      guild: { select: { name: true, branding: true } },
    },
  });
  if (!form) return null;
  return { ...form, spec: parseFormSpec(form.schema) };
}

/**
 * Load a submission by its UUID (the public status link) together with the
 * form, the guild's status definitions, and the applicant-visible events.
 */
export async function getSubmissionForStatus(id: string) {
  const submission = await prisma.submission.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      answers: true,
      submittedAt: true,
      updatedAt: true,
      form: {
        select: {
          title: true,
          schema: true,
          guildId: true,
          guild: { select: { branding: true } },
        },
      },
      events: {
        where: { visibility: "public" },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          type: true,
          fromStatus: true,
          toStatus: true,
          message: true,
          createdAt: true,
        },
      },
      files: {
        select: { id: true, fieldId: true, filename: true },
      },
    },
  });
  if (!submission) return null;

  const statusDefs = await prisma.formStatusDef.findMany({
    where: { guildId: submission.form.guildId, visibleToApplicant: true },
    select: { key: true, label: true, color: true },
  });

  return {
    ...submission,
    spec: parseFormSpec(submission.form.schema),
    statusDefs,
  };
}

/**
 * Load a submission for the reviewer detail view, scoped to its guild (404s if
 * the submission belongs to another guild). Includes the full event timeline
 * (internal + public) with actor info and all of the guild's status defs.
 */
export async function getSubmissionForReview(
  id: string,
  guildId: string,
  labels?: StatusLabelMap,
) {
  const submission = await prisma.submission.findUnique({
    where: { id },
    select: {
      id: true,
      guildId: true,
      status: true,
      answers: true,
      submittedAt: true,
      updatedAt: true,
      form: { select: { title: true, schema: true } },
      user: { select: { username: true, avatar: true } },
      events: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          fromStatus: true,
          toStatus: true,
          message: true,
          visibility: true,
          createdAt: true,
          actor: { select: { username: true } },
        },
      },
      files: {
        select: { id: true, fieldId: true, filename: true },
      },
    },
  });
  if (!submission || submission.guildId !== guildId) return null;

  const statusDefs = await prisma.formStatusDef.findMany({
    where: { guildId },
    orderBy: { order: "asc" },
    select: { key: true, label: true, color: true, order: true },
  });

  return {
    ...submission,
    spec: parseFormSpec(submission.form.schema),
    statusDefs,
    options: statusOptions(statusDefs, labels),
  };
}
