"use client";

import type { FormField } from "@msk-forms/shared";
import { Card, Checkbox, Field, Input } from "@msk-forms/ui";

import {
  isLayoutType,
  needsOptions,
  needsRows,
  needsSliderConfig,
  needsStarsConfig,
} from "@/lib/builder-fields";
import type { Dictionary } from "@/i18n";

type BuilderDict = Dictionary["builder"];

interface FieldEditorProps {
  field: FormField;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onChange: (field: FormField) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  t: BuilderDict;
}

export function FieldEditor({
  field,
  index,
  isFirst,
  isLast,
  onChange,
  onRemove,
  onMove,
  t,
}: FieldEditorProps) {
  const layout = isLayoutType(field.type);
  const typeLabel = (t.ft as Record<string, string>)[field.type] ?? field.type;

  function patch(partial: Partial<FormField>) {
    onChange({ ...field, ...partial });
  }

  function setOption(i: number, value: string) {
    const options = [...(field.options ?? [])];
    options[i] = { value, label: value };
    patch({ options });
  }
  function addOption() {
    patch({ options: [...(field.options ?? []), { value: "", label: "" }] });
  }
  function removeOption(i: number) {
    patch({ options: (field.options ?? []).filter((_, j) => j !== i) });
  }
  function setValidation(partial: Partial<FormField["validation"]>) {
    patch({ validation: { ...field.validation, ...partial } });
  }
  /** Parse a numeric config input, treating an empty string as "unset". */
  const num = (s: string): number | undefined => (s === "" ? undefined : Number(s));

  function setRow(i: number, label: string) {
    const rows = [...(field.rows ?? [])];
    rows[i] = { id: rows[i]?.id ?? crypto.randomUUID(), label };
    patch({ rows });
  }
  function addRow() {
    patch({ rows: [...(field.rows ?? []), { id: crypto.randomUUID(), label: "" }] });
  }
  function removeRow(i: number) {
    patch({ rows: (field.rows ?? []).filter((_, j) => j !== i) });
  }

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">
          {index + 1}. {typeLabel}
        </span>
        <div className="flex items-center gap-1">
          <IconButton label={t.moveUp} disabled={isFirst} onClick={() => onMove(-1)}>
            ↑
          </IconButton>
          <IconButton label={t.moveDown} disabled={isLast} onClick={() => onMove(1)}>
            ↓
          </IconButton>
          <IconButton label={t.remove} onClick={onRemove}>
            ✕
          </IconButton>
        </div>
      </div>

      {field.type !== "divider" && (
        <Field label={layout ? t.fieldText : t.fieldLabel}>
          <Input
            value={field.label ?? ""}
            onChange={(e) => patch({ label: e.target.value })}
            placeholder={layout ? t.headingPh : t.labelPh}
          />
        </Field>
      )}

      {!layout && (
        <>
          <Field label={t.helpText} hint={t.helpHint}>
            <Input
              value={field.description ?? ""}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </Field>

          {needsOptions(field.type) && (
            <Field label={needsRows(field.type) ? t.columns : t.options}>
              <div className="flex flex-col gap-2">
                {(field.options ?? []).map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={opt.label}
                      onChange={(e) => setOption(i, e.target.value)}
                      placeholder={`${t.optionPh} ${i + 1}`}
                    />
                    <IconButton label={t.removeOption} onClick={() => removeOption(i)}>
                      ✕
                    </IconButton>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="self-start text-sm font-medium text-primary hover:underline"
                >
                  + {t.addOption}
                </button>
              </div>
            </Field>
          )}

          {needsRows(field.type) && (
            <Field label={t.rows}>
              <div className="flex flex-col gap-2">
                {(field.rows ?? []).map((row, i) => (
                  <div key={row.id} className="flex gap-2">
                    <Input
                      value={row.label}
                      onChange={(e) => setRow(i, e.target.value)}
                      placeholder={`${t.rowPh} ${i + 1}`}
                    />
                    <IconButton label={t.removeRow} onClick={() => removeRow(i)}>
                      ✕
                    </IconButton>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRow}
                  className="self-start text-sm font-medium text-primary hover:underline"
                >
                  + {t.addRow}
                </button>
              </div>
            </Field>
          )}

          {needsStarsConfig(field.type) && (
            <Field label={t.stars}>
              <Input
                type="number"
                min={1}
                value={field.validation.max ?? ""}
                placeholder="5"
                onChange={(e) => setValidation({ max: num(e.target.value) })}
              />
            </Field>
          )}

          {needsSliderConfig(field.type) && (
            <div className="grid grid-cols-3 gap-2">
              <Field label={t.min}>
                <Input
                  type="number"
                  value={field.validation.min ?? ""}
                  placeholder="0"
                  onChange={(e) => setValidation({ min: num(e.target.value) })}
                />
              </Field>
              <Field label={t.max}>
                <Input
                  type="number"
                  value={field.validation.max ?? ""}
                  placeholder="100"
                  onChange={(e) => setValidation({ max: num(e.target.value) })}
                />
              </Field>
              <Field label={t.step}>
                <Input
                  type="number"
                  min={1}
                  value={field.validation.step ?? ""}
                  placeholder="1"
                  onChange={(e) => setValidation({ step: num(e.target.value) })}
                />
              </Field>
            </div>
          )}

          <Checkbox
            label={t.required}
            checked={field.validation.required}
            onChange={(e) =>
              patch({ validation: { ...field.validation, required: e.target.checked } })
            }
          />
        </>
      )}
    </Card>
  );
}

function IconButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}
