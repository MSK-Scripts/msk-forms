"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Monitor, Moon, Sun } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface ThemeSwitchLabels {
  group: string;
  system: string;
  light: string;
  dark: string;
}

const noSubscription = () => () => {};

/** False on the server and during hydration, true afterwards. */
function useHydrated(): boolean {
  return useSyncExternalStore(noSubscription, () => true, () => false);
}

/**
 * System, light or dark; the system setting is the default.
 *
 * Three toggle buttons with `aria-pressed` instead of a menu: all choices are
 * visible at once, and a screen reader announces which one is on. The stored
 * choice is only known in the browser, so before hydration no button is
 * pressed and the server and first client render stay identical.
 */
export function ThemeSwitch({
  labels,
  tone = "page",
  className,
}: {
  labels: ThemeSwitchLabels;
  tone?: "page" | "band";
  className?: string;
}) {
  const { theme, setTheme } = useTheme();
  const hydrated = useHydrated();
  const current = hydrated ? (theme ?? "system") : null;

  const items = [
    { value: "system", label: labels.system, Icon: Monitor },
    { value: "light", label: labels.light, Icon: Sun },
    { value: "dark", label: labels.dark, Icon: Moon },
  ] as const;

  return (
    <div
      role="group"
      aria-label={labels.group}
      className={cn(
        "inline-flex w-fit overflow-hidden rounded-md border-[1.5px]",
        tone === "band" ? "border-band-muted" : "border-input",
        className,
      )}
    >
      {items.map(({ value, label, Icon }, i) => (
        <button
          key={value}
          type="button"
          aria-pressed={current === value}
          onClick={() => setTheme(value)}
          className={cn(
            "inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 px-2.5 text-small font-semibold transition-colors duration-150",
            // The group clips its corners, so the ring is drawn inside.
            "focus-visible:outline-offset-[-3px]",
            i > 0 && "border-l-[1.5px] border-inherit",
            tone === "band"
              ? "text-band-foreground hover:bg-band-line aria-pressed:bg-band-foreground aria-pressed:text-band"
              : "text-foreground hover:bg-muted aria-pressed:bg-foreground aria-pressed:text-background",
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
