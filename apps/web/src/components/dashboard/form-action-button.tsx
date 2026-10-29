"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

import { ConfirmDialog } from "@/components/dashboard-kit";
import { Button } from "@/components/ui/button";

export interface FormActionCopy {
  /** Names the consequence on both buttons: "Archive", "Delete permanently". */
  label: string;
  title: string;
  confirm: string;
  cancel: string;
  failed: string;
  /** Error text per API error code, e.g. { pro_required: "…" }. */
  codes?: Record<string, string>;
}

export interface FormActionRequest {
  url: string;
  method: "POST" | "DELETE";
  body?: Record<string, unknown>;
}

/**
 * The confirmation of a form-level action (archive, restore, delete
 * permanently), controlled from outside so a row menu can open it. Sends the
 * request, refreshes the page on success and keeps the dialog open with the
 * reason when it fails. `typeToConfirm` for what cannot be undone.
 */
export function FormActionDialog({
  open,
  onClose,
  request,
  tone = "primary",
  typeToConfirm,
  t,
}: {
  open: boolean;
  onClose: () => void;
  request: FormActionRequest;
  tone?: "primary" | "danger";
  typeToConfirm?: { expected: string; label: ReactNode };
  t: FormActionCopy;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onConfirm() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(request.url, {
        method: request.method,
        headers: request.body ? { "Content-Type": "application/json" } : undefined,
        body: request.body ? JSON.stringify(request.body) : undefined,
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { code?: string } | null;
        throw new Error((data?.code && t.codes?.[data.code]) || t.failed);
      }
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onClose={() => {
        if (busy) return;
        setError(null);
        onClose();
      }}
      onConfirm={onConfirm}
      title={t.title}
      description={t.confirm}
      confirmLabel={t.label}
      cancelLabel={t.cancel}
      tone={tone}
      busy={busy}
      typeToConfirm={typeToConfirm}
      error={error}
    />
  );
}

/** A button that opens a FormActionDialog. */
export function FormActionButton({
  request,
  tone = "primary",
  typeToConfirm,
  size = "md",
  t,
}: {
  request: FormActionRequest;
  tone?: "primary" | "danger";
  typeToConfirm?: { expected: string; label: ReactNode };
  size?: "sm" | "md";
  t: FormActionCopy;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="outline"
        size={size}
        onClick={() => setOpen(true)}
        className={tone === "danger" ? "text-danger" : undefined}
      >
        {t.label}
      </Button>
      <FormActionDialog
        open={open}
        onClose={() => setOpen(false)}
        request={request}
        tone={tone}
        typeToConfirm={typeToConfirm}
        t={t}
      />
    </>
  );
}
