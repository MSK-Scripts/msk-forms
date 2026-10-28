"use client";

import type { StatusDefInput } from "@msk-forms/shared";
import { SubmissionStatusBadge } from "@msk-forms/ui";
import { useEffect, useRef, useState } from "react";

import { Checkbox, ColorField, EmptyState, FormField, FormSection, HEX_COLOR } from "@/components/dashboard-kit";
import { Plus, Trash } from "@/components/icons";
import { SettingsSaveBar, type SaveResult, type SettingsSaveCopy } from "@/components/settings/settings-save-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/i18n";
import { dotColors } from "@/lib/color-dot";

type StatusesDict = Dictionary["dashboard"]["statuses"];

/** Colour of a new status: the grey of the built-in Submitted. Stored as is. */
const NEW_STATUS_COLOR = "#6b6b72";

/** A row of the form: what is saved, plus a key that survives removing rows. */
type Row = StatusDefInput & { uid: string };

const slugifyKey = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 32);

/** What is sent and compared: the saved fields in their stored order. */
const payloadOf = (rows: Row[]): StatusDefInput[] =>
  rows.map((r) => ({
    key: r.key,
    label: r.label,
    color: r.color,
    isTerminal: r.isTerminal,
    visibleToApplicant: r.visibleToApplicant,
  }));

/**
 * The guild's own statuses, edited in place. Each row is a group named by a
 * preview of the status as reviewers see it (dot and word); the kit SaveBar
 * saves the whole list and Discard restores the last saved one. Removing a
 * row moves the focus to the row that takes its place and says so.
 */
export function StatusDefsForm({
  guildId,
  initial,
  t,
  kit,
}: {
  guildId: string;
  initial: StatusDefInput[];
  t: StatusesDict;
  kit: SettingsSaveCopy;
}) {
  const [rows, setRows] = useState<Row[]>(() => initial.map((r, i) => ({ ...r, uid: `saved-${i}` })));
  const [saved, setSaved] = useState<Row[]>(rows);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SaveResult>(null);
  const [announcement, setAnnouncement] = useState("");

  const seq = useRef(0);
  const labelInputs = useRef(new Map<string, HTMLInputElement>());
  const removeButtons = useRef(new Map<string, HTMLButtonElement>());
  const addButton = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<(() => void) | null>(null);

  // Focus moves after the list has re-rendered (a new row, a removed one).
  useEffect(() => {
    pendingFocus.current?.();
    pendingFocus.current = null;
  }, [rows]);

  const dirty = JSON.stringify(payloadOf(rows)) !== JSON.stringify(payloadOf(saved));
  const nameOf = (row: Row) => row.label.trim() || t.newStatus;

  function edit(next: Row[]) {
    setRows(next);
    setResult(null);
  }
  function patch(i: number, partial: Partial<StatusDefInput>) {
    edit(rows.map((r, j) => (j === i ? { ...r, ...partial } : r)));
  }
  function add() {
    seq.current += 1;
    const uid = `new-${seq.current}`;
    pendingFocus.current = () => labelInputs.current.get(uid)?.focus();
    edit([...rows, { uid, key: "", label: "", color: NEW_STATUS_COLOR, isTerminal: false, visibleToApplicant: true }]);
  }
  function remove(i: number) {
    const target = rows[i + 1]?.uid ?? rows[i - 1]?.uid;
    pendingFocus.current = () => (target ? removeButtons.current.get(target) : addButton.current)?.focus();
    setAnnouncement(t.removed.replace("{name}", nameOf(rows[i]!)));
    edit(rows.filter((_, j) => j !== i));
  }

  async function save() {
    setResult(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/statuses`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statuses: payloadOf(rows) }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? t.errSave);
      }
      setSaved(rows);
      setResult({ tone: "success", message: t.saved });
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
            <ul className="grid divide-y divide-border">
              {rows.map((row, i) => (
                <li key={row.uid} className="py-5 first:pt-0">
                  <fieldset className="min-w-0">
                    <legend className="mb-4">
                      <SubmissionStatusBadge
                        label={nameOf(row)}
                        {...dotColors(HEX_COLOR.test(row.color.trim()) ? row.color.trim() : NEW_STATUS_COLOR)}
                      />
                    </legend>
                    <div className="@container grid gap-4">
                      <div className="grid gap-4 @xl:grid-cols-2">
                        <FormField label={t.label}>
                          {(field) => (
                            <Input
                              {...field}
                              ref={(el) => {
                                if (el) labelInputs.current.set(row.uid, el);
                                else labelInputs.current.delete(row.uid);
                              }}
                              value={row.label}
                              onChange={(e) => {
                                const label = e.target.value;
                                // Derive the key from the label until the key is edited by hand.
                                patch(
                                  i,
                                  row.key === "" || row.key === slugifyKey(row.label)
                                    ? { label, key: slugifyKey(label) }
                                    : { label },
                                );
                              }}
                            />
                          )}
                        </FormField>
                        <FormField label={t.key}>
                          {(field) => (
                            <Input
                              {...field}
                              value={row.key}
                              onChange={(e) => patch(i, { key: slugifyKey(e.target.value) })}
                              spellCheck={false}
                              autoComplete="off"
                              autoCapitalize="off"
                              className="font-mono"
                            />
                          )}
                        </FormField>
                      </div>
                      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
                        <ColorField
                          label={t.color}
                          pickerLabel={t.colorPicker}
                          invalidText={t.hexError}
                          value={row.color}
                          onChange={(color) => patch(i, { color })}
                          fallback={NEW_STATUS_COLOR}
                        />
                        <div className="flex flex-wrap gap-x-6">
                          <Checkbox
                            label={t.terminal}
                            checked={row.isTerminal}
                            onChange={(isTerminal) => patch(i, { isTerminal })}
                          />
                          <Checkbox
                            label={t.visible}
                            checked={row.visibleToApplicant}
                            onChange={(visibleToApplicant) => patch(i, { visibleToApplicant })}
                          />
                        </div>
                        <Button
                          ref={(el) => {
                            if (el) removeButtons.current.set(row.uid, el);
                            else removeButtons.current.delete(row.uid);
                          }}
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(i)}
                          aria-label={t.removeNamed.replace("{name}", nameOf(row))}
                          className="ms-auto h-11 w-11"
                        >
                          <Trash className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </fieldset>
                </li>
              ))}
            </ul>
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
