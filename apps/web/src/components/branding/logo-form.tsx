"use client";

import { Button, Card, Field } from "@msk-forms/ui";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import type { Dictionary } from "@/i18n";

type BrandingDict = Dictionary["branding"];

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
    <Card className="flex flex-col gap-4 p-5">
      <Field label={t.logo} hint={t.logoHint}>
        {logoUrl && (
          <img
            src={logoUrl}
            alt=""
            className="mb-2 h-16 w-auto rounded-md border border-border bg-background p-2"
          />
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          disabled={busy}
          onChange={onSelect}
          className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80 disabled:opacity-50"
        />
      </Field>

      {logoUrl && (
        <Button
          variant="ghost"
          className="self-start text-destructive hover:text-destructive"
          disabled={busy}
          onClick={() => call("DELETE")}
        >
          {t.logoRemove}
        </Button>
      )}
      {busy && <p className="text-xs text-muted-foreground">{t.logoUploading}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </Card>
  );
}
