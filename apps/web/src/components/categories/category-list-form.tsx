"use client";

import type { CategoryInput } from "@msk-forms/shared";
import { ColorDot } from "@msk-forms/ui";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { EmptyState, FormField, FormSection } from "@/components/dashboard-kit";
import { ArrowDown, ArrowUp, Plus, Trash } from "@/components/icons";
import { ColorField, HEX_COLOR } from "@/components/settings/color-field";
import { SettingsSaveBar, type SaveResult, type SettingsSaveCopy } from "@/components/settings/settings-save-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dotColors } from "@/lib/color-dot";
import type { Dictionary } from "@/i18n";

type CategoriesDict = Dictionary["dashboard"]["categories"];

/**
 * Colour of a new category, and of one stored without a colour once the list
 * is saved again. It is written to the database, so it stays this value; it
 * is the customer's colour on the public hub, not the dashboard's green.
 */
const DEFAULT_COLOR = "#4ea426";

type Row = { uid: string; id?: string; name: string; color: string };
type Move = "up" | "down";

const rowsFrom = (categories: CategoryInput[]): Row[] =>
  categories.map((c, i) => ({ uid: c.id ?? `saved-${i}`, id: c.id, name: c.name, color: c.color ?? DEFAULT_COLOR }));

/** What is compared to the last save: everything the payload is made of. */
const contentOf = (rows: Row[]) => JSON.stringify(rows.map((r) => [r.id ?? null, r.name, r.color]));

/**
 * The guild's form categories, edited in place. Each row is a group named by
 * the category's dot and name. Move up and down are buttons named after the
 * category; after a move the focus stays on the moved row and the new
 * position is announced. The kit SaveBar saves the list in its order.
 */
export function CategoryListForm({
  guildId,
  initial,
  t,
  kit,
}: {
  guildId: string;
  initial: CategoryInput[];
  t: CategoriesDict;
  kit: SettingsSaveCopy;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(() => rowsFrom(initial));
  const [saved, setSaved] = useState<Row[]>(rows);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SaveResult>(null);
  const [announcement, setAnnouncement] = useState("");

  const seq = useRef(0);
  const nameInputs = useRef(new Map<string, HTMLInputElement>());
  const rowButtons = useRef(new Map<string, HTMLButtonElement>());
  const addButton = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<(() => void) | null>(null);

  // Focus moves after the list has re-rendered (a move, a new row, a removed one).
  useEffect(() => {
    pendingFocus.current?.();
    pendingFocus.current = null;
  }, [rows]);

  const dirty = contentOf(rows) !== contentOf(saved);
  const nameOf = (row: Row) => row.name.trim() || t.newCategory;
  const buttonRef = (uid: string, kind: Move | "remove") => (el: HTMLButtonElement | null) => {
    if (el) rowButtons.current.set(`${uid}:${kind}`, el);
    else rowButtons.current.delete(`${uid}:${kind}`);
  };

  function edit(next: Row[]) {
    setRows(next);
    setResult(null);
  }
  function patch(i: number, partial: Partial<Row>) {
    edit(rows.map((r, j) => (j === i ? { ...r, ...partial } : r)));
  }
  function add() {
    seq.current += 1;
    const uid = `new-${seq.current}`;
    pendingFocus.current = () => nameInputs.current.get(uid)?.focus();
    edit([...rows, { uid, name: "", color: DEFAULT_COLOR }]);
  }
  function remove(i: number) {
    const target = rows[i + 1]?.uid ?? rows[i - 1]?.uid;
    pendingFocus.current = () =>
      (target ? rowButtons.current.get(`${target}:remove`) : addButton.current)?.focus();
    setAnnouncement(t.removed.replace("{name}", nameOf(rows[i]!)));
    edit(rows.filter((_, j) => j !== i));
  }
  function move(i: number, dir: Move) {
    const target = dir === "up" ? i - 1 : i + 1;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[i], next[target]] = [next[target]!, next[i]!];
    const row = rows[i]!;
    // The pressed button is disabled once the row reaches an end; the other one takes the focus then.
    const atEnd = dir === "up" ? target === 0 : target === rows.length - 1;
    const focusKind: Move = atEnd ? (dir === "up" ? "down" : "up") : dir;
    pendingFocus.current = () => rowButtons.current.get(`${row.uid}:${focusKind}`)?.focus();
    setAnnouncement(
      t.moved
        .replace("{name}", nameOf(row))
        .replace("{position}", String(target + 1))
        .replace("{total}", String(rows.length)),
    );
    edit(next);
  }

  async function save() {
    setResult(null);
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
      const next = rowsFrom(data.categories);
      setRows(next);
      setSaved(next);
      setResult({ tone: "success", message: t.saved });
      router.refresh();
    } catch (err) {
      setResult({ tone: "danger", message: err instanceof Error ? err.message : t.errSave });
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    setRows(saved);
    setResult(null);
  }

  const addAction = (
    <Button ref={addButton} variant="outline" onClick={add} className="justify-self-start">
      <Plus className="h-4 w-4" />
      {t.add}
    </Button>
  );

  return (
    <>
      <FormSection title={t.title} description={t.listHint}>
        {rows.length === 0 ? (
          <EmptyState kind="first-use" title={t.empty} action={addAction} className="py-6" />
        ) : (
          <>
            <ol className="grid divide-y divide-border">
              {rows.map((row, i) => {
                const name = nameOf(row);
                const swatch = HEX_COLOR.test(row.color.trim()) ? row.color.trim() : DEFAULT_COLOR;
                return (
                  <li key={row.uid} className="py-5 first:pt-0">
                    <fieldset className="min-w-0">
                      <legend className="mb-3 flex items-center gap-2 font-semibold">
                        <ColorDot {...dotColors(swatch)} size="md" />
                        <span translate="no" className="break-words">
                          {name}
                        </span>
                      </legend>
                      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
                        <FormField label={t.namePh} className="min-w-0 flex-1 basis-60">
                          {(field) => (
                            <Input
                              {...field}
                              ref={(el) => {
                                if (el) nameInputs.current.set(row.uid, el);
                                else nameInputs.current.delete(row.uid);
                              }}
                              value={row.name}
                              onChange={(e) => patch(i, { name: e.target.value })}
                            />
                          )}
                        </FormField>
                        <ColorField
                          label={t.color}
                          pickerLabel={t.colorPicker}
                          invalidText={t.hexError}
                          value={row.color}
                          onChange={(color) => patch(i, { color })}
                          fallback={DEFAULT_COLOR}
                        />
                        <div className="ms-auto flex gap-1">
                          <Button
                            ref={buttonRef(row.uid, "up")}
                            variant="ghost"
                            size="icon"
                            disabled={i === 0}
                            onClick={() => move(i, "up")}
                            aria-label={t.moveUpNamed.replace("{name}", name)}
                            className="h-11 w-11"
                          >
                            <ArrowUp className="h-5 w-5" />
                          </Button>
                          <Button
                            ref={buttonRef(row.uid, "down")}
                            variant="ghost"
                            size="icon"
                            disabled={i === rows.length - 1}
                            onClick={() => move(i, "down")}
                            aria-label={t.moveDownNamed.replace("{name}", name)}
                            className="h-11 w-11"
                          >
                            <ArrowDown className="h-5 w-5" />
                          </Button>
                          <Button
                            ref={buttonRef(row.uid, "remove")}
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(i)}
                            aria-label={t.removeNamed.replace("{name}", name)}
                            className="h-11 w-11"
                          >
                            <Trash className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </fieldset>
                  </li>
                );
              })}
            </ol>
            {addAction}
          </>
        )}
        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </FormSection>

      <SettingsSaveBar
        dirty={dirty}
        busy={saving}
        result={result}
        onSave={save}
        onDiscard={discard}
        onDismissResult={() => setResult(null)}
        copy={kit}
      />
    </>
  );
}
