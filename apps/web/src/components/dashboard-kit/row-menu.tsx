"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useId, useRef, type ReactNode } from "react";

import { DotsThree, type IconComponent } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface RowMenuItem {
  id: string;
  label: string;
  icon?: IconComponent;
  /** Runs the action or opens its dialog. */
  onSelect?: () => void;
  /** Path in the app instead of an action. */
  href?: string;
  /** External address, opened in a new tab. */
  external?: string;
  /** Shown in red: only for actions that ask before they destroy something. */
  danger?: boolean;
  disabled?: boolean;
}

/**
 * The overflow menu of a table row: one or two actions inline, the rest here.
 *
 * Built on the native popover (`popover="auto"`): it opens in the top layer,
 * so the scrolling container of a DataTable cannot clip it, and the browser
 * closes it on Escape and on a click outside. The panel is placed below the
 * button, or above it where the window ends, and closes when anything
 * scrolls, so it never floats away from its row. Placement goes through the
 * CSSOM (`element.style`), which no CSP restricts.
 *
 * The entries are plain buttons and links in a list, not an ARIA menu: Tab
 * reaches them right after the button that opened them.
 */
export function RowMenu({
  label,
  items,
  size = "sm",
  className,
}: {
  /** Names the button for a screen reader: "More actions for Staff application". */
  label: string;
  items: RowMenuItem[];
  /** `sm` (36 px) inside a dense table, `md` (44 px) elsewhere. */
  size?: "sm" | "md";
  className?: string;
}) {
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    if (!panel || !trigger) return;
    const close = () => {
      if (panel.matches(":popover-open")) panel.hidePopover();
    };
    function place() {
      const r = trigger!.getBoundingClientRect();
      panel!.style.right = `${Math.max(8, window.innerWidth - r.right)}px`;
      panel!.style.top = `${r.bottom + 4}px`;
    }
    function onBefore(e: Event) {
      if ((e as ToggleEvent).newState === "open") place();
    }
    function onToggle(e: Event) {
      if ((e as ToggleEvent).newState === "open") {
        // Not enough room below: open upwards instead.
        const r = trigger!.getBoundingClientRect();
        const h = panel!.offsetHeight;
        if (r.bottom + 4 + h > window.innerHeight - 8 && r.top - 4 - h > 8) panel!.style.top = `${r.top - 4 - h}px`;
        window.addEventListener("scroll", close, true);
        window.addEventListener("resize", close);
      } else {
        window.removeEventListener("scroll", close, true);
        window.removeEventListener("resize", close);
      }
    }
    panel.addEventListener("beforetoggle", onBefore);
    panel.addEventListener("toggle", onToggle);
    return () => {
      panel.removeEventListener("beforetoggle", onBefore);
      panel.removeEventListener("toggle", onToggle);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, []);

  function hide() {
    const panel = panelRef.current;
    if (panel?.matches?.(":popover-open")) panel.hidePopover();
  }

  const itemClass = (danger?: boolean) =>
    cn("w-full justify-start whitespace-nowrap font-medium", danger && "text-danger");

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        popoverTarget={id}
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md border-[1.5px] border-input text-foreground transition-colors duration-150 hover:border-foreground",
          size === "sm" ? "h-9 w-9" : "h-11 w-11",
          className,
        )}
      >
        <DotsThree className="h-5 w-5" weight="bold" />
      </button>
      <div
        ref={panelRef}
        id={id}
        popover="auto"
        aria-label={label}
        className="fixed inset-auto m-0 min-w-[13rem] max-w-[min(20rem,calc(100vw-1rem))] rounded-lg border border-border bg-card p-1.5 text-card-foreground shadow-[var(--shadow-card-hover)]"
      >
        <ul className="grid gap-0.5">
          {items.map((item) => {
            const Icon = item.icon;
            const content: ReactNode = (
              <>
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                {item.label}
              </>
            );
            return (
              <li key={item.id}>
                {item.href ? (
                  <Button asChild variant="ghost" className={itemClass(item.danger)}>
                    <Link href={item.href as Route} prefetch={false} onClick={hide}>
                      {content}
                    </Link>
                  </Button>
                ) : item.external ? (
                  <Button asChild variant="ghost" className={itemClass(item.danger)}>
                    <a href={item.external} target="_blank" rel="noopener noreferrer" onClick={hide}>
                      {content}
                    </a>
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    className={itemClass(item.danger)}
                    disabled={item.disabled}
                    onClick={() => {
                      hide();
                      item.onSelect?.();
                    }}
                  >
                    {content}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
