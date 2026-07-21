"use client";

import { Button, Card, Checkbox, Field, Select, Textarea } from "@msk-forms/ui";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { Dictionary } from "@/i18n";
import type { SubmissionAction } from "@/lib/submission-action";

type ReviewDict = Dictionary["review"];

/**
 * Reviewer controls for a submission: change status, add an internal note, or
 * send a public message to the applicant. Each action POSTs to the events route
 * and refreshes the page to pull the updated timeline.
 */
export function ReviewPanel({
  guildId,
  submissionId,
  currentStatus,
  options,
  statusMessages,
  t,
}: {
  guildId: string;
  submissionId: string;
  currentStatus: string;
  options: { key: string; label: string }[];
  /** Resolved per-status message template (form override -> guild) for this form. */
  statusMessages: Record<string, string>;
  t: ReviewDict;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [hidden, setHidden] = useState(false);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  // Editable applicant message that travels with the status change, prefilled
  // from the target status' template. Reset whenever the target status changes.
  const [statusMsg, setStatusMsg] = useState(statusMessages[currentStatus] ?? "");
  useEffect(() => {
    setStatusMsg(statusMessages[status] ?? "");
  }, [status, statusMessages]);
  const [pending, setPending] = useState<SubmissionAction["kind"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(action: SubmissionAction, onDone?: () => void) {
    setError(null);
    setPending(action.kind);
    try {
      const res = await fetch(
        `/api/guilds/${guildId}/submissions/${submissionId}/events`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action),
        },
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? t.actionFailed);
      }
      onDone?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.actionFailed);
    } finally {
      setPending(null);
    }
  }

  return (
    <Card className="flex flex-col gap-5 p-5">
      <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t.actions}
      </h2>

      <Field label={t.changeStatus}>
        <div className="flex gap-2">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={options.map((o) => ({ value: o.key, label: o.label }))}
          />
          <Button
            type="button"
            className="shrink-0"
            disabled={pending !== null || status === currentStatus}
            onClick={() => {
              const original = statusMessages[status] ?? "";
              // Unchanged prefill -> let the server auto-apply the template;
              // otherwise send the (edited or cleared) message as an override.
              const msg = statusMsg === original ? undefined : statusMsg;
              submit({ kind: "status", status, hidden, message: msg });
            }}
          >
            {pending === "status" ? t.saving : t.apply}
          </Button>
        </div>
        {!hidden && (
          <>
            <Textarea
              value={statusMsg}
              onChange={(e) => setStatusMsg(e.target.value)}
              placeholder={t.statusMessagePlaceholder}
              rows={2}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">{t.statusMessageHint}</p>
          </>
        )}
        <Checkbox
          id="hide-status-change"
          checked={hidden}
          onChange={(e) => setHidden(e.target.checked)}
          label={t.hideFromApplicant}
        />
        <p className="ms-[1.9rem] text-xs text-muted-foreground">{t.hideFromApplicantHint}</p>
      </Field>

      <Field label={t.noteLabel} hint={t.noteHint}>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t.notePlaceholder}
        />
        <Button
          type="button"
          variant="ghost"
          className="self-start"
          disabled={pending !== null || note.trim() === ""}
          onClick={() => submit({ kind: "note", message: note.trim() }, () => setNote(""))}
        >
          {pending === "note" ? t.saving : t.saveNote}
        </Button>
      </Field>

      <Field label={t.messageLabel} hint={t.messageHint}>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t.messagePlaceholder}
        />
        <Button
          type="button"
          className="self-start"
          disabled={pending !== null || message.trim() === ""}
          onClick={() =>
            submit({ kind: "message", message: message.trim() }, () => setMessage(""))
          }
        >
          {pending === "message" ? t.saving : t.sendMessage}
        </Button>
      </Field>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </Card>
  );
}
