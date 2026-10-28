"use client";

import {
  LOG_ACTION_GROUPS,
  LOG_ACTIONS,
  type LogAction,
  type LogActionGroup,
} from "@msk-forms/shared";
import { useId, useState, type FormEvent } from "react";

import {
  ConfirmDialog,
  EmptyState,
  FormField,
  Notice,
  SectionCard,
  StatusBadge,
  type StatusTone,
} from "@/components/dashboard-kit";
import {
  CheckCircle,
  CircleNotch,
  FloppyDisk,
  PaperPlaneTilt,
  Pause,
  PencilSimple,
  Play,
  Plus,
  Trash,
  XCircle,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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

/** The last delivery as a system state: word plus sign. */
function deliveryState(
  delivery: AuditHookRow["lastDelivery"],
  t: AuditDict,
): { tone: StatusTone; label: string } {
  if (!delivery) return { tone: "neutral", label: t.deliveryNone };
  if (delivery.status === "success") return { tone: "success", label: t.deliverySuccess };
  if (delivery.status === "failed") return { tone: "danger", label: t.deliveryFailed };
  return { tone: "warning", label: t.deliveryPending };
}

const selectedCount = (n: number, t: AuditDict) =>
  t.selectedCount.replace("{n}", String(n)).replace("{total}", String(LOG_ACTIONS.length));

/**
 * Grouped checkboxes for choosing which actions a hook receives: a fieldset
 * per group, each with its own select-all, and select all or none for the
 * whole list.
 */
function ActionPicker({
  value,
  onChange,
  t,
}: {
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
    <fieldset className="grid gap-4">
      <legend className="mb-1 font-semibold">{t.whatToLog}</legend>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="ghost" onClick={() => setMany(LOG_ACTIONS, true)}>
          {t.selectAll}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setMany(LOG_ACTIONS, false)}>
          {t.selectNone}
        </Button>
        <span className="text-small text-muted-foreground tabular-nums">
          {selectedCount(value.size, t)}
        </span>
      </div>
      <div className="grid gap-x-8 gap-y-5 @3xl:grid-cols-2">
        {GROUPS.map(([group, actions]) => {
          const all = actions.every((a) => value.has(a));
          return (
            <div key={group} className="border-t border-border pt-3">
              <fieldset className="grid content-start gap-0.5">
                <legend className="font-semibold">{t.groups[group]}</legend>
                <div>
                  <Button type="button" variant="ghost" onClick={() => setMany(actions, !all)}>
                    {all ? t.selectNone : t.selectAll}
                  </Button>
                </div>
                {group === "security" && (
                  <p className="max-w-[65ch] text-small text-muted-foreground">{t.securityHint}</p>
                )}
                {actions.map((action) => (
                  <label
                    key={action}
                    className="flex min-h-11 w-fit cursor-pointer items-center gap-3"
                  >
                    <input
                      type="checkbox"
                      checked={value.has(action)}
                      onChange={() => setMany([action], !value.has(action))}
                      className="h-5 w-5 shrink-0 accent-primary"
                    />
                    <span>{t.actions[action]}</span>
                  </label>
                ))}
              </fieldset>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * The audit log webhooks of a guild: adding a Discord webhook with the
 * actions it receives, and per hook its last delivery, a test entry, editing,
 * pausing and removing. The full URL never reaches the client; the list shows
 * it masked.
 */
export function AuditLogManager({
  guildId,
  initial,
  forms,
  t,
  kit,
}: {
  guildId: string;
  initial: AuditHookRow[];
  forms: { id: string; title: string }[];
  t: AuditDict;
  kit: { dismiss: string };
}) {
  const ids = useId();
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
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  const formTitle = (id: string | null) => forms.find((f) => f.id === id)?.title ?? id;
  const confirmHook = hooks.find((h) => h.id === confirmId) ?? null;
  const nameId = (hook: AuditHookRow) => `${ids}-hook-${hook.id}`;
  const scopeOptions = (
    <>
      <option value="">{t.scopeAll}</option>
      {forms.map((f) => (
        <option key={f.id} value={f.id}>
          {f.title}
        </option>
      ))}
    </>
  );

  async function add(e: FormEvent) {
    e.preventDefault();
    if (adding || !url.trim() || actions.size === 0) return;
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
    setRemoveError(null);
    setRemoving(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/audit-log/${confirmId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(t.errAction);
      setHooks((prev) => prev.filter((h) => h.id !== confirmId));
      setConfirmId(null);
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : t.errAction);
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="grid gap-[var(--app-gutter-y)]">
      <SectionCard title={t.addTitle}>
        <form onSubmit={add} className="grid gap-6">
          <div className="grid gap-5 @3xl:grid-cols-2">
            <FormField label={t.name} hint={t.nameHint}>
              {(field) => (
                <Input
                  {...field}
                  value={name}
                  maxLength={80}
                  placeholder={t.namePlaceholder}
                  onChange={(e) => setName(e.target.value)}
                />
              )}
            </FormField>
            {forms.length > 0 && (
              <FormField label={t.formScope} hint={t.formScopeHint}>
                {(field) => (
                  <Select {...field} value={formId} onChange={(e) => setFormId(e.target.value)}>
                    {scopeOptions}
                  </Select>
                )}
              </FormField>
            )}
          </div>
          <FormField label={t.url} hint={t.urlHint}>
            {(field) => (
              <Input
                {...field}
                value={url}
                placeholder="https://discord.com/api/webhooks/…"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => setUrl(e.target.value)}
                className="font-mono"
              />
            )}
          </FormField>
          <ActionPicker value={actions} onChange={setActions} t={t} />
          <div>
            <Button
              type="submit"
              disabled={adding || !url.trim() || actions.size === 0}
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
          {error && (
            <Notice
              tone="danger"
              role="alert"
              onDismiss={() => setError(null)}
              dismissLabel={kit.dismiss}
            >
              {error}
            </Notice>
          )}
        </form>
      </SectionCard>

      <SectionCard title={t.yourHooks} bodyClassName="py-1">
        {rowError && (
          <Notice
            tone="danger"
            role="alert"
            onDismiss={() => setRowError(null)}
            dismissLabel={kit.dismiss}
            className="my-4"
          >
            {rowError}
          </Notice>
        )}
        {hooks.length === 0 ? (
          <EmptyState kind="first-use" title={t.empty} />
        ) : (
          <ul className="divide-y divide-border">
            {hooks.map((hook) => {
              const tested = testState[hook.id];
              const editing = editingId === hook.id;
              const delivery = deliveryState(hook.lastDelivery, t);
              return (
                <li key={hook.id} className="grid gap-4 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="grid min-w-0 gap-0.5">
                      <p id={nameId(hook)} className="font-semibold break-words">
                        {hook.name ? <span translate="no">{hook.name}</span> : t.unnamed}
                      </p>
                      <p className="font-mono text-small break-all text-muted-foreground">
                        {hook.maskedUrl}
                      </p>
                    </div>
                    <StatusBadge tone={hook.active ? "success" : "neutral"}>
                      {hook.active ? t.active : t.inactive}
                    </StatusBadge>
                  </div>

                  <dl className="grid gap-x-6 gap-y-3 text-small @lg:grid-cols-3">
                    <div className="grid content-start gap-1">
                      <dt className="text-muted-foreground">{t.whatToLog}</dt>
                      <dd className="tabular-nums">{selectedCount(hook.actions.length, t)}</dd>
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

                  {editing && (
                    <div className="grid gap-6 border-t border-border pt-5">
                      <div className="grid gap-5 @3xl:grid-cols-2">
                        <FormField label={t.name}>
                          {(field) => (
                            <Input
                              {...field}
                              value={editName}
                              maxLength={80}
                              onChange={(e) => setEditName(e.target.value)}
                            />
                          )}
                        </FormField>
                        {forms.length > 0 && (
                          <FormField label={t.formScope}>
                            {(field) => (
                              <Select
                                {...field}
                                value={editFormId}
                                onChange={(e) => setEditFormId(e.target.value)}
                              >
                                {scopeOptions}
                              </Select>
                            )}
                          </FormField>
                        )}
                      </div>
                      <ActionPicker value={editActions} onChange={setEditActions} t={t} />
                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={() => saveEdit(hook)}
                          disabled={savingId === hook.id || editActions.size === 0}
                          aria-busy={savingId === hook.id || undefined}
                        >
                          {savingId === hook.id ? (
                            <CircleNotch className="h-4 w-4 animate-spin" />
                          ) : (
                            <FloppyDisk className="h-4 w-4" />
                          )}
                          {savingId === hook.id ? t.saving : t.save}
                        </Button>
                        <Button variant="outline" onClick={() => setEditingId(null)}>
                          {t.cancel}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="outline"
                      aria-describedby={nameId(hook)}
                      onClick={() => test(hook)}
                      disabled={tested === "busy"}
                    >
                      {tested === "busy" ? (
                        <CircleNotch className="h-4 w-4 animate-spin" />
                      ) : (
                        <PaperPlaneTilt className="h-4 w-4" />
                      )}
                      {tested === "busy" ? t.testing : t.test}
                    </Button>
                    {!editing && (
                      <Button
                        variant="outline"
                        aria-describedby={nameId(hook)}
                        onClick={() => startEdit(hook)}
                      >
                        <PencilSimple className="h-4 w-4" />
                        {t.edit}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      aria-describedby={nameId(hook)}
                      onClick={() => patch(hook, { active: !hook.active })}
                      disabled={savingId === hook.id}
                    >
                      {hook.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {hook.active ? t.disable : t.enable}
                    </Button>
                    <Button
                      variant="outline"
                      className="text-danger"
                      aria-describedby={nameId(hook)}
                      onClick={() => {
                        setRemoveError(null);
                        setConfirmId(hook.id);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                      {t.remove}
                    </Button>
                  </div>
                  {/* Always rendered, so the result of a test is announced. */}
                  <p
                    role="status"
                    className={
                      tested && tested !== "busy"
                        ? `flex items-start gap-1.5 text-small font-semibold ${tested.ok ? "text-success" : "text-danger"}`
                        : "sr-only"
                    }
                  >
                    {tested && tested !== "busy" && (
                      <>
                        {tested.ok ? (
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" weight="bold" />
                        ) : (
                          <XCircle className="mt-0.5 h-4 w-4 shrink-0" weight="bold" />
                        )}
                        {tested.text}
                      </>
                    )}
                  </p>
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
        notice={
          confirmHook && (
            <p className="grid gap-0.5">
              <span className="font-semibold">
                {confirmHook.name ? <span translate="no">{confirmHook.name}</span> : t.unnamed}
              </span>
              <span className="font-mono text-small break-all text-muted-foreground">
                {confirmHook.maskedUrl}
              </span>
            </p>
          )
        }
        confirmLabel={t.removeAction}
        cancelLabel={t.cancel}
        busy={removing}
        error={removeError}
      />
    </div>
  );
}
