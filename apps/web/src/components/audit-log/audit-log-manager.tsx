"use client";

import {
  LOG_ACTION_GROUPS,
  LOG_ACTIONS,
  type LogAction,
  type LogActionGroup,
} from "@msk-forms/shared";
import { Button, Card, Checkbox, Field, Input, Select } from "@msk-forms/ui";
import { useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Dictionary } from "@/i18n";

type AuditDict = Dictionary["auditLog"];

export interface AuditHookRow {
  id: string;
  name: string | null;
  /** Webhook URL with the token hidden. The real URL never reaches the client. */
  maskedUrl: string;
  actions: LogAction[];
  active: boolean;
  formId: string | null;
  lastDelivery: { status: string; error: string | null; at: string } | null;
}

const GROUPS = Object.entries(LOG_ACTION_GROUPS) as [LogActionGroup, readonly LogAction[]][];

/** Map a server error code to something a person can act on. */
function errorText(code: string | undefined, fallback: string, t: AuditDict): string {
  switch (code) {
    case "not_found":
      return t.errNotFound;
    case "unreachable":
      return t.errUnreachable;
    case "invalid":
      return t.errInvalidUrl;
    case "limit":
      return t.errLimit;
    case "rate_limited":
      return t.errRateLimited;
    default:
      return fallback;
  }
}

/** Grouped checkboxes for choosing which actions a hook receives. */
function ActionPicker({
  idPrefix,
  value,
  onChange,
  t,
}: {
  idPrefix: string;
  value: Set<LogAction>;
  onChange: (next: Set<LogAction>) => void;
  t: AuditDict;
}) {
  function setMany(actions: readonly LogAction[], on: boolean) {
    const next = new Set(value);
    for (const a of actions) {
      if (on) next.add(a);
      else next.delete(a);
    }
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <button
          type="button"
          className="text-primary hover:underline"
          onClick={() => setMany(LOG_ACTIONS, true)}
        >
          {t.selectAll}
        </button>
        <button
          type="button"
          className="text-primary hover:underline"
          onClick={() => setMany(LOG_ACTIONS, false)}
        >
          {t.selectNone}
        </button>
        <span className="text-muted-foreground">
          {t.selectedCount
            .replace("{n}", String(value.size))
            .replace("{total}", String(LOG_ACTIONS.length))}
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {GROUPS.map(([group, actions]) => {
          const all = actions.every((a) => value.has(a));
          return (
            <fieldset
              key={group}
              className="flex flex-col gap-1 rounded-lg border border-border p-3"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <legend className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t.groups[group]}
                </legend>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => setMany(actions, !all)}
                >
                  {all ? t.selectNone : t.selectAll}
                </button>
              </div>
              {group === "security" && (
                <p className="text-xs text-muted-foreground">{t.securityHint}</p>
              )}
              {actions.map((action) => (
                <Checkbox
                  key={action}
                  id={`${idPrefix}-${action}`}
                  label={t.actions[action]}
                  checked={value.has(action)}
                  onChange={() => setMany([action], !value.has(action))}
                />
              ))}
            </fieldset>
          );
        })}
      </div>
    </div>
  );
}

export function AuditLogManager({
  guildId,
  initial,
  forms,
  t,
}: {
  guildId: string;
  initial: AuditHookRow[];
  forms: { id: string; title: string }[];
  t: AuditDict;
}) {
  const [hooks, setHooks] = useState<AuditHookRow[]>(initial);

  // Create form
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [formId, setFormId] = useState("");
  const [actions, setActions] = useState<Set<LogAction>>(new Set(LOG_ACTIONS));
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Row state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editActions, setEditActions] = useState<Set<LogAction>>(new Set());
  const [editFormId, setEditFormId] = useState("");
  const [editName, setEditName] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [testState, setTestState] = useState<
    Record<string, { ok: boolean; text: string } | "busy">
  >({});
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);

  const formTitle = (id: string | null) => forms.find((f) => f.id === id)?.title ?? id;
  const scopeOptions = [
    { value: "", label: t.scopeAll },
    ...forms.map((f) => ({ value: f.id, label: f.title })),
  ];

  async function add() {
    setError(null);
    setAdding(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/audit-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          url: url.trim(),
          actions: [...actions],
          formId: formId || null,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        webhook?: { id: string; name: string | null; active: boolean; formId: string | null };
        error?: string;
        code?: string;
      } | null;
      if (!res.ok || !data?.webhook) throw new Error(errorText(data?.code, t.errAdd, t));
      const masked = url.trim().replace(/\/[A-Za-z0-9_-]+$/, "/••••••••");
      setHooks((prev) => [
        ...prev,
        {
          id: data.webhook!.id,
          name: data.webhook!.name,
          maskedUrl: masked,
          actions: [...actions],
          active: data.webhook!.active,
          formId: data.webhook!.formId,
          lastDelivery: null,
        },
      ]);
      setName("");
      setUrl("");
      setFormId("");
      setActions(new Set(LOG_ACTIONS));
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errAdd);
    } finally {
      setAdding(false);
    }
  }

  async function patch(hook: AuditHookRow, body: Record<string, unknown>): Promise<boolean> {
    setRowError(null);
    setSavingId(hook.id);
    try {
      const res = await fetch(`/api/guilds/${guildId}/audit-log/${hook.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => null)) as {
        webhook?: { name: string | null; events: string[]; active: boolean; formId: string | null };
        error?: string;
      } | null;
      if (!res.ok || !data?.webhook) throw new Error(t.errAction);
      const w = data.webhook;
      setHooks((prev) =>
        prev.map((h) =>
          h.id === hook.id
            ? {
                ...h,
                name: w.name,
                active: w.active,
                formId: w.formId,
                actions: w.events
                  .map((e) => e.replace(/^log\./, ""))
                  .filter((a): a is LogAction => (LOG_ACTIONS as readonly string[]).includes(a)),
              }
            : h,
        ),
      );
      return true;
    } catch (err) {
      setRowError(err instanceof Error ? err.message : t.errAction);
      return false;
    } finally {
      setSavingId(null);
    }
  }

  function startEdit(hook: AuditHookRow) {
    setEditingId(hook.id);
    setEditActions(new Set(hook.actions));
    setEditFormId(hook.formId ?? "");
    setEditName(hook.name ?? "");
  }

  async function saveEdit(hook: AuditHookRow) {
    const ok = await patch(hook, {
      name: editName.trim() || null,
      actions: [...editActions],
      formId: editFormId || null,
    });
    if (ok) setEditingId(null);
  }

  async function test(hook: AuditHookRow) {
    setTestState((s) => ({ ...s, [hook.id]: "busy" }));
    const res = await fetch(`/api/guilds/${guildId}/audit-log/${hook.id}/test`, { method: "POST" });
    const data = (await res.json().catch(() => null)) as { code?: string } | null;
    setTestState((s) => ({
      ...s,
      [hook.id]: res.ok
        ? { ok: true, text: t.testOk }
        : { ok: false, text: errorText(data?.code, t.testFail, t) },
    }));
  }

  async function remove() {
    if (!confirmId) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/audit-log/${confirmId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(t.errAction);
      setHooks((prev) => prev.filter((h) => h.id !== confirmId));
      setConfirmId(null);
    } catch (err) {
      setRowError(err instanceof Error ? err.message : t.errAction);
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-4 p-5">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t.addTitle}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t.name} hint={t.nameHint}>
            <Input
              value={name}
              maxLength={80}
              placeholder={t.namePlaceholder}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          {forms.length > 0 && (
            <Field label={t.formScope} hint={t.formScopeHint}>
              <Select
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
                options={scopeOptions}
              />
            </Field>
          )}
        </div>
        <Field label={t.url} hint={t.urlHint}>
          <Input
            value={url}
            placeholder="https://discord.com/api/webhooks/…"
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setUrl(e.target.value)}
          />
        </Field>
        <Field label={t.whatToLog}>
          <ActionPicker idPrefix="new" value={actions} onChange={setActions} t={t} />
        </Field>
        <div>
          <Button
            type="button"
            onClick={add}
            disabled={adding || !url.trim() || actions.size === 0}
          >
            {adding ? t.adding : t.add}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </Card>

      <Card className="flex flex-col gap-3 p-5">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t.yourHooks}
        </h3>
        {rowError && <p className="text-sm text-destructive">{rowError}</p>}
        {hooks.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.empty}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {hooks.map((hook) => {
              const tested = testState[hook.id];
              const editing = editingId === hook.id;
              return (
                <li key={hook.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-col">
                      <span className="font-medium text-foreground">{hook.name ?? t.unnamed}</span>
                      <span className="break-all font-mono text-xs text-muted-foreground">
                        {hook.maskedUrl}
                      </span>
                    </div>
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
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground">
                      {t.selectedCount
                        .replace("{n}", String(hook.actions.length))
                        .replace("{total}", String(LOG_ACTIONS.length))}
                    </span>
                    <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground">
                      {hook.formId ? formTitle(hook.formId) : t.scopeAll}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">{t.lastDelivery}:</span>{" "}
                    {hook.lastDelivery ? (
                      <span
                        className={
                          hook.lastDelivery.status === "success"
                            ? "text-primary"
                            : hook.lastDelivery.status === "failed"
                              ? "text-destructive"
                              : "text-muted-foreground"
                        }
                      >
                        {hook.lastDelivery.status === "success"
                          ? t.deliverySuccess
                          : hook.lastDelivery.status === "failed"
                            ? t.deliveryFailed
                            : t.deliveryPending}
                        {hook.lastDelivery.error ? ` (${hook.lastDelivery.error})` : ""}
                      </span>
                    ) : (
                      t.deliveryNone
                    )}
                  </p>

                  {editing && (
                    <div className="flex flex-col gap-4 rounded-lg bg-muted/30 p-3">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label={t.name}>
                          <Input
                            value={editName}
                            maxLength={80}
                            onChange={(e) => setEditName(e.target.value)}
                          />
                        </Field>
                        {forms.length > 0 && (
                          <Field label={t.formScope}>
                            <Select
                              value={editFormId}
                              onChange={(e) => setEditFormId(e.target.value)}
                              options={scopeOptions}
                            />
                          </Field>
                        )}
                      </div>
                      <ActionPicker
                        idPrefix={`edit-${hook.id}`}
                        value={editActions}
                        onChange={setEditActions}
                        t={t}
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => saveEdit(hook)}
                          disabled={savingId === hook.id || editActions.size === 0}
                        >
                          {savingId === hook.id ? t.saving : t.save}
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setEditingId(null)}>
                          {t.cancel}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="ghost" onClick={() => test(hook)} disabled={tested === "busy"}>
                      {tested === "busy" ? t.testing : t.test}
                    </Button>
                    {!editing && (
                      <Button variant="ghost" onClick={() => startEdit(hook)}>
                        {t.edit}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() => patch(hook, { active: !hook.active })}
                      disabled={savingId === hook.id}
                    >
                      {hook.active ? t.disable : t.enable}
                    </Button>
                    <Button variant="ghost" onClick={() => setConfirmId(hook.id)}>
                      {t.remove}
                    </Button>
                    {tested && tested !== "busy" && (
                      <span
                        className={`text-xs ${tested.ok ? "text-primary" : "text-destructive"}`}
                      >
                        {tested.text}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
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
