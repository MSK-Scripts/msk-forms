"use client";

import type { StatusDefInput } from "@msk-forms/shared";
import { Button, Card, Checkbox, Input } from "@msk-forms/ui";
import { useState } from "react";

import type { Dictionary } from "@/i18n";

type StatusesDict = Dictionary["dashboard"]["statuses"];

const slugifyKey = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 32);

export function StatusDefsForm({
  guildId,
  initial,
  t,
}: {
  guildId: string;
  initial: StatusDefInput[];
  t: StatusesDict;
}) {
  const [rows, setRows] = useState<StatusDefInput[]>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch(i: number, partial: Partial<StatusDefInput>) {
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...partial } : r)));
    setSaved(false);
  }
  function add() {
    setRows((prev) => [
      ...prev,
      { key: "", label: "", color: "#6b6b72", isTerminal: false, visibleToApplicant: true },
    ]);
    setSaved(false);
  }
  function remove(i: number) {
    setRows((prev) => prev.filter((_, j) => j !== i));
    setSaved(false);
  }

  async function save() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/statuses`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statuses: rows }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? t.errSave);
      }
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errSave);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      {rows.length === 0 && <p className="text-sm text-muted-foreground">{t.empty}</p>}

      <div className="flex flex-col gap-3">
        {rows.map((row, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2 rounded-md border border-border p-2">
            <Input
              value={row.label}
              placeholder={t.label}
              onChange={(e) => {
                const label = e.target.value;
                // Auto-derive the key from the label until the user edits it.
                patch(i, row.key === "" || row.key === slugifyKey(row.label) ? { label, key: slugifyKey(label) } : { label });
              }}
              className="min-w-40 flex-1"
            />
            <Input
              value={row.key}
              placeholder={t.key}
              onChange={(e) => patch(i, { key: slugifyKey(e.target.value) })}
              className="w-32 font-mono text-xs"
            />
            <input
              type="color"
              value={row.color}
              aria-label={t.color}
              onChange={(e) => patch(i, { color: e.target.value })}
              className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-border bg-transparent"
            />
            <Checkbox
              label={t.terminal}
              checked={row.isTerminal}
              onChange={(e) => patch(i, { isTerminal: e.target.checked })}
            />
            <Checkbox
              label={t.visible}
              checked={row.visibleToApplicant}
              onChange={(e) => patch(i, { visibleToApplicant: e.target.checked })}
            />
            <button
              type="button"
              aria-label={t.remove}
              onClick={() => remove(i)}
              className="ml-auto text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="self-start text-sm font-medium text-primary hover:underline"
      >
        + {t.add}
      </button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? t.saving : t.save}
        </Button>
        {saved && <span className="text-sm text-primary">{t.saved}</span>}
      </div>
    </Card>
  );
}
