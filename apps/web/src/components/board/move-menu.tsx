"use client";

import { useEffect, useId, useRef } from "react";

import { CaretDown } from "@/components/icons";
import { Button } from "@/components/ui/button";

export interface MoveTarget {
  key: string;
  label: string;
  color: string;
}

/**
 * The "Move" control of a board card: a button with a visible word that opens
 * the other statuses as a list of buttons. A single click or key press per
 * step, so a card moves without dragging (WCAG 2.5.7), and nothing moves
 * until a status is picked (a native select would move the card on every
 * arrow key).
 *
 * Same technique as the kit's RowMenu: the native popover opens in the top
 * layer, so the board's scroll container cannot clip it; it is placed below
 * the button (above it where the window ends) through the CSSOM and closes
 * when anything scrolls. RowMenu only offers an icon trigger, which would
 * hide what the button does.
 */
export function MoveMenu({
  label,
  text,
  heading,
  targets,
  onPick,
  cardId,
}: {
  /** Accessible name of the button: "Move Moritz". Contains the visible word. */
  label: string;
  /** The visible word: "Move". */
  text: string;
  /** Head of the list: "Move to". */
  heading: string;
  targets: MoveTarget[];
  onPick: (key: string) => void;
  /** Set as `data-move-trigger` on the button, so the board can focus it again after a move. */
  cardId: string;
}) {
  const id = useId();
  const headingId = `${id}-heading`;
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
        if (r.bottom + 4 + h > window.innerHeight - 8 && r.top - 4 - h > 8)
          panel!.style.top = `${r.top - 4 - h}px`;
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

  function pick(key: string) {
    const panel = panelRef.current;
    if (panel?.matches?.(":popover-open")) panel.hidePopover();
    onPick(key);
  }

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        size="sm"
        variant="outline"
        popoverTarget={id}
        aria-label={label}
        className="tap-target"
        data-move-trigger={cardId}
      >
        {text}
        <CaretDown className="h-4 w-4" />
      </Button>
      <div
        ref={panelRef}
        id={id}
        popover="auto"
        className="fixed inset-auto m-0 max-w-[min(20rem,calc(100vw-1rem))] min-w-[13rem] rounded-lg border border-border bg-card p-1.5 text-card-foreground shadow-[var(--shadow-card-hover)]"
      >
        <p
          id={headingId}
          className="px-3 pt-1.5 pb-1 text-label font-semibold tracking-[0.08em] text-muted-foreground uppercase"
        >
          {heading}
        </p>
        <ul aria-labelledby={headingId} className="grid gap-0.5">
          {targets.map((target) => (
            <li key={target.key}>
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start font-medium"
                onClick={() => pick(target.key)}
              >
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full shadow-[0_0_0_1px_hsl(var(--foreground)/0.35)]"
                  style={{ background: target.color }}
                />
                {target.label}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
