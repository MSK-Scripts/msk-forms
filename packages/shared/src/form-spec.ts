import { z } from "zod";

/**
 * Form spec — the JSON definition of a form (concept §6–§8).
 * Stored in Form.schema (JSONB) and validated against submissions at runtime.
 */

export const FIELD_TYPES = [
  // Input
  "short_text",
  "long_text",
  "email",
  "number",
  "phone",
  "url",
  "password",
  // Choice
  "single_choice",
  "multi_choice",
  "dropdown",
  "multi_select",
  "yes_no",
  "ranking",
  "matrix",
  // Rating
  "rating_stars",
  "nps",
  "slider",
  "emoji_scale",
  // Media
  "file_upload",
  "image_upload",
  "signature",
  // Special / gaming
  "date",
  "time",
  "datetime",
  "address",
  "country",
  "discord_user",
  "steam_hex",
  "fivem_id",
  "age_check",
  "consent",
  "captcha",
  // Layout
  "section_break",
  "heading",
  "paragraph",
  "image_block",
  "divider",
  "spacer",
] as const;

export const fieldTypeSchema = z.enum(FIELD_TYPES);
export type FieldType = z.infer<typeof fieldTypeSchema>;

export const conditionOperatorSchema = z.enum([
  "equals",
  "not_equals",
  "contains",
  "greater_than",
  "less_than",
  "is_empty",
  "is_not_empty",
  "in_list",
]);

export const conditionRuleSchema = z.object({
  when: z.object({
    field: z.string(),
    op: conditionOperatorSchema,
    value: z.unknown().optional(),
  }),
  action: z.enum(["show", "hide", "require", "skip_to"]),
  target: z.string().optional(),
});

/** Absolute server-side ceiling for a single upload, regardless of field config. */
export const MAX_FILE_SIZE_MB = 25;

export const fieldValidationSchema = z.object({
  required: z.boolean().default(false),
  min: z.number().optional(),
  max: z.number().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
  allowedMimeTypes: z.array(z.string()).optional(),
  // Capped at the hard server limit so a crafted spec can't raise it.
  maxFileSizeMb: z.number().positive().max(MAX_FILE_SIZE_MB).optional(),
  // Step size for slider fields (defaults to 1 when unset).
  step: z.number().positive().optional(),
});

export const fieldOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  score: z.number().optional(),
});

/** A matrix row (sub-question). Columns reuse the field's `options`. */
export const matrixRowSchema = z.object({
  id: z.string(),
  label: z.string(),
});
export type MatrixRow = z.infer<typeof matrixRowSchema>;

export const formFieldSchema = z.object({
  id: z.string(),
  type: fieldTypeSchema,
  label: z.string().optional(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  width: z.enum(["full", "half", "third"]).default("full"),
  defaultValue: z.unknown().optional(),
  options: z.array(fieldOptionSchema).optional(),
  // Matrix sub-questions (rows); the shared column choices live in `options`.
  rows: z.array(matrixRowSchema).optional(),
  validation: fieldValidationSchema.default({ required: false }),
  conditional: z.array(conditionRuleSchema).default([]),
  translations: z.record(z.string(), z.record(z.string(), z.string())).optional(),
});
export type FormField = z.infer<typeof formFieldSchema>;

export const formPageSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  fields: z.array(formFieldSchema),
});
export type FormPage = z.infer<typeof formPageSchema>;

export const formSpecSchema = z.object({
  version: z.number().int().default(1),
  pages: z.array(formPageSchema).min(1),
});
export type FormSpec = z.infer<typeof formSpecSchema>;

/**
 * Field types whose answer is an uploaded file reference, not a scalar.
 * `signature` is included: the canvas drawing is uploaded as a PNG and stored
 * exactly like any other file answer.
 */
export const FILE_FIELD_TYPES = ["file_upload", "image_upload", "signature"] as const;

/**
 * The answer value for a file field: a reference to an object already uploaded
 * (via the upload endpoint) to object storage. The bytes never travel in the
 * submit JSON — only this descriptor does.
 */
export const fileAnswerSchema = z.object({
  key: z.string().min(1).max(512),
  name: z.string().min(1).max(255),
  size: z.number().int().nonnegative(),
  mime: z.string().min(1).max(255),
});
export type FileAnswer = z.infer<typeof fileAnswerSchema>;

/** Field types that carry no answer (pure layout/markup). */
export const LAYOUT_FIELD_TYPES = [
  "section_break",
  "heading",
  "paragraph",
  "image_block",
  "divider",
  "spacer",
] as const;

/** True for layout-only fields, which never produce a submission answer. */
export function isLayoutField(type: FieldType): boolean {
  return (LAYOUT_FIELD_TYPES as readonly string[]).includes(type);
}

/** Emoji shown for an `emoji_scale` field, lowest → highest (value = index + 1). */
export const EMOJI_SCALE = ["😡", "😕", "😐", "🙂", "😍"] as const;

/** NPS is a fixed 0–10 scale. */
export const NPS_MIN = 0;
export const NPS_MAX = 10;

/** Rating-family field types whose answer is a number on a bounded scale. */
export const SCALE_FIELD_TYPES = ["rating_stars", "nps", "slider", "emoji_scale"] as const;

/**
 * Resolved scale bounds for a rating-family field. Per-type defaults: NPS is a
 * fixed 0–10, emoji is 1–5, stars default to 1–5 (overridable via `max`), and a
 * slider falls back to 0–100 step 1. Shared by the renderer widgets, the
 * server-side validation, and the answer formatter so they can't drift.
 */
export function scaleBounds(field: FormField): { min: number; max: number; step: number } {
  const v = field.validation;
  switch (field.type) {
    case "nps":
      return { min: NPS_MIN, max: NPS_MAX, step: 1 };
    case "emoji_scale":
      return { min: 1, max: EMOJI_SCALE.length, step: 1 };
    case "rating_stars":
      return { min: 1, max: v.max ?? 5, step: 1 };
    case "slider":
      return { min: v.min ?? 0, max: v.max ?? 100, step: v.step ?? 1 };
    default:
      return { min: v.min ?? 0, max: v.max ?? 0, step: v.step ?? 1 };
  }
}

/** Caller-supplied labels for {@link formatAnswerValue} (lets each surface i18n). */
export interface AnswerValueLabels {
  /** Shown for an empty/missing answer. */
  empty: string;
  yes: string;
  no: string;
}

/**
 * Framework-agnostic, human-readable rendering of a single answer value: maps
 * option values to their labels, joins arrays, formats booleans, and shows a
 * file-descriptor answer by its filename. Shared by the reviewer/status answer
 * summary and the bot's review-embed preview so they never drift.
 */
export function formatAnswerValue(
  field: FormField,
  value: unknown,
  labels: AnswerValueLabels,
): string {
  if (value === undefined || value === null || value === "") return labels.empty;
  if (typeof value === "boolean") return value ? labels.yes : labels.no;

  const labelFor = (v: string) => field.options?.find((o) => o.value === v)?.label ?? v;

  // Matrix answer: { rowId: columnValue } → "Row: Column; Row: Column".
  if (field.type === "matrix" && typeof value === "object" && !Array.isArray(value)) {
    const answers = value as Record<string, unknown>;
    const lines = (field.rows ?? [])
      .filter((row) => answers[row.id] != null && answers[row.id] !== "")
      .map((row) => `${row.label}: ${labelFor(String(answers[row.id]))}`);
    return lines.length > 0 ? lines.join("; ") : labels.empty;
  }

  if (Array.isArray(value)) return value.map((v) => labelFor(String(v))).join(", ");
  // File-descriptor answer ({ key, name, size, mime }) — show the filename.
  if (typeof value === "object" && "name" in value) {
    return String((value as { name: unknown }).name);
  }
  // Rating-family fields read better with their scale shown.
  if (field.type === "emoji_scale") {
    const emoji = EMOJI_SCALE[Math.round(Number(value)) - 1];
    return emoji ? `${emoji} (${Number(value)}/${EMOJI_SCALE.length})` : String(value);
  }
  if (field.type === "nps") return `${value} / ${NPS_MAX}`;
  if (field.type === "rating_stars") return `★ ${value}`;
  if (field.options) return labelFor(String(value));
  return String(value);
}

const NUMBER_TYPES = ["number", "slider", "nps", "rating_stars", "emoji_scale"];
const MULTI_TYPES = ["multi_choice", "multi_select", "ranking"];
const BOOLEAN_TYPES = ["yes_no", "consent", "age_check"];
const SINGLE_CHOICE_TYPES = ["single_choice", "dropdown"];

/**
 * Builds a dynamic zod schema to validate a submission against a form spec.
 * Enforces the full `field.validation` contract server-side — not just
 * `required` — so the API never trusts the client to honor min/max, lengths,
 * patterns, formats, or the allowed option set.
 */
export function buildAnswerSchema(spec: FormSpec): z.ZodTypeAny {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const page of spec.pages) {
    for (const field of page.fields) {
      if (isLayoutField(field.type)) continue;
      shape[field.id] = buildFieldSchema(field);
    }
  }
  return z.object(shape);
}

function buildFieldSchema(field: FormField): z.ZodTypeAny {
  const v = field.validation;
  const optionValues = field.options?.map((o) => o.value) ?? [];
  let base: z.ZodTypeAny;

  if (NUMBER_TYPES.includes(field.type)) {
    let n = z.number();
    if ((SCALE_FIELD_TYPES as readonly string[]).includes(field.type)) {
      // Rating-family: enforce the resolved scale bounds, not raw min/max.
      const { min, max } = scaleBounds(field);
      n = n.min(min).max(max);
    } else {
      if (v.min !== undefined) n = n.min(v.min);
      if (v.max !== undefined) n = n.max(v.max);
    }
    base = n;
  } else if (MULTI_TYPES.includes(field.type)) {
    let arr = z.array(z.string());
    if (v.min !== undefined) arr = arr.min(v.min);
    if (v.max !== undefined) arr = arr.max(v.max);
    base =
      optionValues.length > 0
        ? arr.refine((vals) => vals.every((x) => optionValues.includes(x)), "Invalid option.")
        : arr;
  } else if (BOOLEAN_TYPES.includes(field.type)) {
    base = z.boolean();
  } else if (field.type === "matrix") {
    // Answer is { rowId: columnValue }; each row picks one of the columns.
    const col = optionValues.length > 0 ? z.enum(optionValues as [string, ...string[]]) : z.string();
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const row of field.rows ?? []) {
      shape[row.id] = v.required ? col : col.optional();
    }
    base = z.object(shape);
  } else if ((FILE_FIELD_TYPES as readonly string[]).includes(field.type)) {
    base = fileAnswerSchema;
  } else if (SINGLE_CHOICE_TYPES.includes(field.type)) {
    base = optionValues.length > 0 ? z.enum(optionValues as [string, ...string[]]) : z.string();
  } else {
    // Text-like fields (short_text, long_text, email, url, phone, etc.).
    let s = z.string();
    if (v.minLength !== undefined) s = s.min(v.minLength);
    if (v.maxLength !== undefined) s = s.max(v.maxLength);
    if (field.type === "email") s = s.email();
    if (field.type === "url") s = s.url();
    if (v.pattern) {
      try {
        const re = new RegExp(v.pattern);
        s = s.regex(re, "Invalid format.");
      } catch {
        // Ignore an invalid stored pattern rather than rejecting everything.
      }
    }
    base = s;
  }

  if (!v.required) return base.optional();
  // A required field must be present; for text, also reject the empty string.
  if (base instanceof z.ZodString) return (base as z.ZodString).min(v.minLength ?? 1);
  return base;
}
