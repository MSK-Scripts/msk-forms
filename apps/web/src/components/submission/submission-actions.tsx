"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmDialog } from "@/components/dashboard-kit/confirm-dialog";
import { DownloadSimple, Trash, WarningCircle } from "@/components/icons";
import { Button } from "@/components/ui/button";

export interface SubmissionActionLabels {
  yourData: string;
  withdraw: string;
  withdrawConfirm: string;
  exportData: string;
  deleteData: string;
  deleteConfirm: string;
  deleted: string;
  actionFailed: string;
  cancel: string;
}

/**
 * Applicant self-service on the public status page (capability = the UUID):
 * withdraw, export own data as JSON, or delete the submission entirely (§19).
 * Withdrawing and deleting ask first, in a native <dialog> whose buttons name
 * the consequence.
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
  // Which destructive action is awaiting confirmation, if any.
  const [confirming, setConfirming] = useState<null | "withdraw" | "delete">(null);

  async function withdraw() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/submissions/${id}/withdraw`, { method: "POST" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? t.actionFailed);
      }
      setConfirming(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.actionFailed);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/submissions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? t.actionFailed);
      }
      setConfirming(null);
      setDeleted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.actionFailed);
      setBusy(false);
    }
  }

  if (deleted) {
    return (
      <p role="status" className="text-muted-foreground">
        {t.deleted}
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <a href={`/api/submissions/${id}/export`} download>
            <DownloadSimple className="h-4 w-4" />
            {t.exportData}
          </a>
        </Button>
        {canWithdraw && (
          <Button
            variant="outline"
            onClick={() => {
              setError(null);
              setConfirming("withdraw");
            }}
            disabled={busy}
          >
            {t.withdraw}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => {
            setError(null);
            setConfirming("delete");
          }}
          disabled={busy}
          className="text-danger hover:border-danger"
        >
          <Trash className="h-4 w-4" />
          {t.deleteData}
        </Button>
      </div>
      {error && !confirming && (
        <p role="alert" className="flex items-start gap-1.5 text-small font-semibold text-danger">
          <WarningCircle className="mt-0.5 h-4 w-4 shrink-0" weight="bold" />
          {error}
        </p>
      )}

      <ConfirmDialog
        open={confirming === "withdraw"}
        title={t.withdraw}
        description={t.withdrawConfirm}
        confirmLabel={t.withdraw}
        cancelLabel={t.cancel}
        tone="primary"
        busy={busy}
        error={confirming === "withdraw" ? error : null}
        onConfirm={withdraw}
        onClose={() => setConfirming(null)}
      />
      <ConfirmDialog
        open={confirming === "delete"}
        title={t.deleteData}
        description={t.deleteConfirm}
        confirmLabel={t.deleteData}
        cancelLabel={t.cancel}
        busy={busy}
        error={confirming === "delete" ? error : null}
        onConfirm={remove}
        onClose={() => setConfirming(null)}
      />
    </div>
  );
}
