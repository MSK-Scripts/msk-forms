"use client";

import { Button, Card, Field, Input } from "@msk-forms/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Dictionary } from "@/i18n";

export interface ApiKeyRow {
  id: string;
  name: string;
  lastUsedAt: Date | null;
  createdAt: Date;
}

type ApiDict = Dictionary["api"];

const day = (d: Date | string) => new Date(d).toISOString().slice(0, 10);

export function ApiKeysManager({
  guildId,
  initial,
  baseUrl,
  t,
}: {
  guildId: string;
  initial: ApiKeyRow[];
  baseUrl: string;
  t: ApiDict;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function create() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = (await res.json().catch(() => null)) as { secret?: string; error?: string } | null;
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
    setBusy(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/api-keys/${confirmId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(t.errAction);
      setConfirmId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errAction);
    } finally {
      setBusy(false);
    }
  }

  async function copySecret() {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* One-time secret reveal */}
      {secret && (
        <Card className="flex flex-col gap-2 border-primary/40 bg-primary/5 p-5">
          <h3 className="font-heading text-sm font-semibold text-foreground">{t.secretTitle}</h3>
          <p className="text-xs text-muted-foreground">{t.secretBody}</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all rounded-md border border-border bg-background px-3 py-2 font-mono text-xs">
              {secret}
            </code>
            <Button type="button" variant="ghost" onClick={copySecret}>
              {copied ? t.copied : t.copy}
            </Button>
          </div>
          <div>
            <Button type="button" onClick={() => setSecret(null)}>
              {t.done}
            </Button>
          </div>
        </Card>
      )}

      <Card className="flex flex-col gap-4 p-5">
        <Field label={t.create}>
          <div className="flex gap-2">
            <Input value={name} placeholder={t.namePh} onChange={(e) => setName(e.target.value)} />
            <Button type="button" onClick={create} disabled={busy || !name.trim()}>
              {busy ? t.creating : t.create}
            </Button>
          </div>
        </Field>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </Card>

      <Card className="flex flex-col gap-3 p-5">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t.yourKeys}
        </h3>
        {initial.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.empty}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {initial.map((k) => (
              <li key={k.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-foreground">{k.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {t.created} {day(k.createdAt)} · {t.lastUsed}{" "}
                    {k.lastUsedAt ? day(k.lastUsedAt) : t.never}
                  </span>
                </div>
                <Button type="button" variant="ghost" onClick={() => setConfirmId(k.id)}>
                  {t.revoke}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Endpoint docs */}
      <Card className="flex flex-col gap-2 p-5">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t.docsTitle}
        </h3>
        <p className="text-sm text-muted-foreground">{t.docsExample}</p>
        <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-3 font-mono text-xs">
          {`curl -H "Authorization: Bearer YOUR_KEY" \\
  ${baseUrl}/api/v1/forms/FORM_ID/submissions`}
        </pre>
      </Card>

      <ConfirmDialog
        open={confirmId !== null}
        title={t.revoke}
        message={t.revokeConfirm}
        confirmLabel={t.revoke}
        cancelLabel={t.cancel}
        busy={busy}
        onConfirm={revoke}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
