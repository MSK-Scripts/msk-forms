"use client";

import { useState } from "react";

import { COUNTRIES, DEFAULT_COUNTRY, flagOf, formatPhone, parsePhone } from "@/lib/countries";

/**
 * Phone input: a country dial-code selector plus a digits-only number field.
 * The answer is stored as `+<dial> <number>`; non-digits are stripped from the
 * number as the user types.
 */
export function PhoneField({
  id,
  value,
  onChange,
  invalid,
  disabled,
  placeholder,
}: {
  id: string;
  value: string | undefined;
  onChange: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  const parsed = parsePhone(value);
  const [code, setCode] = useState(parsed.code);
  const [number, setNumber] = useState(parsed.number);

  const country = COUNTRIES.find((c) => c.code === code) ?? DEFAULT_COUNTRY;

  function update(nextCode: string, nextNumber: string) {
    const dial = (COUNTRIES.find((c) => c.code === nextCode) ?? DEFAULT_COUNTRY).dial;
    setCode(nextCode);
    setNumber(nextNumber);
    onChange(formatPhone(dial, nextNumber));
  }

  const border = invalid ? "border-destructive" : "border-input";

  return (
    <div className={`flex overflow-hidden rounded-md border ${border} bg-background`}>
      <select
        aria-label="Country code"
        value={code}
        disabled={disabled}
        onChange={(e) => update(e.target.value, number)}
        className="shrink-0 border-r border-input bg-muted/40 px-2 text-sm text-foreground outline-none disabled:opacity-50"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {flagOf(c.code)} +{c.dial}
          </option>
        ))}
      </select>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={number}
        placeholder={placeholder ?? `+${country.dial}`}
        disabled={disabled}
        onChange={(e) => update(code, e.target.value.replace(/[^\d]/g, ""))}
        className="w-full bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50"
      />
    </div>
  );
}
