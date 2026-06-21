"use client";

import { EMOJI_SCALE, scaleBounds, type FileAnswer, type FormField } from "@msk-forms/shared";
import {
  Checkbox,
  CheckboxGroup,
  Input,
  RadioGroup,
  Select,
  Textarea,
} from "@msk-forms/ui";

import { FileField, type FileFieldLabels } from "./file-field";
import { ScaleButtons, SliderInput, StarRating } from "./rating-fields";

export type FieldValue = string | number | boolean | string[] | FileAnswer | undefined;

const YES_NO_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

interface FieldInputProps {
  field: FormField;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  invalid?: boolean;
  disabled?: boolean;
  /** The form slug + labels — needed by file fields to drive uploads. */
  slug: string;
  fileLabels: FileFieldLabels;
}

/** Renders the interactive control for a single (non-layout) form field. */
export function FieldInput({
  field,
  value,
  onChange,
  invalid,
  disabled,
  slug,
  fileLabels,
}: FieldInputProps) {
  const id = field.id;
  const options = (field.options ?? []).map((o) => ({ value: o.value, label: o.label }));

  switch (field.type) {
    case "file_upload":
    case "image_upload":
      return (
        <FileField
          slug={slug}
          field={field}
          value={value as FileAnswer | undefined}
          onChange={onChange}
          disabled={disabled}
          labels={fileLabels}
        />
      );

    case "long_text":
      return (
        <Textarea
          id={id}
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
          type="number"
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
        <StarRating value={value as number | undefined} max={max} disabled={disabled} onChange={onChange} />
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
          value={value as number | undefined}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={onChange}
        />
      );
    }

    case "single_choice":
      return (
        <RadioGroup
          name={id}
          options={options}
          value={value as string | undefined}
          disabled={disabled}
          onChange={onChange}
        />
      );

    case "dropdown":
      return (
        <Select
          id={id}
          options={options}
          placeholder={field.placeholder ?? "Select…"}
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
          onChange={onChange}
        />
      );

    case "yes_no":
      return (
        <RadioGroup
          name={id}
          options={YES_NO_OPTIONS}
          value={value === true ? "yes" : value === false ? "no" : undefined}
          disabled={disabled}
          onChange={(v) => onChange(v === "yes")}
        />
      );

    case "consent":
    case "age_check":
      return (
        <Checkbox
          id={id}
          label={field.placeholder ?? field.description ?? "I agree"}
          checked={value === true}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
      );

    case "date":
    case "time":
    case "datetime": {
      const inputType =
        field.type === "date" ? "date" : field.type === "time" ? "time" : "datetime-local";
      return (
        <Input
          id={id}
          type={inputType}
          value={(value as string) ?? ""}
          invalid={invalid}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }

    // short_text, email, phone, url, password and any other single-line text.
    default: {
      const inputType =
        field.type === "email"
          ? "email"
          : field.type === "phone"
            ? "tel"
            : field.type === "url"
              ? "url"
              : field.type === "password"
                ? "password"
                : "text";
      return (
        <Input
          id={id}
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
