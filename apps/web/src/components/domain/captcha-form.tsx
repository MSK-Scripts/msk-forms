"use client";

import { Button, Card, Field, Input } from "@msk-forms/ui";
import { useState } from "react";

import type { Dictionary } from "@/i18n";

type CaptchaDict = Dictionary["domain"]["captcha"];

export function CaptchaForm({
  guildId,
  customDomain,
  initial,
  t,
}: {
  guildId: string;
  /** The verified custom domain, or "" when none is verified yet. */
  customDomain: string;
  initial: { siteKey: string; hasSecret: boolean };
  t: CaptchaDict;
}) {
  const [siteKey, setSiteKey] = useState(initial.siteKey);
  const [secret, setSecret] = useState("");
  const [hasSecret, setHasSecret] = useState(initial.hasSecret);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Reflect the live state, not the initial server snapshot, so the "Active"
  // badge and Remove button appear immediately after the first save.
  const configured = Boolean(siteKey.trim()) && hasSecret;

  async function save() {
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/captcha`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteKey: siteKey.trim(), secret: secret.trim() }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) throw new Error(data?.error ?? t.errSave);
      setHasSecret(true);
      setSecret("");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errSave);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setError(null);
    setSaved(false);
    setRemoving(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/captcha`, { method: "DELETE" });
      if (!res.ok) throw new Error(t.errAction);
      setSiteKey("");
      setSecret("");
      setHasSecret(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errAction);
    } finally {
      setRemoving(false);
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
            <li>
              {t.step2} <span className="font-mono text-foreground">{customDomain}</span>
            </li>
            <li>{t.step3}</li>
          </ol>

          <Field label={t.siteKey}>
            <Input
              value={siteKey}
              onChange={(e) => setSiteKey(e.target.value)}
              placeholder="0x4AAAAAAA…"
            />
          </Field>

          <Field label={t.secretLabel}>
            <Input
              type="password"
              value={secret}
              onChange={(e) => {
                setSecret(e.target.value);
                setSaved(false);
              }}
              placeholder={hasSecret ? t.secretPlaceholderSet : t.secretPlaceholderNew}
              autoComplete="off"
            />
          </Field>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {saved && !error && (
            <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
              {t.saved}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Button type="button" onClick={save} disabled={saving || !siteKey.trim()}>
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
