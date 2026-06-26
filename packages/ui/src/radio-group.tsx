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
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              disabled={disabled}
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
