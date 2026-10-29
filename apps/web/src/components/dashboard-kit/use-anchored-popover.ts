"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Places a native popover (`popover="auto"`) next to the button that opens
 * it: below the button with their end edges aligned, above it where the
 * window ends. It closes when anything scrolls or the window is resized, so
 * it never floats away from its button. The browser does the rest: top
 * layer (no scroll container clips it), Escape, a click outside, and opening
 * through `popovertarget` before hydration.
 *
 * Placement goes through the CSSOM (`element.style`), which no CSP
 * restricts. Used by RowMenu and the account menu of the AppShell.
 */
export function useAnchoredPopover<Trigger extends HTMLElement = HTMLButtonElement>() {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Trigger>(null);

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

  const hide = useCallback(() => {
    const panel = panelRef.current;
    if (panel?.matches?.(":popover-open")) panel.hidePopover();
  }, []);

  return { panelRef, triggerRef, hide };
}
