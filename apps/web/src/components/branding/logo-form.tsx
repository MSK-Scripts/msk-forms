"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { FormField, FormSection, Notice } from "@/components/dashboard-kit";
import { Trash } from "@/components/icons";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n";

type BrandingDict = Dictionary["branding"];

/** The native file input, its button drawn like an outline button. */
const FILE_INPUT = [
  "block w-full max-w-md cursor-pointer text-muted-foreground",
  "file:me-3 file:min-h-11 file:cursor-pointer file:rounded-md file:border-[1.5px] file:border-solid file:border-input",
  "file:bg-transparent file:px-4 file:py-2 file:font-semibold file:text-foreground",
  "file:transition-colors file:duration-150 hover:file:border-foreground",
  "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

/**
 * The guild's logo. Uploading or removing takes effect at once, so this
 * section is not part of the page's SaveBar.
 */
export function LogoForm({
  guildId,
  logoUrl,
  t,
}: {
  guildId: string;
  logoUrl: string | null;
  t: BrandingDict;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function call(method: "POST" | "DELETE", body?: FormData) {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/branding/logo`, { method, body });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? t.logoFailed);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.logoFailed);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("file", file);
    void call("POST", fd);
  }

  return (
    <FormSection title={t.logo} description={t.logoHint}>
      {logoUrl && (
        <div className="flex flex-wrap items-center gap-4">
          <img
            src={logoUrl}
            alt={t.logoCurrent}
            className="h-16 w-auto max-w-full rounded-md border border-border bg-card object-contain p-2"
          />
          <Button variant="outline" disabled={busy} onClick={() => call("DELETE")}>
            <Trash className="h-4 w-4" />
            {t.logoRemove}
          </Button>
        </div>
      )}
      <FormField label={t.logoFile}>
        {(field) => (
          <input
            {...field}
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            disabled={busy}
            onChange={onSelect}
            className={FILE_INPUT}
          />
        )}
      </FormField>
      <p role="status" className="text-small text-muted-foreground empty:hidden">
        {busy ? t.logoUploading : ""}
      </p>
      {error && <Notice tone="danger" role="alert" title={error} />}
    </FormSection>
  );
}
