"use client";

import { WEBHOOK_EVENTS, type WebhookEvent } from "@msk-forms/shared";
import { Button, Card, Checkbox, Field, Input } from "@msk-forms/ui";
import { useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Dictionary } from "@/i18n";

export interface WebhookRow {
  id: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
}

type WebhooksDict = Dictionary["webhooks"];

/** Human label for an event key, falling back to the raw key. */
function eventLabel(event: string, t: WebhooksDict): string {
  if (event === "submission.created") return t.eventCreated;
  if (event === "submission.status_changed") return t.eventStatusChanged;
  return event;
}

export function WebhooksManager({
  guildId,
  initial,
  t,
}: {
  guildId: string;
  initial: WebhookRow[];
  t: WebhooksDict;
}) {
  const [webhooks, setWebhooks] = useState<WebhookRow[]>(initial);
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<Set<WebhookEvent>>(new Set(WEBHOOK_EVENTS));
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  function toggleEvent(event: WebhookEvent) {
    setEvents((prev) => {
      const next = new Set(prev);
      if (next.has(event)) next.delete(event);
      else next.add(event);
      return next;
    });
  }

  async function add() {
    setError(null);
    setAdding(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/webhooks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), events: [...events] }),
      });
      const data = (await res.json().catch(() => null)) as
        | { webhook?: WebhookRow; error?: string }
        | null;
      if (!res.ok || !data?.webhook) throw new Error(data?.error ?? t.errAdd);
      setWebhooks((prev) => [...prev, data.webhook!]);
      setUrl("");
      setEvents(new Set(WEBHOOK_EVENTS));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errAdd);
    } finally {
      setAdding(false);
    }
  }

  async function toggleActive(hook: WebhookRow) {
    setError(null);
    const next = !hook.active;
    setWebhooks((prev) => prev.map((w) => (w.id === hook.id ? { ...w, active: next } : w)));
    const res = await fetch(`/api/guilds/${guildId}/webhooks/${hook.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
    if (!res.ok) {
      // Revert on failure.
      setWebhooks((prev) => prev.map((w) => (w.id === hook.id ? { ...w, active: hook.active } : w)));
      setError(t.errAction);
    }
  }

  async function remove() {
    if (!confirmId) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/webhooks/${confirmId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(t.errAction);
      setWebhooks((prev) => prev.filter((w) => w.id !== confirmId));
      setConfirmId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errAction);
    } finally {
      setRemoving(false);
    }
  }

  async function copySecret(hook: WebhookRow) {
    try {
      await navigator.clipboard.writeText(hook.secret);
      setCopied(hook.id);
      setTimeout(() => setCopied((c) => (c === hook.id ? null : c)), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-4 p-5">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t.addTitle}
        </h3>
        <Field label={t.url}>
          <Input
            value={url}
            placeholder={t.urlPlaceholder}
            onChange={(e) => setUrl(e.target.value)}
          />
        </Field>
        <Field label={t.events}>
          <div className="flex flex-col gap-2">
            {WEBHOOK_EVENTS.map((event) => (
              <Checkbox
                key={event}
                id={`event-${event}`}
                label={eventLabel(event, t)}
                checked={events.has(event)}
                onChange={() => toggleEvent(event)}
              />
            ))}
          </div>
        </Field>
        <div>
          <Button type="button" onClick={add} disabled={adding || !url.trim() || events.size === 0}>
            {adding ? t.adding : t.add}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </Card>

      <Card className="flex flex-col gap-3 p-5">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t.yourWebhooks}
        </h3>
        {webhooks.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.empty}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {webhooks.map((hook) => (
              <li key={hook.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="break-all font-mono text-sm text-foreground">{hook.url}</span>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                      hook.active
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {hook.active ? t.active : t.inactive}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {hook.events.map((event) => (
                    <span
                      key={event}
                      className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
                    >
                      {eventLabel(event, t)}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">{t.secret}:</span>
                  <code className="break-all font-mono">
                    {revealed.has(hook.id) ? hook.secret : "•".repeat(24)}
                  </code>
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() =>
                      setRevealed((prev) => {
                        const next = new Set(prev);
                        if (next.has(hook.id)) next.delete(hook.id);
                        else next.add(hook.id);
                        return next;
                      })
                    }
                  >
                    {revealed.has(hook.id) ? t.hide : t.show}
                  </button>
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => copySecret(hook)}
                  >
                    {copied === hook.id ? t.copied : t.copy}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">{t.secretHint}</p>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => toggleActive(hook)}>
                    {hook.active ? t.disable : t.enable}
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmId(hook.id)}>
                    {t.remove}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ConfirmDialog
        open={confirmId !== null}
        title={t.remove}
        message={t.removeConfirm}
        confirmLabel={t.remove}
        cancelLabel={t.cancel}
        busy={removing}
        onConfirm={remove}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
