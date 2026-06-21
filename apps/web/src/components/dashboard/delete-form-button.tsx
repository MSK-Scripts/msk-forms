"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";

export function DeleteFormButton({
  guildId,
  formId,
  t,
}: {
  guildId: string;
  formId: string;
  t: { delete: string; title: string; confirm: string; cancel: string; failed: string };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onConfirm() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/guilds/${guildId}/forms/${formId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError(t.failed);
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
        className="rounded-md border border-destructive/40 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
      >
        {t.delete}
      </button>
      <ConfirmDialog
        open={open}
        title={t.title}
        message={t.confirm}
        confirmLabel={t.delete}
        cancelLabel={t.cancel}
        busy={busy}
        error={error}
        onConfirm={onConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
