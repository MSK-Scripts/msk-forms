"use client";

import { useEffect, useRef } from "react";

import { CircleNotch, FloppyDisk } from "@/components/icons";
import { Button } from "@/components/ui/button";

export interface SaveBarCopy {
  /** "You have unsaved changes." */
  message: string;
  save: string;
  discard: string;
}

/**
 * The bar with Save and Discard for a settings page. It appears only while
 * there are unsaved changes, sticks to the bottom of the window and stays
 * above the tab bar of a phone. The message is a live region, so a screen
 * reader hears that the page now holds changes. Copy: `kit.saveBar`.
 */
export function SaveBar({
  show,
  copy,
  onSave,
  onDiscard,
  busy = false,
}: {
  show: boolean;
  copy: SaveBarCopy;
  onSave: () => void;
  onDiscard: () => void;
  busy?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hadFocus = useRef(false);

  // Save and Discard leave with the bar. When the focus was on one of them
  // and nothing else took it, it stays at the bar's place instead of falling
  // back to the start of the document.
  useEffect(() => {
    if (show) return;
    const root = rootRef.current;
    if (hadFocus.current && root && (document.activeElement === document.body || document.activeElement === null)) {
      root.focus();
    }
    hadFocus.current = false;
  }, [show]);

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      aria-live="polite"
      onFocus={() => {
        hadFocus.current = true;
      }}
      className="sticky bottom-[var(--app-tabbar)] z-20 focus:outline-none lg:bottom-0"
    >
      {show && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-[var(--shadow-card-hover)]">
          <p className="font-semibold">{copy.message}</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={onDiscard} disabled={busy}>
              {copy.discard}
            </Button>
            <Button onClick={onSave} disabled={busy} aria-busy={busy || undefined}>
              {busy ? <CircleNotch className="h-4 w-4 animate-spin" /> : <FloppyDisk className="h-4 w-4" />}
              {copy.save}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
