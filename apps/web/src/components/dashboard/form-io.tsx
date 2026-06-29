"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";

/** Read a JSON file and POST it to the import endpoint. */
async function importDefinition(
  guildId: string,
  file: File,
  body: { mode: "create" | "replace"; formId?: string },
): Promise<{ id: string; slug?: string }> {
  const definition = JSON.parse(await file.text()) as unknown;
  const res = await fetch(`/api/guilds/${guildId}/forms/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, definition }),
  });
  if (!res.ok) throw new Error("import failed");
  return (await res.json()) as { id: string; slug?: string };
}

/** Header action: import a JSON file as a brand new form, then open its editor. */
export function ImportFormButton({
  guildId,
  t,
}: {
  guildId: string;
  t: { import: string; importing: string; importErr: string };
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const res = await importDefinition(guildId, file, { mode: "create" });
      router.push(`/dashboard/${guildId}/forms/${res.id}/edit` as Route);
    } catch {
      setError(t.importErr);
      setBusy(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={onFile}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
      >
        {busy ? t.importing : t.import}
      </button>
      {error && <span className="text-sm text-destructive">{error}</span>}
    </>
  );
}

/** Per-form action: overwrite a form's content from a JSON file (slug kept). */
export function ReplaceFormButton({
  guildId,
  formId,
  t,
}: {
  guildId: string;
  formId: string;
  t: { replace: string; replaceTitle: string; replaceConfirm: string; cancel: string; importErr: string };
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) {
      setError(null);
      setFile(f);
    }
  }

  async function onConfirm() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      await importDefinition(guildId, file, { mode: "replace", formId });
      setFile(null);
      setBusy(false);
      router.refresh();
    } catch {
      setError(t.importErr);
      setBusy(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={onFile}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      >
        {t.replace}
      </button>
      <ConfirmDialog
        open={!!file}
        title={t.replaceTitle}
        message={t.replaceConfirm}
        confirmLabel={t.replace}
        cancelLabel={t.cancel}
        busy={busy}
        error={error}
        onConfirm={onConfirm}
        onCancel={() => {
          if (!busy) setFile(null);
        }}
      />
    </>
  );
}
