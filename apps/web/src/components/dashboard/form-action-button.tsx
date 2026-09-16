"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";

const STYLES = {
  neutral:
    "rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground",
  primary:
    "rounded-md border border-primary/40 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10",
  danger:
    "rounded-md border border-destructive/40 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10",
} as const;

/**
 * A form-level action behind a confirmation dialog: archive, restore or delete
 * permanently. Refreshes the page on success; maps known error codes from the
 * API to readable text.
 */
export function FormActionButton({
  url,
  method,
  body,
  variant = "neutral",
  t,
}: {
  url: string;
  method: "POST" | "DELETE";
  body?: Record<string, unknown>;
  variant?: keyof typeof STYLES;
  t: {
    label: string;
    title: string;
    confirm: string;
    cancel: string;
    failed: string;
    /** Error text per API error code, e.g. { pro_required: "…" }. */
    codes?: Record<string, string>;
  };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onConfirm() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { code?: string } | null;
        throw new Error((data?.code && t.codes?.[data.code]) || t.failed);
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className={STYLES[variant]}
      >
        {t.label}
      </button>
      <ConfirmDialog
        open={open}
        title={t.title}
        message={t.confirm}
        confirmLabel={t.label}
        cancelLabel={t.cancel}
        busy={busy}
        error={error}
        danger={variant === "danger"}
        onConfirm={onConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
