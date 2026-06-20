"use client";

import { Button } from "@msk-forms/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface SubmissionActionLabels {
  yourData: string;
  withdraw: string;
  withdrawConfirm: string;
  exportData: string;
  deleteData: string;
  deleteConfirm: string;
  deleted: string;
  actionFailed: string;
}

/**
 * Applicant self-service on the public status page (capability = the UUID):
 * withdraw, export own data as JSON, or delete the submission entirely (§19).
 */
export function SubmissionActions({
  id,
  canWithdraw,
  t,
}: {
  id: string;
  canWithdraw: boolean;
  t: SubmissionActionLabels;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);

  async function withdraw() {
    if (!window.confirm(t.withdrawConfirm)) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/submissions/${id}/withdraw`, { method: "POST" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? t.actionFailed);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.actionFailed);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(t.deleteConfirm)) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/submissions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? t.actionFailed);
      }
      setDeleted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.actionFailed);
      setBusy(false);
    }
  }

  if (deleted) return <p className="text-sm text-muted-foreground">{t.deleted}</p>;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t.yourData}
      </h2>
      <div className="flex flex-wrap gap-3">
        {canWithdraw && (
          <Button variant="ghost" onClick={withdraw} disabled={busy}>
            {t.withdraw}
          </Button>
        )}
        <a
          href={`/api/submissions/${id}/export`}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {t.exportData}
        </a>
        <Button
          variant="ghost"
          onClick={remove}
          disabled={busy}
          className="text-destructive hover:text-destructive"
        >
          {t.deleteData}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
