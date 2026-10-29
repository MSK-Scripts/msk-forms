"use client";

import { WEBHOOK_EVENTS, type WebhookEvent, type WebhookFormat } from "@msk-forms/shared";
import { useId, useState, type FormEvent } from "react";

import {
  Checkbox,
  ConfirmDialog,
  CopyField,
  EmptyState,
  FormField,
  Notice,
  SectionCard,
  StatusBadge,
  type CopyFieldCopy,
  type StatusTone,
} from "@/components/dashboard-kit";
import { CircleNotch, Eye, EyeSlash, Pause, Play, Plus, Trash } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioCard } from "@/components/ui/radio-card";
import { Select } from "@/components/ui/select";
import type { Dictionary } from "@/i18n";

export interface WebhookRow {
  id: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  /** "manual" (added here) or an integration provider ("zapier"/"make"). */
  source: string;
  /** "json" (generic signed POST) or "discord" (Discord embed). */
  format: string;
  /** Form this hook is scoped to, or null for every form in the guild. */
  formId: string | null;
  /** Outcome of the most recent delivery attempt, if any. */
  lastDelivery: { status: string; error: string | null; at: string } | null;
}

/** Badge label for an integration-managed hook; brand names stay verbatim. */
function sourceLabel(source: string, t: WebhooksDict): string {
  if (source === "zapier") return "Zapier";
  if (source === "make") return "Make";
  return t.managedBadge;
}

type WebhooksDict = Dictionary["webhooks"];

/** Human label for an event key, falling back to the raw key. */
function eventLabel(event: string, t: WebhooksDict): string {
  if (event === "submission.created") return t.eventCreated;
  if (event === "submission.status_changed") return t.eventStatusChanged;
  return event;
}

/** The last delivery as a system state: word plus sign. */
function deliveryState(
  delivery: WebhookRow["lastDelivery"],
  t: WebhooksDict,
): { tone: StatusTone; label: string } {
  if (!delivery) return { tone: "neutral", label: t.deliveryNone };
  if (delivery.status === "success") return { tone: "success", label: t.deliverySuccess };
  if (delivery.status === "failed") return { tone: "danger", label: t.deliveryFailed };
  return { tone: "warning", label: t.deliveryPending };
}

/**
 * The outgoing webhooks of a guild: the form to add an endpoint and the list
 * of endpoints with their last delivery, the signing secret behind Show and
 * Hide, pausing and deleting. Hooks created by an integration (Zapier, Make)
 * carry a tag and say where they are managed.
 */
export function WebhooksManager({
  guildId,
  initial,
  forms,
  t,
  kit,
}: {
  guildId: string;
  initial: WebhookRow[];
  forms: { id: string; title: string }[];
  t: WebhooksDict;
  kit: { copyField: CopyFieldCopy; dismiss: string };
}) {
  const ids = useId();
  const [webhooks, setWebhooks] = useState<WebhookRow[]>(initial);
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<WebhookFormat>("json");
  // "" = every form; otherwise a specific form id.
  const [formId, setFormId] = useState("");
  const [events, setEvents] = useState<Set<WebhookEvent>>(new Set(WEBHOOK_EVENTS));
  const formTitle = (id: string | null) => forms.find((f) => f.id === id)?.title ?? id;
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const confirmHook = webhooks.find((w) => w.id === confirmId) ?? null;
  const urlId = (hook: WebhookRow) => `${ids}-url-${hook.id}`;

  function toggleEvent(event: WebhookEvent) {
    setEvents((prev) => {
      const next = new Set(prev);
      if (next.has(event)) next.delete(event);
      else next.add(event);
      return next;
    });
  }

  async function add(e: FormEvent) {
    e.preventDefault();
    if (adding || !url.trim() || events.size === 0) return;
    setAddError(null);
    setAdding(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/webhooks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          events: [...events],
          format,
          formId: formId || null,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        webhook?: WebhookRow;
        error?: string;
      } | null;
      if (!res.ok || !data?.webhook) throw new Error(data?.error ?? t.errAdd);
      // Hooks added here are always manually managed and have no deliveries yet.
      setWebhooks((prev) => [...prev, { ...data.webhook!, source: "manual", lastDelivery: null }]);
      setUrl("");
      setFormat("json");
      setFormId("");
      setEvents(new Set(WEBHOOK_EVENTS));
    } catch (err) {
      setAddError(err instanceof Error ? err.message : t.errAdd);
    } finally {
      setAdding(false);
    }
  }

  async function toggleActive(hook: WebhookRow) {
    setActionError(null);
    const next = !hook.active;
    setWebhooks((prev) => prev.map((w) => (w.id === hook.id ? { ...w, active: next } : w)));
    const res = await fetch(`/api/guilds/${guildId}/webhooks/${hook.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
    if (!res.ok) {
      // Revert on failure.
      setWebhooks((prev) =>
        prev.map((w) => (w.id === hook.id ? { ...w, active: hook.active } : w)),
      );
      setActionError(t.errAction);
    }
  }

  async function remove() {
    if (!confirmId) return;
    setRemoveError(null);
    setRemoving(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/webhooks/${confirmId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(t.errAction);
      setWebhooks((prev) => prev.filter((w) => w.id !== confirmId));
      setConfirmId(null);
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : t.errAction);
    } finally {
      setRemoving(false);
    }
  }

  function toggleReveal(hook: WebhookRow) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(hook.id)) next.delete(hook.id);
      else next.add(hook.id);
      return next;
    });
  }

  return (
    <div className="grid gap-[var(--app-gutter-y)]">
      <SectionCard title={t.addTitle}>
        <form onSubmit={add} className="grid gap-6">
          <fieldset className="grid gap-2">
            <legend className="mb-1.5 font-semibold">{t.format}</legend>
            <div className="grid gap-3 @md:grid-cols-2">
              <RadioCard
                name={`${ids}-format`}
                value="json"
                checked={format === "json"}
                onChange={() => setFormat("json")}
              >
                {t.formatJson}
              </RadioCard>
              <RadioCard
                name={`${ids}-format`}
                value="discord"
                checked={format === "discord"}
                onChange={() => setFormat("discord")}
              >
                {t.formatDiscord}
              </RadioCard>
            </div>
          </fieldset>

          <FormField label={t.url} hint={format === "discord" ? t.discordHint : undefined}>
            {(field) => (
              <Input
                {...field}
                value={url}
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                placeholder={format === "discord" ? t.discordUrlPlaceholder : t.urlPlaceholder}
                onChange={(e) => setUrl(e.target.value)}
                className="font-mono"
              />
            )}
          </FormField>

          <fieldset className="grid gap-1">
            <legend className="mb-1 font-semibold">{t.events}</legend>
            {WEBHOOK_EVENTS.map((event) => (
              <Checkbox
                key={event}
                label={eventLabel(event, t)}
                checked={events.has(event)}
                onChange={() => toggleEvent(event)}
              />
            ))}
          </fieldset>

          {forms.length > 0 && (
            <FormField label={t.formScope} hint={t.formScopeHint}>
              {(field) => (
                <Select
                  {...field}
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  className="max-w-md"
                >
                  <option value="">{t.scopeAll}</option>
                  {forms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
          )}

          <div>
            <Button
              type="submit"
              disabled={adding || !url.trim() || events.size === 0}
              aria-busy={adding || undefined}
            >
              {adding ? (
                <CircleNotch className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {adding ? t.adding : t.add}
            </Button>
          </div>
          {addError && (
            <Notice
              tone="danger"
              role="alert"
              onDismiss={() => setAddError(null)}
              dismissLabel={kit.dismiss}
            >
              {addError}
            </Notice>
          )}
        </form>
      </SectionCard>

      <SectionCard title={t.yourWebhooks} bodyClassName="py-1">
        {actionError && (
          <Notice
            tone="danger"
            role="alert"
            onDismiss={() => setActionError(null)}
            dismissLabel={kit.dismiss}
            className="my-4"
          >
            {actionError}
          </Notice>
        )}
        {webhooks.length === 0 ? (
          <EmptyState kind="first-use" title={t.empty} />
        ) : (
          <ul className="divide-y divide-border">
            {webhooks.map((hook) => {
              const delivery = deliveryState(hook.lastDelivery, t);
              const secretLabelId = `${ids}-secret-${hook.id}`;
              const shown = revealed.has(hook.id);
              return (
                <li key={hook.id} className="grid gap-4 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="grid min-w-0 gap-2">
                      <p id={urlId(hook)} className="font-mono text-small font-semibold break-all">
                        {hook.url}
                      </p>
                      {hook.source !== "manual" && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <Badge>{sourceLabel(hook.source, t)}</Badge>
                          <span className="text-small text-muted-foreground">{t.managedHint}</span>
                        </div>
                      )}
                    </div>
                    <StatusBadge tone={hook.active ? "success" : "neutral"}>
                      {hook.active ? t.active : t.inactive}
                    </StatusBadge>
                  </div>

                  <dl className="grid gap-x-6 gap-y-3 text-small @lg:grid-cols-2 @5xl:grid-cols-4">
                    <div className="grid content-start gap-1">
                      <dt className="text-muted-foreground">{t.events}</dt>
                      <dd>{hook.events.map((event) => eventLabel(event, t)).join(", ")}</dd>
                    </div>
                    <div className="grid content-start gap-1">
                      <dt className="text-muted-foreground">{t.format}</dt>
                      <dd>{hook.format === "discord" ? t.formatDiscord : t.formatJson}</dd>
                    </div>
                    <div className="grid content-start gap-1">
                      <dt className="text-muted-foreground">{t.formScope}</dt>
                      <dd className="break-words">
                        {hook.formId ? (
                          <span translate="no">{formTitle(hook.formId)}</span>
                        ) : (
                          t.scopeAll
                        )}
                      </dd>
                    </div>
                    <div className="grid content-start gap-1">
                      <dt className="text-muted-foreground">{t.lastDelivery}</dt>
                      <dd className="grid gap-1">
                        <StatusBadge tone={delivery.tone}>{delivery.label}</StatusBadge>
                        {hook.lastDelivery?.error && (
                          <span className="break-words text-muted-foreground">
                            {hook.lastDelivery.error}
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>

                  {/* The signing secret only applies to generic JSON hooks; a
                      Discord webhook does not verify a signature. */}
                  {hook.format !== "discord" && (
                    <div className="grid gap-1.5">
                      <span id={secretLabelId} className="text-small font-semibold">
                        {t.secret}
                      </span>
                      <div className="flex min-w-0 flex-wrap items-start gap-2">
                        {shown ? (
                          <CopyField
                            value={hook.secret}
                            copy={kit.copyField}
                            className="min-w-0 flex-1 basis-72"
                          />
                        ) : (
                          <code
                            aria-hidden
                            className="flex min-h-11 min-w-0 flex-1 basis-72 items-center overflow-hidden rounded-md border border-border bg-muted px-3 py-2 font-mono text-small text-muted-foreground"
                          >
                            {"•".repeat(24)}
                          </code>
                        )}
                        <Button
                          variant="outline"
                          aria-describedby={secretLabelId}
                          onClick={() => toggleReveal(hook)}
                        >
                          {shown ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          {shown ? t.hide : t.show}
                        </Button>
                      </div>
                      <p className="text-small text-muted-foreground">{t.secretHint}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      aria-describedby={urlId(hook)}
                      onClick={() => toggleActive(hook)}
                    >
                      {hook.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {hook.active ? t.disable : t.enable}
                    </Button>
                    <Button
                      variant="outline"
                      className="text-danger"
                      aria-describedby={urlId(hook)}
                      onClick={() => {
                        setRemoveError(null);
                        setConfirmId(hook.id);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                      {t.remove}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      <ConfirmDialog
        open={confirmHook !== null}
        onClose={() => {
          if (removing) return;
          setRemoveError(null);
          setConfirmId(null);
        }}
        onConfirm={remove}
        title={t.removeAction}
        description={t.removeConfirm}
        notice={confirmHook && <p className="font-mono text-small break-all">{confirmHook.url}</p>}
        confirmLabel={t.removeAction}
        cancelLabel={t.cancel}
        busy={removing}
        error={removeError}
      />
    </div>
  );
}
