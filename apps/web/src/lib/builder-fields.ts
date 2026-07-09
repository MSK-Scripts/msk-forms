import type { FieldType, FormField } from "@msk-forms/shared";

/** Field types the builder offers (the subset the renderer supports today). */
export const BUILDER_FIELDS: { type: FieldType; label: string }[] = [
  { type: "short_text", label: "Short text" },
  { type: "long_text", label: "Long text" },
  { type: "email", label: "Email" },
  { type: "number", label: "Number" },
  { type: "phone", label: "Phone" },
  { type: "url", label: "URL" },
  { type: "single_choice", label: "Single choice" },
  { type: "dropdown", label: "Dropdown" },
  { type: "multi_choice", label: "Multiple choice" },
  { type: "yes_no", label: "Yes / No" },
  { type: "rating_stars", label: "Star rating" },
  { type: "nps", label: "NPS (0–10)" },
  { type: "slider", label: "Slider" },
  { type: "emoji_scale", label: "Emoji scale" },
  { type: "matrix", label: "Matrix" },
  { type: "calculated", label: "Calculated" },
  { type: "date", label: "Date" },
  { type: "file_upload", label: "File upload" },
  { type: "image_upload", label: "Image upload" },
  { type: "signature", label: "Signature" },
  { type: "consent", label: "Consent" },
  { type: "heading", label: "Heading" },
  { type: "paragraph", label: "Paragraph" },
  { type: "divider", label: "Divider" },
];

// `matrix` also needs an option editor — its options are the shared columns.
const CHOICE_TYPES: FieldType[] = ["single_choice", "dropdown", "multi_choice", "matrix"];
const ROWS_CONFIG_TYPES: FieldType[] = ["matrix"];
// Distinct from shared LAYOUT_FIELD_TYPES: only the layout types the builder
// currently offers (not every layout type the renderer can display).
const BUILDER_LAYOUT_TYPES: FieldType[] = ["heading", "paragraph", "divider"];

export const fieldTypeLabel = (type: FieldType): string =>
  BUILDER_FIELDS.find((f) => f.type === type)?.label ?? type;

// Star rating exposes a max; slider exposes min/max/step. NPS (0–10) and emoji
// (1–5) have fixed scales, so they need no extra config.
const STARS_CONFIG_TYPES: FieldType[] = ["rating_stars"];
const SLIDER_CONFIG_TYPES: FieldType[] = ["slider"];

export const needsOptions = (type: FieldType): boolean => CHOICE_TYPES.includes(type);
/** Yes/No fields expose a points editor for the "yes" and "no" answers. */
export const needsYesNoScore = (type: FieldType): boolean => type === "yes_no";
export const isLayoutType = (type: FieldType): boolean => BUILDER_LAYOUT_TYPES.includes(type);
/** Calculated fields configure an arithmetic formula instead of an input. */
export const needsFormula = (type: FieldType): boolean => type === "calculated";
export const needsStarsConfig = (type: FieldType): boolean => STARS_CONFIG_TYPES.includes(type);
export const needsSliderConfig = (type: FieldType): boolean => SLIDER_CONFIG_TYPES.includes(type);
export const needsRows = (type: FieldType): boolean => ROWS_CONFIG_TYPES.includes(type);

/**
 * Convert an existing field to a different type. Keeps the parts that are
 * type-agnostic (id, label, help text, placeholder, width, conditional rules,
 * required flag) and resets the type-specific configuration that no longer
 * applies. Options/rows survive when both the old and new type use them (e.g.
 * single_choice -> dropdown), otherwise they are cleared. Type-specific
 * validation bounds (min/max/step, lengths, pattern, file limits) are dropped
 * because they are reconfigured per type.
 */
export function migrateFieldType(field: FormField, newType: FieldType): FormField {
  return {
    id: field.id,
    type: newType,
    label: field.label,
    description: field.description,
    placeholder: field.placeholder,
    width: field.width,
    conditional: field.conditional,
    validation: { required: field.validation.required },
    ...(needsOptions(newType) ? { options: field.options ?? [] } : {}),
    ...(needsRows(newType) ? { rows: field.rows ?? [] } : {}),
    ...(needsFormula(newType) ? { formula: field.formula } : {}),
  };
}

/**
 * Whether a field holds type-specific configuration that a type change could
 * reset (options, matrix rows, a formula, or any validation bound beyond
 * `required`). Drives the "switching type resets configuration" warning.
 */
export function fieldCarriesTypeData(field: FormField): boolean {
  const v = field.validation;
  return (
    (field.options?.length ?? 0) > 0 ||
    (field.rows?.length ?? 0) > 0 ||
    Boolean(field.formula) ||
    v.min !== undefined ||
    v.max !== undefined ||
    v.step !== undefined ||
    v.minLength !== undefined ||
    v.maxLength !== undefined ||
    Boolean(v.pattern) ||
    (v.allowedMimeTypes?.length ?? 0) > 0 ||
    v.maxFileSizeMb !== undefined
  );
}
