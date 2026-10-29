"use client";

import { EMOJI_SCALE, scaleBounds, type FileAnswer, type FormField } from "@msk-forms/shared";
import {
  Checkbox,
  CheckboxGroup,
  Input,
  RadioGroup,
  Select,
  Textarea,
  fieldClass,
} from "@msk-forms/ui";

import { DateField, type DateFieldLabels } from "./date-field";
import { FileField, type FileFieldLabels } from "./file-field";
import { MatrixField } from "./matrix-field";
import { PhoneField } from "./phone-field";
import { ScaleButtons, SliderInput, StarRating } from "./rating-fields";
import { SignatureField } from "./signature-field";

export type FieldValue =
  string | number | boolean | string[] | FileAnswer | Record<string, string> | undefined;

/** Copy the controls need beyond the field's own texts. */
export interface FieldInputLabels {
  yes: string;
  no: string;
  /** Placeholder of a dropdown without one of its own. */
  selectPlaceholder: string;
  /** Label of a consent box without one of its own. */
  agree: string;
  /** What a calculated field shows before there is anything to calculate. */
  calculatedEmpty: string;
  countryCode: string;
  file: FileFieldLabels;
  date: DateFieldLabels;
}

/**
 * Field types made of several controls (radios, checkboxes, a scale, a
 * matrix): Field renders them as a fieldset whose legend is the question, so
 * the question is announced with every option.
 */
const GROUP_TYPES = new Set<string>([
  "single_choice",
  "multi_choice",
  "multi_select",
  "yes_no",
  "rating_stars",
  "nps",
  "emoji_scale",
  "matrix",
  "signature",
]);

export function isGroupField(type: string): boolean {
  return GROUP_TYPES.has(type);
}

interface FieldInputProps {
  field: FormField;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  invalid?: boolean;
  disabled?: boolean;
  /** Hint or error of the field, for the control's aria-describedby. */
  describedBy?: string;
  /** The form slug, needed by file fields to drive uploads. */
  slug: string;
  labels: FieldInputLabels;
}

/** Renders the interactive control for a single (non-layout) form field. */
export function FieldInput({
  field,
  value,
  onChange,
  invalid,
  disabled,
  describedBy,
  slug,
  labels,
}: FieldInputProps) {
  const id = field.id;
  const options = (field.options ?? []).map((o) => ({ value: o.value, label: o.label }));
  const described = { "aria-describedby": describedBy };

  switch (field.type) {
    // Calculated: read-only, derived from other answers. The value is computed
    // by the renderer and passed in; the applicant never edits it. An <output>
    // can carry the field's label.
    case "calculated": {
      const empty = value === undefined || value === "";
      return (
        <output
          id={id}
          {...described}
          className={`${fieldClass} flex items-center border-input bg-muted font-semibold tabular-nums ${empty ? "font-normal text-muted-foreground" : ""}`}
        >
          {empty ? labels.calculatedEmpty : String(value)}
        </output>
      );
    }

    case "file_upload":
    case "image_upload":
      return (
        <FileField
          id={id}
          describedBy={describedBy}
          slug={slug}
          field={field}
          value={value as FileAnswer | undefined}
          onChange={onChange}
          disabled={disabled}
          labels={labels.file}
        />
      );

    case "long_text":
      return (
        <Textarea
          id={id}
          {...described}
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          invalid={invalid}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "number":
      return (
        <Input
          id={id}
          {...described}
          type="number"
          inputMode="decimal"
          value={value === undefined ? "" : String(value)}
          placeholder={field.placeholder}
          invalid={invalid}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        />
      );

    case "rating_stars": {
      const { max } = scaleBounds(field);
      return (
        <StarRating
          value={value as number | undefined}
          max={max}
          disabled={disabled}
          onChange={onChange}
        />
      );
    }

    case "nps": {
      const { min, max } = scaleBounds(field);
      return (
        <ScaleButtons
          value={value as number | undefined}
          min={min}
          max={max}
          disabled={disabled}
          onChange={onChange}
        />
      );
    }

    case "emoji_scale": {
      const { min, max } = scaleBounds(field);
      return (
        <ScaleButtons
          value={value as number | undefined}
          min={min}
          max={max}
          renderLabel={(n) => EMOJI_SCALE[n - 1] ?? String(n)}
          disabled={disabled}
          onChange={onChange}
        />
      );
    }

    case "slider": {
      const { min, max, step } = scaleBounds(field);
      return (
        <SliderInput
          id={id}
          describedBy={describedBy}
          value={value as number | undefined}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={onChange}
        />
      );
    }

    case "matrix":
      return (
        <MatrixField
          field={field}
          value={value as Record<string, string> | undefined}
          disabled={disabled}
          onChange={onChange}
        />
      );

    case "signature":
      return (
        <SignatureField
          slug={slug}
          field={field}
          value={value as FileAnswer | undefined}
          disabled={disabled}
          labels={labels.file}
          onChange={onChange}
        />
      );

    case "single_choice":
      return (
        <RadioGroup
          name={id}
          options={options}
          value={value as string | undefined}
          disabled={disabled}
          invalid={invalid}
          onChange={onChange}
        />
      );

    case "dropdown":
      return (
        <Select
          id={id}
          {...described}
          options={options}
          placeholder={field.placeholder ?? labels.selectPlaceholder}
          value={(value as string) ?? ""}
          invalid={invalid}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "multi_choice":
    case "multi_select":
      return (
        <CheckboxGroup
          name={id}
          options={options}
          value={(value as string[]) ?? []}
          disabled={disabled}
          invalid={invalid}
          onChange={onChange}
        />
      );

    case "yes_no":
      return (
        <RadioGroup
          name={id}
          options={[
            { value: "yes", label: labels.yes },
            { value: "no", label: labels.no },
          ]}
          value={value === true ? "yes" : value === false ? "no" : undefined}
          disabled={disabled}
          invalid={invalid}
          onChange={(v) => onChange(v === "yes")}
        />
      );

    case "consent":
    case "age_check":
      return (
        <Checkbox
          id={id}
          {...described}
          aria-invalid={invalid || undefined}
          label={field.placeholder ?? field.description ?? labels.agree}
          checked={value === true}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
      );

    case "date":
    case "time":
    case "datetime":
      return (
        <DateField
          id={id}
          describedBy={describedBy}
          mode={field.type}
          value={value as string | undefined}
          onChange={onChange}
          invalid={invalid}
          disabled={disabled}
          placeholder={field.placeholder}
          labels={labels.date}
        />
      );

    case "phone":
      return (
        <PhoneField
          id={id}
          describedBy={describedBy}
          value={value as string | undefined}
          onChange={onChange}
          invalid={invalid}
          disabled={disabled}
          placeholder={field.placeholder}
          countryLabel={labels.countryCode}
        />
      );

    // short_text, email, url, password and any other single-line text.
    default: {
      const inputType =
        field.type === "email"
          ? "email"
          : field.type === "url"
            ? "url"
            : field.type === "password"
              ? "password"
              : "text";
      return (
        <Input
          id={id}
          {...described}
          type={inputType}
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          invalid={invalid}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }
  }
}
