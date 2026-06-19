"use client";

import { IconWorld } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import type { ChangeEvent } from "react";

export function LanguageSwitcher({ locale }: { locale: string }) {
  const router = useRouter();

  function change(e: ChangeEvent<HTMLSelectElement>) {
    document.cookie = `NEXT_LOCALE=${e.target.value}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <span className="relative inline-flex items-center">
      <IconWorld
        size={15}
        stroke={1.75}
        aria-hidden
        className="pointer-events-none absolute left-2 text-muted-foreground"
      />
      <select
        aria-label="Language"
        value={locale}
        onChange={change}
        className="h-9 cursor-pointer appearance-none rounded-md border border-input bg-background pl-7 pr-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <option value="en">EN</option>
        <option value="de">DE</option>
      </select>
    </span>
  );
}
