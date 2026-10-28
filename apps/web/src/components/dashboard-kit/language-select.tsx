"use client";

import { useRouter } from "next/navigation";
import { useId, useTransition } from "react";

import { Select } from "@/components/ui/select";
import type { Locale } from "@/i18n/dictionaries";
import { LOCALE_OPTIONS, writeLocaleCookie } from "@/i18n/locale-options";
import { cn } from "@/lib/utils";

/**
 * The language choice of the app shell. MSK Forms has no language in its
 * addresses (unlike the shop's /en and /de): the server reads a cookie, so a
 * choice writes it and refreshes the page. A native select, because seven
 * languages by their own names would crowd the sidebar as links.
 */
export function LanguageSelect({
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
    <div className={cn("grid gap-1", className)}>
      <label
        htmlFor={id}
        className="px-3 text-label font-semibold tracking-[0.08em] text-muted-foreground uppercase"
      >
        {label}
      </label>
      <Select
        id={id}
        value={locale}
        disabled={pending}
        onChange={(e) => {
          writeLocaleCookie(e.target.value);
          startTransition(() => router.refresh());
        }}
      >
        {LOCALE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} lang={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
