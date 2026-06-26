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
    <div className="flex flex-col gap-1">
      {options.map((opt) => {
        const id = `${name}-${opt.value}`;
        return (
          <label
            key={opt.value}
            htmlFor={id}
            // -mx-2 px-2 py-2 widens the tap target to a comfortable row on
            // touch (~40px) without indenting the content.
            className="-mx-2 flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50"
          >
            <input
              id={id}
              type="checkbox"
              name={name}
              value={opt.value}
              checked={value.includes(opt.value)}
              disabled={disabled}
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
