"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type ReactNode } from "react";

import { ConfirmDialog } from "@/components/dashboard-kit";
import { CircleNotch, UploadSimple } from "@/components/icons";
import { Button } from "@/components/ui/button";

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

/** Toolbar action: import a JSON file as a brand new form, then open its editor. */
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

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
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
    <div className="grid gap-1.5">
      {/* The file picker is opened by the button; the input itself stays out of the tab order. */}
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        hidden
        tabIndex={-1}
        onChange={onFile}
      />
      <Button
        variant="outline"
        disabled={busy}
        aria-busy={busy || undefined}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? <CircleNotch className="h-4 w-4 animate-spin" /> : <UploadSimple className="h-4 w-4" />}
        {busy ? t.importing : t.import}
      </Button>
      <p role="alert" className="text-small font-semibold text-danger empty:hidden">
        {error ?? ""}
      </p>
    </div>
  );
}

/**
 * Overwriting a form's content from a JSON file (the slug stays): `pick`
 * opens the file picker for one form, then a dialog asks before the content
 * is replaced. Render `node` once, next to the list that calls `pick`.
 */
export function useReplaceFromJson(
  guildId: string,
  t: { replace: string; replaceTitle: string; replaceConfirm: string; cancel: string; importErr: string },
): { pick: (formId: string) => void; node: ReactNode } {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [formId, setFormId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (f) {
      setError(null);
      setFile(f);
    }
  }

  async function onConfirm() {
    if (!file || !formId) return;
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

  return {
    pick(id: string) {
      setFormId(id);
      inputRef.current?.click();
    },
    node: (
      <>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          hidden
          tabIndex={-1}
          onChange={onFile}
        />
        <ConfirmDialog
          open={!!file}
          onClose={() => {
            if (!busy) setFile(null);
          }}
          onConfirm={onConfirm}
          title={t.replaceTitle}
          description={t.replaceConfirm}
          confirmLabel={t.replace}
          cancelLabel={t.cancel}
          tone="danger"
          busy={busy}
          error={error}
        />
      </>
    ),
  };
}
