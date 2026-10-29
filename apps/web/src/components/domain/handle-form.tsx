"use client";

import { useState } from "react";

import {
  CopyField,
  FormField,
  Notice,
  SectionCard,
  type CopyFieldCopy,
} from "@/components/dashboard-kit";
import { ArrowSquareOut } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/i18n";

type HubDict = Dictionary["domain"]["hub"];

/**
 * The guild's public hub link on the main domain (free on every plan): the
 * handle, the links to copy, and a way to open the hub.
 */
export function HandleForm({
  guildId,
  baseUrl,
  initialHandle,
  t,
  copy,
  dismissLabel,
}: {
  guildId: string;
  /** Primary app base URL, e.g. https://forms.msk-scripts.de */
  baseUrl: string;
  initialHandle: string;
  t: HubDict;
  copy: CopyFieldCopy;
  /** `kit.dismiss` of the dictionary. */
  dismissLabel: string;
}) {
  const [handle, setHandle] = useState(initialHandle);
  const [saved, setSaved] = useState<string | null>(initialHandle || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(value: string) {
    setSaving(true);
    setError(null);
    setDone(false);
    try {
      const res = await fetch(`/api/guilds/${guildId}/handle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: value }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? t.err);
      }
      const data = (await res.json()) as { handle: string | null };
      setHandle(data.handle ?? "");
      setSaved(data.handle);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.err);
    } finally {
      setSaving(false);
    }
  }

  const hubUrl = saved ? `${baseUrl}/${saved}` : null;
  const fallbackUrl = `${baseUrl}/g/${guildId}`;

  return (
    <SectionCard
      title={t.title}
      description={t.intro}
      actions={
        <Button asChild variant="outline">
          <a href={hubUrl ?? fallbackUrl} target="_blank" rel="noreferrer">
            <ArrowSquareOut className="h-4 w-4" />
            {t.open}
          </a>
        </Button>
      }
    >
      <div className="grid gap-5">
        <FormField label={t.label} hint={t.hint}>
          {(field) => (
            <div className="flex flex-wrap items-center gap-2">
              <span translate="no" className="font-mono break-all text-muted-foreground">
                {baseUrl}/
              </span>
              <Input
                {...field}
                value={handle}
                placeholder={t.placeholder}
                onChange={(e) => {
                  setHandle(e.target.value);
                  setDone(false);
                }}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                className="w-auto min-w-0 flex-1 basis-48 font-mono"
              />
            </div>
          )}
        </FormField>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => submit(handle)} disabled={saving} aria-busy={saving || undefined}>
            {saving ? t.saving : t.save}
          </Button>
          {saved && (
            <Button variant="outline" onClick={() => submit("")} disabled={saving}>
              {t.remove}
            </Button>
          )}
        </div>

        {error && <Notice tone="danger" role="alert" title={error} />}
        {done && !error && (
          <Notice
            tone="success"
            role="status"
            title={t.saved}
            onDismiss={() => setDone(false)}
            dismissLabel={dismissLabel}
          />
        )}

        <div className="grid gap-4 border-t border-border pt-5">
          {hubUrl && <CopyField label={t.urlLabel} value={hubUrl} copy={copy} />}
          <CopyField label={t.fallbackLabel} value={fallbackUrl} copy={copy} />
        </div>
      </div>
    </SectionCard>
  );
}
