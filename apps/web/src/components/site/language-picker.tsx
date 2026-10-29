"use client";

import { useRouter } from "next/navigation";
import { useId, useTransition } from "react";

import { CaretDown, Globe } from "@/components/icons";
import type { Locale } from "@/i18n/dictionaries";
import { LOCALE_OPTIONS, writeLocaleCookie } from "@/i18n/locale-options";
import { cn } from "@/lib/utils";

/**
 * The language choice of a page header: a native select that writes the
 * NEXT_LOCALE cookie and refreshes, like the kit's LanguageSelect, but
 * compact enough for a header bar. The label is there for a screen reader;
 * the globe and the caret say what the control is.
 */
export function LanguagePicker({
  locale,
  label,
  className,
}: {
  locale: Locale;
  label: string;
  className?: string;
}) {
  const router = useRouter();
  const id = useId();
  const [pending, startTransition] = useTransition();

  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Globe className="pointer-events-none absolute left-2 h-5 w-5 text-muted-foreground" />
      <select
        id={id}
        value={locale}
        disabled={pending}
        onChange={(e) => {
          writeLocaleCookie(e.target.value);
          startTransition(() => router.refresh());
        }}
        className="min-h-11 cursor-pointer appearance-none rounded-md bg-transparent py-2 pr-8 pl-9 font-medium text-foreground transition-colors duration-150 hover:bg-muted disabled:opacity-60"
      >
        {LOCALE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} lang={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <CaretDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-muted-foreground" />
    </div>
  );
}
