"use client";

import { useEffect, useRef } from "react";

import { Notice, SaveBar, type SaveBarCopy } from "@/components/dashboard-kit";

/** The outcome of the last save: shown until it is dismissed or the next edit. */
export type SaveResult = { tone: "success" | "danger"; message: string } | null;

export interface SettingsSaveCopy {
  saveBar: SaveBarCopy;
  /** `kit.dismiss` of the dictionary. */
  dismiss: string;
}

/**
 * The kit's SaveBar with the result of the last save in the same place: at
 * the bottom of the window while the form runs on below it, at the end of
 * the form otherwise. A successful save hides the bar together with its
 * Save button, so the focus moves to the result instead of being lost; after
 * an error the bar stays, and so does the focus.
 */
export function SettingsSaveBar({
  dirty,
  busy,
  result,
  onSave,
  onDiscard,
  onDismissResult,
  copy,
}: {
  dirty: boolean;
  busy: boolean;
  result: SaveResult;
  onSave: () => void;
  onDiscard: () => void;
  onDismissResult: () => void;
  copy: SettingsSaveCopy;
}) {
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result?.tone === "success") resultRef.current?.focus();
  }, [result]);

  return (
    <div className="sticky bottom-[var(--app-tabbar)] z-20 grid lg:bottom-0">
      {result && (
        <div ref={resultRef} tabIndex={-1} className="mt-6 rounded-md">
          <Notice
            tone={result.tone}
            role={result.tone === "success" ? "status" : "alert"}
            title={result.message}
            onDismiss={onDismissResult}
            dismissLabel={copy.dismiss}
            className="shadow-[var(--shadow-card-hover)]"
          />
        </div>
      )}
      <SaveBar show={dirty} copy={copy.saveBar} onSave={onSave} onDiscard={onDiscard} busy={busy} />
    </div>
  );
}
