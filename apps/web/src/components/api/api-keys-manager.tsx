"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

import {
  ConfirmDialog,
  CopyField,
  DataTable,
  EmptyState,
  FormField,
  Notice,
  SectionCard,
  type CopyFieldCopy,
  type DataColumn,
} from "@/components/dashboard-kit";
import { CircleNotch, Key, Trash } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/i18n";

export interface ApiKeyRow {
  id: string;
  name: string;
  lastUsedAt: Date | null;
  createdAt: Date;
}

type ApiDict = Dictionary["api"];

const day = (d: Date | string) => new Date(d).toISOString().slice(0, 10);

const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");

/**
 * The API keys of an Enterprise guild: creating one (its secret is shown once,
 * to copy), the keys with when they were created and last used, and revoking,
 * which cannot be undone and so asks for the key's name. Below them the
 * endpoint example.
 */
export function ApiKeysManager({
  guildId,
  initial,
  baseUrl,
  t,
  kit,
}: {
  guildId: string;
  initial: ApiKeyRow[];
  baseUrl: string;
  t: ApiDict;
  kit: { copyField: CopyFieldCopy; dismiss: string };
}) {
  const router = useRouter();
  const ids = useId();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [revokeError, setRevokeError] = useState<string | null>(null);
  const confirmKey = initial.find((k) => k.id === confirmId) ?? null;
  const nameId = (k: ApiKeyRow) => `${ids}-key-${k.id}`;

  async function create(e: FormEvent) {
    e.preventDefault();
    if (busy || !name.trim()) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = (await res.json().catch(() => null)) as {
        secret?: string;
        error?: string;
      } | null;
      if (!res.ok || !data?.secret) throw new Error(data?.error ?? t.errCreate);
      setSecret(data.secret);
      setName("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errCreate);
    } finally {
      setBusy(false);
    }
  }

  async function revoke() {
    if (!confirmId) return;
    setRevokeError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/api-keys/${confirmId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(t.errAction);
      setConfirmId(null);
      router.refresh();
    } catch (err) {
      setRevokeError(err instanceof Error ? err.message : t.errAction);
    } finally {
      setBusy(false);
    }
  }

  const columns: DataColumn<ApiKeyRow>[] = [
    {
      id: "name",
      header: t.colName,
      sortValue: (k) => k.name.toLowerCase(),
      className: "min-w-[12rem]",
      cell: (k) => (
        <span id={nameId(k)} translate="no" className="font-semibold break-words">
          {k.name}
        </span>
      ),
    },
    {
      id: "created",
      header: t.colCreated,
      sortValue: (k) => day(k.createdAt),
      nowrap: true,
      className: "tabular-nums",
      cell: (k) => day(k.createdAt),
    },
    {
      id: "lastUsed",
      header: t.colLastUsed,
      sortValue: (k) => (k.lastUsedAt ? new Date(k.lastUsedAt).toISOString() : null),
      nowrap: true,
      className: "tabular-nums",
      cell: (k) =>
        k.lastUsedAt ? (
          day(k.lastUsedAt)
        ) : (
          <span className="text-muted-foreground">{t.neverUsed}</span>
        ),
    },
    {
      id: "actions",
      header: t.colActions,
      nowrap: true,
      cell: (k) => (
        <Button
          size="sm"
          variant="outline"
          className="text-danger"
          aria-describedby={nameId(k)}
          onClick={() => {
            setRevokeError(null);
            setConfirmId(k.id);
          }}
        >
          <Trash className="h-4 w-4" />
          {t.revoke}
        </Button>
      ),
    },
  ];

  return (
    <>
      {/* One-time secret reveal */}
      {secret && (
        <Notice
          tone="warning"
          role="status"
          title={t.secretTitle}
          action={
            <Button variant="outline" onClick={() => setSecret(null)}>
              {t.done}
            </Button>
          }
        >
          <div className="grid gap-3">
            <p>{t.secretBody}</p>
            <CopyField value={secret} copy={kit.copyField} />
          </div>
        </Notice>
      )}

      <section aria-labelledby={`${ids}-keys`} className="grid gap-4">
        <h2 id={`${ids}-keys`} className="font-display text-h3 font-[650]">
          {t.yourKeys}
        </h2>
        <form onSubmit={create} className="flex flex-wrap items-end gap-3">
          <FormField label={t.keyName} className="max-w-md min-w-0 flex-1 basis-64">
            {(field) => (
              <Input
                {...field}
                value={name}
                placeholder={t.keyNamePh}
                autoComplete="off"
                onChange={(e) => setName(e.target.value)}
              />
            )}
          </FormField>
          <Button type="submit" disabled={busy || !name.trim()} aria-busy={busy || undefined}>
            {busy ? <CircleNotch className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
            {busy ? t.creating : t.create}
          </Button>
        </form>
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
        <DataTable
          caption={t.yourKeys}
          captionHidden
          columns={columns}
          rows={initial}
          rowKey={(k) => k.id}
          empty={<EmptyState kind="first-use" title={t.empty} />}
        />
      </section>

      {/* Endpoint docs */}
      <SectionCard title={t.docsTitle} description={t.docsExample}>
        <pre
          tabIndex={0}
          role="region"
          aria-label={t.docsTitle}
          className="overflow-x-auto rounded-md border border-border bg-muted p-3 font-mono text-small"
        >
          {`curl -H "Authorization: Bearer YOUR_KEY" \\
  ${baseUrl}/api/v1/forms/FORM_ID/submissions`}
        </pre>
      </SectionCard>

      <ConfirmDialog
        open={confirmKey !== null}
        onClose={() => {
          if (busy) return;
          setRevokeError(null);
          setConfirmId(null);
        }}
        onConfirm={revoke}
        title={confirmKey ? fill(t.revokeNamed, { name: confirmKey.name }) : t.revoke}
        description={t.revokeConfirm}
        confirmLabel={t.revokeKey}
        cancelLabel={t.cancel}
        busy={busy}
        typeToConfirm={
          confirmKey ? { expected: confirmKey.name.trim(), label: t.typeName } : undefined
        }
        error={revokeError}
      />
    </>
  );
}
