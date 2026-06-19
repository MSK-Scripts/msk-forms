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
 * Resolve a status key to its label/color, preferring guild/form-specific
 * definitions and falling back to the built-in default pipeline.
 */
export function resolveStatus(
  key: string,
  defs: { key: string; label: string; color: string }[],
): ResolvedStatus {
  const custom = defs.find((d) => d.key === key);
  if (custom) return { key, label: custom.label, color: custom.color };
  const fallback = DEFAULT_STATUSES.find((s) => s.key === key);
  return { key, label: fallback?.label ?? key, color: fallback?.color ?? "#6b6b72" };
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
        select: { title: true, schema: true, guildId: true },
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
