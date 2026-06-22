"use client";

import type { Branding } from "@msk-forms/shared";
import { Button, Card, Field, Input, Textarea } from "@msk-forms/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Dictionary } from "@/i18n";

type BrandingDict = Dictionary["branding"];

const DEFAULT_ACCENT = "#00e676";
const HEX = /^#[0-9a-fA-F]{6}$/;

export function BrandingForm({
  guildId,
  initial,
  t,
}: {
  guildId: string;
  initial: Branding;
  t: BrandingDict;
}) {
  const router = useRouter();
  const [color, setColor] = useState(initial.accentColor ?? "");
  const [css, setCss] = useState(initial.customCss ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const body: { accentColor?: string; customCss?: string } = {};
      if (color.trim()) body.accentColor = color.trim();
      if (css.trim()) body.customCss = css;
      const res = await fetch(`/api/guilds/${guildId}/branding`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? t.errSave);
      }
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errSave);
    } finally {
      setSaving(false);
    }
  }

  const swatch = HEX.test(color.trim()) ? color.trim() : DEFAULT_ACCENT;

  return (
    <Card className="flex flex-col gap-4 p-5">
      <Field label={t.accentColor} hint={t.accentHint}>
        <div className="flex items-center gap-3">
          <input
            type="color"
            aria-label={t.accentColor}
            value={swatch}
            onChange={(e) => {
              setColor(e.target.value);
              setSaved(false);
            }}
            className="h-10 w-14 cursor-pointer rounded-md border border-input bg-background"
          />
          <div className="w-32">
            <Input
              value={color}
              placeholder={DEFAULT_ACCENT}
              onChange={(e) => {
                setColor(e.target.value);
                setSaved(false);
              }}
            />
          </div>
          {color.trim() && (
            <button
              type="button"
              onClick={() => {
                setColor("");
                setSaved(false);
              }}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t.reset}
            </button>
          )}
        </div>
      </Field>

      <Field label={t.customCss} hint={t.customCssHint}>
        <Textarea
          value={css}
          rows={6}
          spellCheck={false}
          placeholder=".msk-form { ... }"
          className="font-mono text-xs"
          onChange={(e) => {
            setCss(e.target.value);
            setSaved(false);
          }}
        />
      </Field>

      <div className="flex items-center gap-3">
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? t.saving : t.save}
        </Button>
        {saved && <span className="text-sm text-primary">{t.saved}</span>}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </Card>
  );
}
