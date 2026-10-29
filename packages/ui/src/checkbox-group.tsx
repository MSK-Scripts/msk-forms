import { choiceRowClass, type ChoiceOption } from "./radio-group";

export interface CheckboxGroupProps {
  name: string;
  options: ChoiceOption[];
  /** Currently selected values. */
  value?: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
  invalid?: boolean;
}

/** Multi-choice control (zero or more selected values). */
export function CheckboxGroup({
  name,
  options,
  value = [],
  onChange,
  disabled,
  invalid,
}: CheckboxGroupProps) {
  function toggle(optValue: string, checked: boolean) {
    const next = checked ? [...value, optValue] : value.filter((v) => v !== optValue);
    onChange?.(next);
  }

  return (
    <div className="grid gap-0.5">
      {options.map((opt) => {
        const id = `${name}-${opt.value}`;
        return (
          <label key={opt.value} htmlFor={id} className={choiceRowClass}>
            <input
              id={id}
              type="checkbox"
              name={name}
              value={opt.value}
              checked={value.includes(opt.value)}
              disabled={disabled}
              aria-invalid={invalid || undefined}
              onChange={(e) => toggle(opt.value, e.target.checked)}
              className="h-5 w-5 shrink-0 accent-primary"
            />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}
