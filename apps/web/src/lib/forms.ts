import "server-only";

import { prisma } from "@msk-forms/db";
import {
  DEFAULT_STATUSES,
  formatAnswerValue,
  formSpecSchema,
  isLayoutField,
  isTerminalStatus,
  parseFormSettings,
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

/**
 * Resolve a guild's full status option set (built-in pipeline + custom defs) for
 * pickers like the automations editor. Returns `{ value, label }` entries.
 */
export async function getStatusOptionsForGuild(
  guildId: string,
  labels?: StatusLabelMap,
): Promise<{ value: string; label: string }[]> {
  const defs = await prisma.formStatusDef.findMany({
    where: { guildId },
    orderBy: { order: "asc" },
    select: { key: true, label: true, color: true, order: true },
  });
  return statusOptions(defs, labels).map((s) => ({ value: s.key, label: s.label }));
}

/** A form's submissions flattened to a table, shared by exports and the REST API. */
export interface SubmissionsTable {
  formTitle: string;
  columns: string[];
  rows: string[][];
}

/**
 * Build a form's submissions as a flat table (columns = id/date/status/applicant
 * + each non-layout field; cells via the shared answer formatter). Scoped to the
 * guild (returns null if the form belongs to another guild or is misconfigured).
 * `statusLabels` localizes the built-in status labels (omit for English).
 */
export async function getSubmissionsTable(
  formId: string,
  guildId: string,
  statusLabels?: StatusLabelMap,
): Promise<SubmissionsTable | null> {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: { guildId: true, title: true, schema: true },
  });
  if (!form || form.guildId !== guildId) return null;

  const spec = parseFormSpec(form.schema);
  if (!spec) return null;

  const [submissions, defs] = await Promise.all([
    prisma.submission.findMany({
      where: { formId, guildId },
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        status: true,
        answers: true,
        submittedAt: true,
        user: { select: { username: true } },
      },
    }),
    prisma.formStatusDef.findMany({
      where: { guildId },
      select: { key: true, label: true, color: true },
    }),
  ]);

  const fields = spec.pages.flatMap((p) => p.fields).filter((f) => !isLayoutField(f.type));
  const labels = { empty: "", yes: "Yes", no: "No" };
  const columns = [
    "Submission ID",
    "Submitted",
    "Status",
    "Applicant",
    ...fields.map((f) => f.label ?? f.id),
  ];
  const rows = submissions.map((s) => {
    const answers = (s.answers ?? {}) as Record<string, unknown>;
    return [
      s.id,
      s.submittedAt.toISOString(),
      resolveStatus(s.status, defs, statusLabels).label,
      s.user?.username ?? "Anonymous",
      ...fields.map((f) => formatAnswerValue(f, answers[f.id], labels)),
    ];
  });

  return { formTitle: form.title, columns, rows };
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
      openAt: true,
      closeAt: true,
      categoryId: true,
    },
  });
  if (!form || form.guildId !== guildId) return null;
  return form;
}

/** Live (published) forms for a guild, for the public form hub (grouped by category). */
export async function getLiveFormsForGuild(guildId: string) {
  const forms = await prisma.form.findMany({
    where: { guildId, status: "live" },
    orderBy: { createdAt: "desc" },
    select: {
      slug: true,
      title: true,
      description: true,
      openAt: true,
      closeAt: true,
      categoryId: true,
      settings: true,
    },
  });
  return forms.map(({ settings, ...form }) => ({
    ...form,
    showCountdown: parseFormSettings(settings).showCountdown === true,
  }));
}

/** Resolve a guild by its public hub handle (primary-domain vanity path). */
export async function getGuildByHandle(handle: string) {
  return prisma.guild.findUnique({
    where: { handle },
    select: { id: true, name: true, branding: true },
  });
}

/** A guild's categories in display order (for the builder picker and public hub). */
export async function getGuildCategories(guildId: string) {
  return prisma.formCategory.findMany({
    where: { guildId },
    orderBy: { order: "asc" },
    select: { id: true, name: true, color: true },
  });
}

/** Validate that a category belongs to the guild; returns the id or null. */
export async function resolveGuildCategoryId(
  guildId: string,
  categoryId: string | null | undefined,
): Promise<string | null> {
  if (!categoryId) return null;
  const cat = await prisma.formCategory.findFirst({
    where: { id: categoryId, guildId },
    select: { id: true },
  });
  return cat ? cat.id : null;
}

/**
 * Resolve a category by name within a guild, creating it if it does not exist
 * yet. Used by form import (the definition carries a category name, not an id).
 * Returns the id or null for an empty name.
 */
export async function resolveOrCreateCategoryByName(
  guildId: string,
  name: string | null | undefined,
): Promise<string | null> {
  const trimmed = name?.trim();
  if (!trimmed) return null;
  const existing = await prisma.formCategory.findFirst({
    where: { guildId, name: trimmed },
    select: { id: true },
  });
  if (existing) return existing.id;
  const count = await prisma.formCategory.count({ where: { guildId } });
  const created = await prisma.formCategory.create({
    data: { guildId, name: trimmed, order: count },
    select: { id: true },
  });
  return created.id;
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
      openAt: true,
      closeAt: true,
      guild: { select: { name: true, branding: true } },
    },
  });
  if (!form) return null;
  return { ...form, spec: parseFormSpec(form.schema) };
}

/**
 * The id of a signed-in applicant's active (non-terminal) submission for a form,
 * or null when they have none. Used to enforce "one active submission per
 * person": while such a submission exists the applicant is sent to its status
 * page instead of the form. Considers only their most recent submission — once
 * it reaches a terminal status they may apply again.
 */
export async function findActiveSubmissionId(
  formId: string,
  userId: string,
  guildId: string,
): Promise<string | null> {
  const [latest, defs] = await Promise.all([
    prisma.submission.findFirst({
      where: { formId, userId },
      orderBy: { submittedAt: "desc" },
      select: { id: true, status: true },
    }),
    prisma.formStatusDef.findMany({
      where: { guildId },
      select: { key: true, isTerminal: true },
    }),
  ]);
  if (!latest) return null;
  return isTerminalStatus(latest.status, defs) ? null : latest.id;
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
      formId: true,
      status: true,
      score: true,
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
