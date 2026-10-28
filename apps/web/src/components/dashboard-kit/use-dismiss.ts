"use client";

import { useEffect, useEffectEvent, type RefObject } from "react";

/**
 * Closes an open panel on a pointer press outside of `ref` and on Escape.
 * Escape reports its reason, so the caller can hand the focus back to the
 * button that opened the panel.
 *
 * Escape closes the innermost thing only: the key press is cancelled, so a
 * native `<dialog>` around the panel (the drawer on a phone) stays open.
 */
export function useDismiss(
  open: boolean,
  ref: RefObject<HTMLElement | null>,
  close: (reason: "outside" | "escape") => void,
): void {
  const onClose = useEffectEvent(close);

  useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose("outside");
    }
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      e.preventDefault();
      onClose("escape");
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, ref]);
}
