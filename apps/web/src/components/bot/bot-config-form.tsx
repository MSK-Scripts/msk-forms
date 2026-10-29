"use client";

import type { BotConfig } from "@msk-forms/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FormField, FormSection, Notice } from "@/components/dashboard-kit";
import {
  SettingsSaveBar,
  type SaveResult,
  type SettingsSaveCopy,
} from "@/components/settings/settings-save-bar";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Dictionary } from "@/i18n";

import { botConfigBody, botConfigValuesOf, type BotConfigValues } from "./bot-config-values";

type BotDict = Dictionary["botConfig"];

const LOCALE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "hu", label: "Magyar" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
  { value: "pt", label: "Português" },
  { value: "pl", label: "Polski" },
] as const;

type Values = BotConfigValues;

/** A Discord id field: a machine value, so monospace and no autocorrection. */
const ID_FIELD = {
  placeholder: "123456789012345678",
  spellCheck: false,
  autoComplete: "off",
  autoCapitalize: "off",
  className: "max-w-md font-mono",
} as const;

export function BotConfigForm({
  guildId,
  initial,
  t,
  kit,
}: {
  guildId: string;
  initial: BotConfig;
  t: BotDict;
  kit: SettingsSaveCopy;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(() => botConfigValuesOf(initial));
  const [saved, setSaved] = useState<Values>(values);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SaveResult>(null);

  const dirty = (Object.keys(values) as (keyof Values)[]).some((key) => values[key] !== saved[key]);

  const set =
    (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setValues((v) => ({ ...v, [key]: value }));
      setResult(null);
    };

  async function save() {
    setResult(null);
    setSaving(true);
    try {
      const body = botConfigBody(values);
      const res = await fetch(`/api/guilds/${guildId}/bot-config`, {
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

  return (
    <>
      <Notice tone="info" className="mb-6">
        {t.idHint}
      </Notice>

      <div>
        <FormSection title={t.sectionPosting}>
          <FormField label={t.reviewChannel} hint={t.reviewChannelHint}>
            {(field) => (
              <Input
                {...field}
                {...ID_FIELD}
                inputMode="numeric"
                value={values.channel}
                onChange={set("channel")}
              />
            )}
          </FormField>
          <FormField label={t.logChannel} hint={t.logChannelHint}>
            {(field) => (
              <Input
                {...field}
                {...ID_FIELD}
                inputMode="numeric"
                value={values.logChannel}
                onChange={set("logChannel")}
              />
            )}
          </FormField>
          <FormField label={t.postName} hint={t.postNameHint}>
            {(field) => (
              <Input
                {...field}
                value={values.postName}
                placeholder="MSK Forms"
                onChange={set("postName")}
                className="max-w-md"
              />
            )}
          </FormField>
        </FormSection>

        <FormSection title={t.sectionLanguage}>
          <FormField label={t.language} hint={t.languageHint}>
            {(field) => (
              <Select
                {...field}
                value={values.locale}
                onChange={set("locale")}
                className="max-w-md"
              >
                <option value="">{t.languageAuto}</option>
                {LOCALE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} lang={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
        </FormSection>

        <FormSection title={t.sectionRoles}>
          <FormField label={t.acceptedRole} hint={t.acceptedRoleHint}>
            {(field) => (
              <Input {...field} {...ID_FIELD} value={values.role} onChange={set("role")} />
            )}
          </FormField>
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
      </div>
    </>
  );
}
