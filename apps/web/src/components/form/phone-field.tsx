"use client";

import { useRef, useState } from "react";

import { useDismiss } from "@/components/dashboard-kit/use-dismiss";
import { CaretDown } from "@/components/icons";

import { COUNTRIES, DEFAULT_COUNTRY, flagOf, formatPhone, parsePhone } from "@/lib/countries";

/**
 * Phone input: a styled country dial-code selector plus a digits-only number
 * field. The answer is stored as `+<dial> <number>`; non-digits are stripped
 * from the number as the user types. The country dropdown is a custom popover
 * (the native <select> list can't be themed) matching the app UI.
 */
export function PhoneField({
  id,
  value,
  onChange,
  invalid,
  disabled,
  placeholder,
  describedBy,
  countryLabel,
}: {
  id: string;
  describedBy?: string;
  /** Name of the country code button, before the chosen country. */
  countryLabel: string;
  value: string | undefined;
  onChange: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  const parsed = parsePhone(value);
  const [code, setCode] = useState(parsed.code);
  const [number, setNumber] = useState(parsed.number);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const country = COUNTRIES.find((c) => c.code === code) ?? DEFAULT_COUNTRY;

  useDismiss(open, ref, (reason) => {
    setOpen(false);
    if (reason === "escape") buttonRef.current?.focus();
  });

  function update(nextCode: string, nextNumber: string) {
    const dial = (COUNTRIES.find((c) => c.code === nextCode) ?? DEFAULT_COUNTRY).dial;
    setCode(nextCode);
    setNumber(nextNumber);
    onChange(formatPhone(dial, nextNumber));
  }

  const border = invalid ? "border-danger" : "border-input";

  return (
    <div ref={ref} className="relative">
      <div className={`flex min-h-11 overflow-hidden rounded-md border-[1.5px] ${border} bg-card`}>
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`${countryLabel}: ${country.name} +${country.dial}`}
          className="flex min-h-11 shrink-0 items-center gap-1.5 border-e-[1.5px] border-input bg-muted px-3 text-base text-foreground transition-colors focus-visible:outline-offset-[-3px] disabled:opacity-50"
        >
          <span aria-hidden className="leading-none">{flagOf(country.code)}</span>
          <span aria-hidden className="tabular-nums">+{country.dial}</span>
          <CaretDown className="h-4 w-4 text-muted-foreground" />
        </button>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={number}
          placeholder={placeholder ?? `+${country.dial}`}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          onChange={(e) => update(code, e.target.value.replace(/[^\d]/g, ""))}
          className="w-full min-w-0 bg-transparent px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-offset-[-3px] disabled:opacity-50"
        />
      </div>

      {open && (
        <ul
          role="listbox"
          aria-label={countryLabel}
          className="absolute z-50 mt-1.5 max-h-72 w-[min(20rem,calc(100vw-2rem))] overflow-auto rounded-lg border border-border bg-card p-1 shadow-[var(--shadow-card-hover)]"
        >
          {COUNTRIES.map((c) => (
            <li key={c.code}>
              <button
                type="button"
                role="option"
                aria-selected={c.code === code}
                onClick={() => {
                  update(c.code, number);
                  setOpen(false);
                  buttonRef.current?.focus();
                }}
                className={`flex min-h-11 w-full items-center gap-2 rounded-md px-2.5 text-start text-base transition-colors hover:bg-muted ${
                  c.code === code ? "bg-accent-soft" : ""
                }`}
              >
                <span aria-hidden className="leading-none">{flagOf(c.code)}</span>
                <span className="flex-1 truncate text-foreground">{c.name}</span>
                <span className="text-muted-foreground tabular-nums">+{c.dial}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
