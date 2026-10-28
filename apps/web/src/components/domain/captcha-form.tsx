"use client";

import { useState } from "react";

import { CopyField, FormField, Notice, SectionCard, StatusBadge, type CopyFieldCopy } from "@/components/dashboard-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/i18n";

type CaptchaDict = Dictionary["domain"]["captcha"];

export function CaptchaForm({
  guildId,
  customDomain,
  initial,
  t,
  copy,
}: {
  guildId: string;
  /** The verified custom domain, or "" when none is verified yet. */
  customDomain: string;
  initial: { siteKey: string; hasSecret: boolean };
  t: CaptchaDict;
  copy: CopyFieldCopy;
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
            <li>
              {t.step2}
              <CopyField value={customDomain} copy={copy} className="mt-2" />
            </li>
            <li>{t.step3}</li>
          </ol>

          <FormField label={t.siteKey}>
            {(field) => (
              <Input
                {...field}
                value={siteKey}
                onChange={(e) => {
                  setSiteKey(e.target.value);
                  setSaved(false);
                }}
                placeholder="0x4AAAAAAA…"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                className="max-w-xl font-mono"
              />
            )}
          </FormField>

          <FormField label={t.secretLabel}>
            {(field) => (
              <Input
                {...field}
                type="password"
                value={secret}
                onChange={(e) => {
                  setSecret(e.target.value);
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
            <Button onClick={save} disabled={saving || !siteKey.trim()} aria-busy={saving || undefined}>
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
