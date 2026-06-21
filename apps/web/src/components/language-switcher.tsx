"use client";

import { IconCheck, IconChevronDown, IconWorld } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const LOCALES = [
  { value: "en", short: "EN", label: "English" },
  { value: "de", short: "DE", label: "Deutsch" },
  { value: "hu", short: "HU", label: "Magyar" },
] as const;

export function LanguageSwitcher({ locale }: { locale: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function select(value: string) {
    setOpen(false);
    if (value === locale) return;
    document.cookie = `NEXT_LOCALE=${value}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  const current = LOCALES.find((l) => l.value === locale) ?? LOCALES[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Language"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <IconWorld size={15} stroke={1.75} className="text-muted-foreground" />
        {current.short}
        <IconChevronDown
          size={14}
          stroke={2}
          className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-1.5 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {LOCALES.map((l) => {
            const active = l.value === locale;
            return (
              <li key={l.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => select(l.value)}
                  className={`flex w-full items-center justify-between gap-3 rounded-sm px-2.5 py-1.5 text-xs transition-colors hover:bg-accent hover:text-accent-foreground ${
                    active ? "font-medium text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                      {l.short}
                    </span>
                    {l.label}
                  </span>
                  {active && <IconCheck size={14} stroke={2.5} className="text-primary" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
