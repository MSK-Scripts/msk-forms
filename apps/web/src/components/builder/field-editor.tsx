"use client";

import type { FormField } from "@msk-forms/shared";
import { Card, Checkbox, Field, Input } from "@msk-forms/ui";

import { isLayoutType, needsOptions } from "@/lib/builder-fields";
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
            <Field label={t.options}>
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
