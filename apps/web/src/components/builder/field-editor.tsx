"use client";

import type { FormField } from "@msk-forms/shared";
import { Card, Checkbox, Field, Input } from "@msk-forms/ui";

import { fieldTypeLabel, isLayoutType, needsOptions } from "@/lib/builder-fields";

interface FieldEditorProps {
  field: FormField;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onChange: (field: FormField) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}

export function FieldEditor({
  field,
  index,
  isFirst,
  isLast,
  onChange,
  onRemove,
  onMove,
}: FieldEditorProps) {
  const layout = isLayoutType(field.type);

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
        <span className="font-mono text-xs uppercase tracking-widest text-accent">
          {index + 1}. {fieldTypeLabel(field.type)}
        </span>
        <div className="flex items-center gap-1">
          <IconButton label="Move up" disabled={isFirst} onClick={() => onMove(-1)}>
            ↑
          </IconButton>
          <IconButton label="Move down" disabled={isLast} onClick={() => onMove(1)}>
            ↓
          </IconButton>
          <IconButton label="Remove" onClick={onRemove}>
            ✕
          </IconButton>
        </div>
      </div>

      {field.type !== "divider" && (
        <Field label={layout ? "Text" : "Label"}>
          <Input
            value={field.label ?? ""}
            onChange={(e) => patch({ label: e.target.value })}
            placeholder={layout ? "Section heading…" : "Question label…"}
          />
        </Field>
      )}

      {!layout && (
        <>
          <Field label="Help text" hint="Optional, shown below the label.">
            <Input
              value={field.description ?? ""}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </Field>

          {needsOptions(field.type) && (
            <Field label="Options">
              <div className="flex flex-col gap-2">
                {(field.options ?? []).map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={opt.label}
                      onChange={(e) => setOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                    />
                    <IconButton label="Remove option" onClick={() => removeOption(i)}>
                      ✕
                    </IconButton>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="self-start font-mono text-xs uppercase tracking-widest text-accent hover:underline"
                >
                  + Add option
                </button>
              </div>
            </Field>
          )}

          <Checkbox
            label="Required"
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
      className="flex h-7 w-7 items-center justify-center rounded-sm border border-border text-text-secondary transition-colors hover:border-border-accent hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}
