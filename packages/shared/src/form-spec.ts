import { z } from "zod";

/**
 * Form-Spec — die JSON-Definition eines Formulars (Konzept.md §6–§8).
 * Wird in Form.schema (JSONB) gespeichert und zur Laufzeit gegen Submissions validiert.
 */

export const FIELD_TYPES = [
  // Eingabe
  "short_text",
  "long_text",
  "email",
  "number",
  "phone",
  "url",
  "password",
  // Auswahl
  "single_choice",
  "multi_choice",
  "dropdown",
  "multi_select",
  "yes_no",
  "ranking",
  "matrix",
  // Bewertung
  "rating_stars",
  "nps",
  "slider",
  "emoji_scale",
  // Medien
  "file_upload",
  "image_upload",
  "signature",
  // Spezial / Gaming
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

export const fieldValidationSchema = z.object({
  required: z.boolean().default(false),
  min: z.number().optional(),
  max: z.number().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
  allowedMimeTypes: z.array(z.string()).optional(),
  maxFileSizeMb: z.number().optional(),
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

/** Baut ein dynamisches zod-Schema zur Validierung einer Submission gegen eine Form-Spec. */
export function buildAnswerSchema(spec: FormSpec): z.ZodTypeAny {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const page of spec.pages) {
    for (const field of page.fields) {
      if (["section_break", "heading", "paragraph", "image_block", "divider", "spacer"].includes(field.type)) {
        continue;
      }
      let base: z.ZodTypeAny = z.string();
      if (field.type === "number" || field.type === "slider" || field.type === "nps" || field.type === "rating_stars") {
        base = z.number();
      } else if (field.type === "multi_choice" || field.type === "multi_select" || field.type === "ranking") {
        base = z.array(z.string());
      } else if (field.type === "yes_no" || field.type === "consent" || field.type === "age_check") {
        base = z.boolean();
      }
      shape[field.id] = field.validation.required ? base : base.optional();
    }
  }
  return z.object(shape);
}
