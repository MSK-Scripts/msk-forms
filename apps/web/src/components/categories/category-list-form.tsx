"use client";

import type { CategoryInput } from "@msk-forms/shared";
import { Button, Card, Input } from "@msk-forms/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Dictionary } from "@/i18n";

type CategoriesDict = Dictionary["dashboard"]["categories"];

const DEFAULT_COLOR = "#4ea426";

type Row = { id?: string; name: string; color: string };

export function CategoryListForm({
  guildId,
  initial,
  t,
}: {
  guildId: string;
  initial: CategoryInput[];
  t: CategoriesDict;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(
    initial.map((c) => ({ id: c.id, name: c.name, color: c.color ?? DEFAULT_COLOR })),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch(i: number, partial: Partial<Row>) {
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...partial } : r)));
    setSaved(false);
  }
  function add() {
    setRows((prev) => [...prev, { name: "", color: DEFAULT_COLOR }]);
    setSaved(false);
  }
  function remove(i: number) {
    setRows((prev) => prev.filter((_, j) => j !== i));
    setSaved(false);
  }
  function move(i: number, dir: -1 | 1) {
    setRows((prev) => {
      const target = i + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[target]] = [next[target]!, next[i]!];
      return next;
    });
    setSaved(false);
  }

  async function save() {
    setError(null);
    setSaving(true);
    try {
      const payload = rows.map((r, i) => ({
        id: r.id,
        name: r.name.trim(),
        color: r.color,
        order: i,
      }));
      const res = await fetch(`/api/guilds/${guildId}/categories`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? t.errSave);
      }
      const data = (await res.json()) as { categories: CategoryInput[] };
      setRows(data.categories.map((c) => ({ id: c.id, name: c.name, color: c.color ?? DEFAULT_COLOR })));
      setSaved(true);
      router.refresh();
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
            <input
              type="color"
              value={row.color}
              aria-label={t.color}
              onChange={(e) => patch(i, { color: e.target.value })}
              className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-border bg-transparent"
            />
            <Input
              value={row.name}
              placeholder={t.namePh}
              onChange={(e) => patch(i, { name: e.target.value })}
              className="min-w-40 flex-1"
            />
            <button
              type="button"
              aria-label={t.moveUp}
              disabled={i === 0}
              onClick={() => move(i, -1)}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              aria-label={t.moveDown}
              disabled={i === rows.length - 1}
              onClick={() => move(i, 1)}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
            >
              ↓
            </button>
            <button
              type="button"
              aria-label={t.remove}
              onClick={() => remove(i)}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
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
