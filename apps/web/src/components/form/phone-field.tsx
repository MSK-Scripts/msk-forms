"use client";

import { IconChevronDown } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const country = COUNTRIES.find((c) => c.code === code) ?? DEFAULT_COUNTRY;

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function update(nextCode: string, nextNumber: string) {
    const dial = (COUNTRIES.find((c) => c.code === nextCode) ?? DEFAULT_COUNTRY).dial;
    setCode(nextCode);
    setNumber(nextNumber);
    onChange(formatPhone(dial, nextNumber));
  }

  const border = invalid ? "border-destructive" : "border-input";

  return (
    <div ref={ref} className="relative">
      <div className={`flex overflow-hidden rounded-md border ${border} bg-background`}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex shrink-0 items-center gap-1.5 border-r border-input bg-muted/40 px-2.5 text-sm text-foreground outline-none transition-colors hover:bg-muted/70 disabled:opacity-50"
        >
          <span className="text-base leading-none">{flagOf(country.code)}</span>
          <span className="tabular-nums">+{country.dial}</span>
          <IconChevronDown size={14} stroke={1.75} className="text-muted-foreground" />
        </button>
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

      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-64 overflow-auto rounded-md border border-border bg-popover p-1 shadow-md"
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
                }}
                className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent ${
                  c.code === code ? "bg-accent/60" : ""
                }`}
              >
                <span className="text-base leading-none">{flagOf(c.code)}</span>
                <span className="flex-1 truncate text-foreground">{c.name}</span>
                <span className="tabular-nums text-muted-foreground">+{c.dial}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
