import type { ChoiceOption } from "./radio-group";

export interface CheckboxGroupProps {
  name: string;
  options: ChoiceOption[];
  /** Currently selected values. */
  value?: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
}

/** Multi-choice control (zero or more selected values). */
export function CheckboxGroup({
  name,
  options,
  value = [],
  onChange,
  disabled,
}: CheckboxGroupProps) {
  function toggle(optValue: string, checked: boolean) {
    const next = checked
      ? [...value, optValue]
      : value.filter((v) => v !== optValue);
    onChange?.(next);
  }

  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => {
        const id = `${name}-${opt.value}`;
        return (
          <label
            key={opt.value}
            htmlFor={id}
            className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground"
          >
            <input
              id={id}
              type="checkbox"
              name={name}
              value={opt.value}
              checked={value.includes(opt.value)}
              disabled={disabled}
              onChange={(e) => toggle(opt.value, e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}
