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
}

/** Single-choice control (one selected value) rendered as styled radios. */
export function RadioGroup({
  name,
  options,
  value,
  onChange,
  disabled,
}: RadioGroupProps) {
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
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              disabled={disabled}
              onChange={(e) => onChange?.(e.target.value)}
              className="h-4 w-4 accent-primary"
            />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}
