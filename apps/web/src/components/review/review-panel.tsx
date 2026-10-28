"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { FormField, Notice, SectionCard } from "@/components/dashboard-kit";
import { CircleNotch } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { fieldClassName } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Dictionary } from "@/i18n";
import type { SubmissionAction } from "@/lib/submission-action";

type ReviewDict = Dictionary["review"];
type Kind = SubmissionAction["kind"];

/**
 * Reviewer controls for a submission: change status, add an internal note, or
 * send a public message to the applicant. Each action POSTs to the events route
 * and refreshes the page to pull the updated timeline. The result shows below
 * the action that ran: a status message when it worked, an alert when not.
 */
export function ReviewPanel({
  guildId,
  submissionId,
  currentStatus,
  options,
  statusMessages,
  t,
  dismissLabel,
}: {
  guildId: string;
  submissionId: string;
  currentStatus: string;
  options: { key: string; label: string }[];
  /** Resolved per-status message template (form override -> guild) for this form. */
  statusMessages: Record<string, string>;
  t: ReviewDict;
  /** `kit.dismiss` of the dictionary. */
  dismissLabel: string;
}) {
  const router = useRouter();
  const hideId = useId();
  const [status, setStatus] = useState(currentStatus);
  const [hidden, setHidden] = useState(false);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  // Editable applicant message that travels with the status change, prefilled
  // from the target status' template. Reset whenever the target status changes.
  const [statusMsg, setStatusMsg] = useState(statusMessages[currentStatus] ?? "");
  const [pending, setPending] = useState<Kind | null>(null);
  const [result, setResult] = useState<{ kind: Kind; ok: boolean; text: string } | null>(null);

  const done: Record<Kind, string> = {
    status: t.statusDone,
    note: t.noteDone,
    message: t.messageDone,
  };

  function pickStatus(next: string) {
    setResult(null);
    setStatus(next);
    setStatusMsg(statusMessages[next] ?? "");
  }

  async function submit(action: SubmissionAction, onDone?: () => void) {
    setResult(null);
    setPending(action.kind);
    try {
      const res = await fetch(`/api/guilds/${guildId}/submissions/${submissionId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? t.actionFailed);
      }
      onDone?.();
      setResult({ kind: action.kind, ok: true, text: done[action.kind] });
      router.refresh();
    } catch (err) {
      setResult({
        kind: action.kind,
        ok: false,
        text: err instanceof Error ? err.message : t.actionFailed,
      });
    } finally {
      setPending(null);
    }
  }

  function outcome(kind: Kind) {
    if (result?.kind !== kind) return null;
    return (
      <Notice
        tone={result.ok ? "success" : "danger"}
        title={result.text}
        role={result.ok ? "status" : "alert"}
        onDismiss={() => setResult(null)}
        dismissLabel={dismissLabel}
      />
    );
  }

  const spinner = <CircleNotch className="h-4 w-4 animate-spin" />;

  return (
    <SectionCard title={t.actions} bodyClassName="grid divide-y divide-border py-0">
      <div className="grid gap-4 py-5">
        <FormField label={t.changeStatus}>
          {(field) => (
            <Select {...field} value={status} onChange={(e) => pickStatus(e.target.value)}>
              {options.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <div className="grid gap-1">
          <label className="flex min-h-11 items-center gap-3 font-semibold">
            <input
              type="checkbox"
              checked={hidden}
              onChange={(e) => setHidden(e.target.checked)}
              aria-describedby={`${hideId}-hint`}
              className="h-5 w-5 shrink-0 accent-primary"
            />
            {t.hideFromApplicant}
          </label>
          <p id={`${hideId}-hint`} className="ps-8 text-small text-muted-foreground">
            {t.hideFromApplicantHint}
          </p>
        </div>

        {!hidden && (
          <FormField label={t.statusMessageLabel} hint={t.statusMessageHint}>
            {(field) => (
              <textarea
                {...field}
                value={statusMsg}
                onChange={(e) => setStatusMsg(e.target.value)}
                placeholder={t.statusMessagePlaceholder}
                rows={3}
                maxLength={2000}
                className={fieldClassName}
              />
            )}
          </FormField>
        )}

        <Button
          className="justify-self-start"
          disabled={pending !== null || status === currentStatus}
          aria-busy={pending === "status" || undefined}
          onClick={() => {
            const original = statusMessages[status] ?? "";
            // Unchanged prefill -> let the server auto-apply the template;
            // otherwise send the (edited or cleared) message as an override.
            const msg = statusMsg === original ? undefined : statusMsg;
            // Afterwards the field shows the template of the new status again.
            submit({ kind: "status", status, hidden, message: msg }, () => setStatusMsg(original));
          }}
        >
          {pending === "status" && spinner}
          {pending === "status" ? t.saving : t.apply}
        </Button>
        {outcome("status")}
      </div>

      <div className="grid gap-4 py-5">
        <FormField label={t.noteLabel} hint={t.noteHint}>
          {(field) => (
            <textarea
              {...field}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (result?.kind === "note") setResult(null);
              }}
              placeholder={t.notePlaceholder}
              rows={3}
              className={fieldClassName}
            />
          )}
        </FormField>
        <Button
          variant="outline"
          className="justify-self-start"
          disabled={pending !== null || note.trim() === ""}
          aria-busy={pending === "note" || undefined}
          onClick={() => submit({ kind: "note", message: note.trim() }, () => setNote(""))}
        >
          {pending === "note" && spinner}
          {pending === "note" ? t.saving : t.saveNote}
        </Button>
        {outcome("note")}
      </div>

      <div className="grid gap-4 py-5">
        <FormField label={t.messageLabel} hint={t.messageHint}>
          {(field) => (
            <textarea
              {...field}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (result?.kind === "message") setResult(null);
              }}
              placeholder={t.messagePlaceholder}
              rows={3}
              className={fieldClassName}
            />
          )}
        </FormField>
        <Button
          variant="outline"
          className="justify-self-start"
          disabled={pending !== null || message.trim() === ""}
          aria-busy={pending === "message" || undefined}
          onClick={() => submit({ kind: "message", message: message.trim() }, () => setMessage(""))}
        >
          {pending === "message" && spinner}
          {pending === "message" ? t.saving : t.sendMessage}
        </Button>
        {outcome("message")}
      </div>
    </SectionCard>
  );
}
