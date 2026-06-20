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
});

export const fieldOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  score: z.number().optional(),
});

export const formFieldSchema = z.object({
  id: z.string(),
  type: fieldTypeSchema,
  label: z.string().optional(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  width: z.enum(["full", "half", "third"]).default("full"),
  defaultValue: z.unknown().optional(),
  options: z.array(fieldOptionSchema).optional(),
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

/** Field types whose answer is an uploaded file reference, not a scalar. */
export const FILE_FIELD_TYPES = ["file_upload", "image_upload"] as const;

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

  if (Array.isArray(value)) return value.map((v) => labelFor(String(v))).join(", ");
  // File-descriptor answer ({ key, name, size, mime }) — show the filename.
  if (typeof value === "object" && "name" in value) {
    return String((value as { name: unknown }).name);
  }
  if (field.options) return labelFor(String(value));
  return String(value);
}

const NUMBER_TYPES = ["number", "slider", "nps", "rating_stars"];
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
    if (v.min !== undefined) n = n.min(v.min);
    if (v.max !== undefined) n = n.max(v.max);
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
