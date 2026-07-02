"use client";

import type { Branding } from "@msk-forms/shared";
import { Button, Card, Field, Input, Textarea } from "@msk-forms/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CssPreview } from "@/components/branding/css-preview";
import type { Dictionary } from "@/i18n";

type BrandingDict = Dictionary["branding"];

const DEFAULT_ACCENT = "#5eb131";
const HEX = /^#[0-9a-fA-F]{6}$/;

/**
 * Beginner-friendly starter rules. Each targets `.msk-form` or a CSS variable
 * so it behaves identically in the preview and on the live page (the two
 * documented, stable hooks). `key` maps to a localized label.
 */
const CSS_SNIPPETS: { key: keyof BrandingDict["snip"]; css: string }[] = [
  { key: "rounded", css: ".msk-form {\n  --radius: 1.25rem;\n}" },
  {
    key: "tint",
    css: ".msk-form {\n  background: hsl(var(--primary) / 0.05);\n  padding: 1.5rem;\n  border-radius: 1rem;\n}",
  },
  { key: "text", css: ".msk-form {\n  font-size: 1.05rem;\n}" },
  { key: "heading", css: ".msk-form h1 {\n  color: hsl(var(--primary));\n  font-weight: 800;\n}" },
];

export function BrandingForm({
  guildId,
  initial,
  canCss,
  cssProBody,
  t,
}: {
  guildId: string;
  initial: Branding;
  canCss: boolean;
  cssProBody: string;
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

  function addSnippet(snippet: string) {
    setCss((prev) => (prev.trim() ? `${prev.trimEnd()}\n\n${snippet}` : snippet));
    setSaved(false);
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

      {canCss ? (
        <Field label={t.customCss} hint={t.customCssHint}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-foreground">{t.cssSnippets}</span>
              <div className="flex flex-wrap gap-2">
                {CSS_SNIPPETS.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => addSnippet(s.css)}
                    className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    + {t.snip[s.key]}
                  </button>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{t.cssSnippetsHint}</span>
            </div>
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
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-foreground">{t.cssPreviewTitle}</span>
              <CssPreview
                css={css}
                accentColor={color}
                labels={{
                  guild: t.sample.guild,
                  title: t.sample.title,
                  desc: t.sample.desc,
                  field: t.sample.field,
                  field2: t.sample.field2,
                  submit: t.sample.submit,
                }}
              />
              <span className="text-xs text-muted-foreground">{t.cssPreviewNote}</span>
            </div>
          </div>
        </Field>
      ) : (
        <Field label={t.customCss}>
          <p className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-muted-foreground">
            ★ {cssProBody}
          </p>
        </Field>
      )}

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
