export interface ChoiceOption {
  value: string;
  label: string;
}

export interface RadioGroupProps {
  name: string;
  options: ChoiceOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  /** Marks every radio invalid while the group has an error. */
  invalid?: boolean;
}

/** A choice row: native control, the whole row is the 44 px target. */
export const choiceRowClass =
  "-mx-2 flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-foreground transition-colors duration-150 hover:bg-muted";

/** Single choice as native radios; the group's legend comes from Field. */
export function RadioGroup({ name, options, value, onChange, disabled, invalid }: RadioGroupProps) {
  return (
    <div className="grid gap-0.5">
      {options.map((opt) => {
        const id = `${name}-${opt.value}`;
        return (
          <label key={opt.value} htmlFor={id} className={choiceRowClass}>
            <input
              id={id}
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              disabled={disabled}
              aria-invalid={invalid || undefined}
              onChange={(e) => onChange?.(e.target.value)}
              className="h-5 w-5 shrink-0 accent-primary"
            />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}
