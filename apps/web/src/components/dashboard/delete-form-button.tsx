"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteFormButton({
  guildId,
  formId,
  t,
}: {
  guildId: string;
  formId: string;
  t: { delete: string; confirm: string; failed: string };
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!window.confirm(t.confirm)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/forms/${formId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      window.alert(t.failed);
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy}
      className="rounded-md border border-destructive/40 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
    >
      {t.delete}
    </button>
  );
}
