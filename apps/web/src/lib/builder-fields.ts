import type { FieldType } from "@msk-forms/shared";

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
  { type: "date", label: "Date" },
  { type: "file_upload", label: "File upload" },
  { type: "image_upload", label: "Image upload" },
  { type: "consent", label: "Consent" },
  { type: "heading", label: "Heading" },
  { type: "paragraph", label: "Paragraph" },
  { type: "divider", label: "Divider" },
];

const CHOICE_TYPES: FieldType[] = ["single_choice", "dropdown", "multi_choice"];
const LAYOUT_TYPES: FieldType[] = ["heading", "paragraph", "divider"];

export const fieldTypeLabel = (type: FieldType): string =>
  BUILDER_FIELDS.find((f) => f.type === type)?.label ?? type;

export const needsOptions = (type: FieldType): boolean => CHOICE_TYPES.includes(type);
export const isLayoutType = (type: FieldType): boolean => LAYOUT_TYPES.includes(type);
