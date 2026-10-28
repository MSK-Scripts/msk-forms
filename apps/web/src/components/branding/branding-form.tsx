"use client";

import type { Branding } from "@msk-forms/shared";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";

import { CssPreview } from "@/components/branding/css-preview";
import { FormField, FormSection } from "@/components/dashboard-kit";
import { ArrowCounterClockwise, Plus } from "@/components/icons";
import { ProNotice } from "@/components/pro-notice";
import { ColorField, HEX_COLOR } from "@/components/settings/color-field";
import { SettingsSaveBar, type SaveResult, type SettingsSaveCopy } from "@/components/settings/settings-save-bar";
import { Button } from "@/components/ui/button";
import { fieldClassName } from "@/components/ui/input";
import type { Dictionary } from "@/i18n";
import { accentSets } from "@/lib/branding";
import { cn } from "@/lib/utils";

type BrandingDict = Dictionary["branding"];

/**
 * MSK green as the light theme paints it: the value of `--primary` in `:root`
 * of app/globals.css. The picker shows it while no accent is chosen, because
 * that is what a guild without an accent gets. Display only: an empty accent
 * is saved as no accent, never as this value.
 */
const MSK_GREEN = "#27762e";

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

interface Values {
  color: string;
  css: string;
}

/**
 * Accent colour and custom CSS of the guild's public pages. The accent is a
 * swatch picker plus its hex code; where the colour would be hard to read in a
 * theme, the public pages show a readable shade of it (lib/branding.ts), and
 * the field says so. Custom CSS (Pro) has Quick Styles that add a starter
 * rule and a live preview in a sandboxed frame, beside the editor where the
 * column is wide enough and below it otherwise. The kit SaveBar saves both.
 */
export function BrandingForm({
  guildId,
  initial,
  canCss,
  cssProBody,
  proTitle,
  t,
  kit,
}: {
  guildId: string;
  initial: Branding;
  canCss: boolean;
  cssProBody: string;
  proTitle: string;
  t: BrandingDict;
  kit: SettingsSaveCopy;
}) {
  const router = useRouter();
  const snippetsId = useId();
  const [values, setValues] = useState<Values>({ color: initial.accentColor ?? "", css: initial.customCss ?? "" });
  const [saved, setSaved] = useState<Values>(values);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SaveResult>(null);
  const { color, css } = values;

  const dirty = color !== saved.color || css !== saved.css;

  // Whether the public pages show a readable shade instead of the colour itself.
  const adjusted = useMemo(() => {
    const trimmed = color.trim();
    if (!HEX_COLOR.test(trimmed)) return false;
    const sets = accentSets(trimmed);
    return Boolean(sets && (sets.light.adjusted || sets.dark.adjusted));
  }, [color]);

  function update(partial: Partial<Values>) {
    setValues((v) => ({ ...v, ...partial }));
    setResult(null);
  }

  async function save() {
    setResult(null);
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
      setSaved(values);
      setResult({ tone: "success", message: t.saved });
      router.refresh();
    } catch (err) {
      setResult({ tone: "danger", message: err instanceof Error ? err.message : t.errSave });
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    setValues(saved);
    setResult(null);
  }

  function addSnippet(snippet: string) {
    update({ css: css.trim() ? `${css.trimEnd()}\n\n${snippet}` : snippet });
  }

  return (
    <>
      <FormSection title={t.accentColor} description={t.accentHint}>
        <div className="flex flex-wrap items-end gap-3">
          <ColorField
            label={t.hexLabel}
            pickerLabel={t.colorPicker}
            hint={!color.trim() ? t.accentDefault : adjusted ? t.accentAdjusted : undefined}
            invalidText={t.hexError}
            value={color}
            onChange={(next) => update({ color: next })}
            fallback={MSK_GREEN}
            optional
            placeholder={MSK_GREEN}
            className="max-w-[45ch]"
          />
          {color.trim() && (
            <Button variant="ghost" onClick={() => update({ color: "" })}>
              <ArrowCounterClockwise className="h-4 w-4" />
              {t.reset}
            </Button>
          )}
        </div>
      </FormSection>

      <FormSection title={t.customCss}>
        {canCss ? (
          <div className="@container">
            <div className="grid gap-6 @4xl:grid-cols-2">
              <div className="grid content-start gap-5">
                <div role="group" aria-labelledby={snippetsId} className="grid gap-2">
                  <p id={snippetsId} className="font-semibold">
                    {t.cssSnippets}
                  </p>
                  <p className="text-small text-muted-foreground">{t.cssSnippetsHint}</p>
                  <div className="flex flex-wrap gap-2">
                    {CSS_SNIPPETS.map((s) => (
                      <Button key={s.key} variant="outline" onClick={() => addSnippet(s.css)}>
                        <Plus className="h-4 w-4" />
                        {t.snip[s.key]}
                      </Button>
                    ))}
                  </div>
                </div>
                <FormField label={t.cssCode} hint={t.customCssHint}>
                  {(field) => (
                    <textarea
                      {...field}
                      value={css}
                      rows={12}
                      spellCheck={false}
                      autoCapitalize="off"
                      autoComplete="off"
                      placeholder=".msk-form { ... }"
                      className={cn(fieldClassName, "font-mono")}
                      onChange={(e) => update({ css: e.target.value })}
                    />
                  )}
                </FormField>
              </div>
              <div className="grid content-start gap-2">
                <h3 className="font-semibold">{t.cssPreviewTitle}</h3>
                <CssPreview
                  css={css}
                  accentColor={color}
                  title={t.cssPreviewTitle}
                  labels={{
                    guild: t.sample.guild,
                    title: t.sample.title,
                    desc: t.sample.desc,
                    field: t.sample.field,
                    field2: t.sample.field2,
                    submit: t.sample.submit,
                  }}
                />
                <p className="text-small text-muted-foreground">{t.cssPreviewNote}</p>
              </div>
            </div>
          </div>
        ) : (
          <ProNotice title={proTitle} body={cssProBody} />
        )}
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
