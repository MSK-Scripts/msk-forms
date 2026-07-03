"use client";

import { Button, Card, Field, Input } from "@msk-forms/ui";
import { useState } from "react";

import type { Dictionary } from "@/i18n";

type HubDict = Dictionary["domain"]["hub"];

export function HandleForm({
  guildId,
  baseUrl,
  initialHandle,
  t,
}: {
  guildId: string;
  /** Primary app base URL, e.g. https://forms.msk-scripts.de */
  baseUrl: string;
  initialHandle: string;
  t: HubDict;
}) {
  const [handle, setHandle] = useState(initialHandle);
  const [saved, setSaved] = useState<string | null>(initialHandle || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(value: string) {
    setSaving(true);
    setError(null);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : t.err);
    } finally {
      setSaving(false);
    }
  }

  const hubUrl = saved ? `${baseUrl}/${saved}` : null;
  const fallbackUrl = `${baseUrl}/g/${guildId}`;

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-base font-semibold text-foreground">{t.title}</h3>
        <p className="text-sm text-muted-foreground">{t.intro}</p>
      </div>

      <Field label={t.label} hint={t.hint}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">{baseUrl}/</span>
          <Input
            value={handle}
            placeholder={t.placeholder}
            onChange={(e) => setHandle(e.target.value)}
            className="w-48"
          />
          <Button type="button" onClick={() => submit(handle)} disabled={saving}>
            {saving ? t.saving : t.save}
          </Button>
          {saved && (
            <button
              type="button"
              onClick={() => submit("")}
              disabled={saving}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-destructive"
            >
              {t.remove}
            </button>
          )}
        </div>
      </Field>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {hubUrl && (
        <p className="text-sm text-muted-foreground">
          {t.urlLabel}{" "}
          <a href={hubUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
            {hubUrl}
          </a>
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        {t.fallbackLabel}{" "}
        <a href={fallbackUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
          {fallbackUrl}
        </a>
      </p>
    </Card>
  );
}
