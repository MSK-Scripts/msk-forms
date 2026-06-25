"use client";

import { Button, Card, Field, Input } from "@msk-forms/ui";
import { useState } from "react";

import type { Dictionary } from "@/i18n";

type OAuthDict = Dictionary["domain"]["oauth"];

export function OAuthForm({
  guildId,
  customDomain,
  initial,
  t,
}: {
  guildId: string;
  /** The verified custom domain, or "" when none is verified yet. */
  customDomain: string;
  initial: { clientId: string; hasSecret: boolean };
  t: OAuthDict;
}) {
  const [clientId, setClientId] = useState(initial.clientId);
  const [clientSecret, setClientSecret] = useState("");
  const [hasSecret, setHasSecret] = useState(initial.hasSecret);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const redirectUri = customDomain ? `https://${customDomain}/api/auth/discord/callback` : "";
  const configured = Boolean(initial.clientId) && initial.hasSecret;

  async function save() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/oauth`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: clientId.trim(), clientSecret: clientSecret.trim() }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(data?.error ?? t.errSave);
      setHasSecret(true);
      setClientSecret("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errSave);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setError(null);
    setRemoving(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/oauth`, { method: "DELETE" });
      if (!res.ok) throw new Error(t.errAction);
      setClientId("");
      setClientSecret("");
      setHasSecret(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errAction);
    } finally {
      setRemoving(false);
    }
  }

  async function copyRedirect() {
    try {
      await navigator.clipboard.writeText(redirectUri);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-heading text-lg font-semibold text-foreground">{t.title}</h3>
        {configured && (
          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {t.active}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{t.intro}</p>

      {!customDomain ? (
        <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          {t.needDomain}
        </p>
      ) : (
        <>
          <ol className="ms-4 flex list-decimal flex-col gap-1 text-sm text-muted-foreground">
            <li>{t.step1}</li>
            <li>{t.step2}</li>
            <li>{t.step3}</li>
          </ol>

          <Field label={t.redirectLabel}>
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all rounded-md bg-muted px-2 py-1.5 font-mono text-xs text-foreground">
                {redirectUri}
              </code>
              <button
                type="button"
                onClick={copyRedirect}
                className="shrink-0 text-sm font-medium text-primary hover:underline"
              >
                {copied ? t.copied : t.copy}
              </button>
            </div>
          </Field>

          <Field label={t.clientId}>
            <Input
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="123456789012345678"
              inputMode="numeric"
            />
          </Field>

          <Field label={t.clientSecretLabel}>
            <Input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder={hasSecret ? t.secretPlaceholderSet : t.secretPlaceholderNew}
              autoComplete="off"
            />
          </Field>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center gap-2">
            <Button type="button" onClick={save} disabled={saving || !clientId.trim()}>
              {saving ? t.saving : t.save}
            </Button>
            {configured && (
              <Button type="button" variant="ghost" onClick={remove} disabled={removing}>
                {removing ? t.removing : t.remove}
              </Button>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
