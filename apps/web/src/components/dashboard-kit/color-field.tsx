"use client";

import { useState, type ReactNode } from "react";

import { Input } from "@/components/ui/input";

import { FormField } from "./form-field";

/** A colour as the API stores it: `#rrggbb`. */
export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/**
 * The native picker drawn as a swatch: the colour fills the control, and a
 * thin edge in the text colour keeps a pale colour (light yellow on white,
 * navy on the dark ground) visible. The 1 px padding leaves room for the edge
 * inside the control's own box.
 */
const SWATCH = [
  "h-11 w-11 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-px",
  "[&::-webkit-color-swatch-wrapper]:p-0",
  "[&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0",
  "[&::-webkit-color-swatch]:shadow-[0_0_0_1px_hsl(var(--foreground)/0.35)]",
  "[&::-moz-color-swatch]:rounded-md [&::-moz-color-swatch]:border-0",
  "[&::-moz-color-swatch]:shadow-[0_0_0_1px_hsl(var(--foreground)/0.35)]",
].join(" ");

/**
 * A colour a guild picks for its own things (a status, a category, the accent
 * of its public pages): the native picker as a swatch and the hex code as
 * text, both labelled. The text is the value, so what is typed is kept and
 * sent as before; the picker shows it once it is a complete hex code and the
 * fallback until then. The hint about the format appears when the field is
 * left with something that is not one.
 */
export function ColorField({
  label,
  pickerLabel,
  hint,
  invalidText,
  value,
  onChange,
  fallback,
  optional = false,
  placeholder,
  className,
  action,
}: {
  /** Visible label of the hex field. */
  label: ReactNode;
  /** Accessible name of the native picker. */
  pickerLabel: string;
  hint?: ReactNode;
  invalidText: string;
  value: string;
  onChange: (value: string) => void;
  /** What the picker shows while the text is not a hex code. */
  fallback: string;
  /** Empty means "no colour" and is fine. */
  optional?: boolean;
  placeholder?: string;
  className?: string;
  /** A control beside the hex field, e.g. a reset button. */
  action?: ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const trimmed = value.trim();
  const valid = HEX_COLOR.test(trimmed);
  const invalid = trimmed ? !valid : !optional;

  return (
    <FormField
      label={label}
      hint={hint}
      error={invalid && !editing ? invalidText : undefined}
      className={className}
    >
      {(field) => (
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label={pickerLabel}
            value={(valid ? trimmed : fallback).toLowerCase()}
            onChange={(e) => onChange(e.target.value)}
            className={SWATCH}
          />
          <Input
            {...field}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setEditing(true)}
            onBlur={() => setEditing(false)}
            placeholder={placeholder}
            maxLength={7}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            className="w-[8.5rem] font-mono"
          />
          {action}
        </div>
      )}
    </FormField>
  );
}
