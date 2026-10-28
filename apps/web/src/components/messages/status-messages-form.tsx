"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { FormField, FormSection } from "@/components/dashboard-kit";
import { SettingsSaveBar, type SaveResult, type SettingsSaveCopy } from "@/components/settings/settings-save-bar";
import { fieldClassName } from "@/components/ui/input";

interface StatusMessagesLabels {
  section: string;
  placeholder: string;
  hint: string;
  saved: string;
  errSave: string;
}

/** True when two message maps say the same; a blank message is no message. */
function sameMessages(a: Record<string, string>, b: Record<string, string>): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) if ((a[key] ?? "") !== (b[key] ?? "")) return false;
  return true;
}

/**
 * Guild-wide per-status message editor. Each status gets an optional message
 * automatically sent to the applicant when a submission enters it. Blank = no
 * message. A per-form override can be set in the form builder. The kit
 * SaveBar saves all of them at once; Discard restores the last saved ones.
 */
export function StatusMessagesForm({
  guildId,
  statuses,
  initial,
  t,
  kit,
}: {
  guildId: string;
  statuses: { value: string; label: string }[];
  initial: Record<string, string>;
  t: StatusMessagesLabels;
  kit: SettingsSaveCopy;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Record<string, string>>(initial);
  const [saved, setSaved] = useState<Record<string, string>>(initial);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SaveResult>(null);

  const dirty = !sameMessages(messages, saved);

  function set(key: string, value: string) {
    setMessages((m) => ({ ...m, [key]: value }));
    setResult(null);
  }

  async function save() {
    setSaving(true);
    setResult(null);
    try {
      const res = await fetch(`/api/guilds/${guildId}/status-messages`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      if (!res.ok) throw new Error(t.errSave);
      setSaved(messages);
      setResult({ tone: "success", message: t.saved });
      router.refresh();
    } catch (err) {
      setResult({ tone: "danger", message: err instanceof Error ? err.message : t.errSave });
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    setMessages(saved);
    setResult(null);
  }

  return (
    <>
      <FormSection title={t.section} description={t.hint}>
        {statuses.map((s) => (
          <FormField key={s.value} label={s.label}>
            {(field) => (
              <textarea
                {...field}
                value={messages[s.value] ?? ""}
                onChange={(e) => set(s.value, e.target.value)}
                placeholder={t.placeholder}
                rows={3}
                maxLength={2000}
                className={fieldClassName}
              />
            )}
          </FormField>
        ))}
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
