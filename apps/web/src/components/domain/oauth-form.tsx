"use client";

import { useState } from "react";

import { CopyField, FormField, Notice, SectionCard, StatusBadge, type CopyFieldCopy } from "@/components/dashboard-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/i18n";

type OAuthDict = Dictionary["domain"]["oauth"];

export function OAuthForm({
  guildId,
  customDomain,
  initial,
  t,
  copy,
}: {
  guildId: string;
  /** The verified custom domain, or "" when none is verified yet. */
  customDomain: string;
  initial: { clientId: string; hasSecret: boolean };
  t: OAuthDict;
  copy: CopyFieldCopy;
}) {
  const [clientId, setClientId] = useState(initial.clientId);
  const [clientSecret, setClientSecret] = useState("");
  const [hasSecret, setHasSecret] = useState(initial.hasSecret);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const redirectUri = customDomain ? `https://${customDomain}/api/auth/discord/callback` : "";
  // Reflect the live state, not the initial server snapshot, so the "Active"
  // badge and Remove button appear immediately after the first save.
  const configured = Boolean(clientId.trim()) && hasSecret;

  async function save() {
    setError(null);
    setSaved(false);
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

  return (
    <SectionCard
      title={t.title}
      description={t.intro}
      actions={configured ? <StatusBadge tone="success">{t.active}</StatusBadge> : undefined}
    >
      {!customDomain ? (
        <Notice tone="info">{t.needDomain}</Notice>
      ) : (
        <div className="grid gap-5">
          <ol className="grid max-w-[65ch] list-decimal gap-2 ps-5">
            <li>{t.step1}</li>
            <li>{t.step2}</li>
            <li>{t.step3}</li>
          </ol>

          <CopyField label={t.redirectLabel} value={redirectUri} copy={copy} />

          <FormField label={t.clientId}>
            {(field) => (
              <Input
                {...field}
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  setSaved(false);
                }}
                placeholder="123456789012345678"
                inputMode="numeric"
                autoComplete="off"
                spellCheck={false}
                className="max-w-md font-mono"
              />
            )}
          </FormField>

          <FormField label={t.clientSecretLabel}>
            {(field) => (
              <Input
                {...field}
                type="password"
                value={clientSecret}
                onChange={(e) => {
                  setClientSecret(e.target.value);
                  setSaved(false);
                }}
                placeholder={hasSecret ? t.secretPlaceholderSet : t.secretPlaceholderNew}
                autoComplete="off"
                className="max-w-xl font-mono"
              />
            )}
          </FormField>

          {error && <Notice tone="danger" role="alert" title={error} />}
          {saved && !error && (
            <Notice tone="success" role="status">
              {t.saved}
            </Notice>
          )}

          <div className="flex flex-wrap gap-3">
            <Button onClick={save} disabled={saving || !clientId.trim()} aria-busy={saving || undefined}>
              {saving ? t.saving : t.save}
            </Button>
            {configured && (
              <Button variant="outline" onClick={remove} disabled={removing} aria-busy={removing || undefined}>
                {removing ? t.removing : t.remove}
              </Button>
            )}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
