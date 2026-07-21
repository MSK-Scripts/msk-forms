"use client";

import { Button, Card, Field, Textarea } from "@msk-forms/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface StatusMessagesLabels {
  placeholder: string;
  hint: string;
  save: string;
  saving: string;
  saved: string;
  errSave: string;
}

/**
 * Guild-wide per-status message editor. Each status gets an optional message
 * automatically sent to the applicant when a submission enters it. Blank = no
 * message. A per-form override can be set in the form builder.
 */
export function StatusMessagesForm({
  guildId,
  statuses,
  initial,
  t,
}: {
  guildId: string;
  statuses: { value: string; label: string }[];
  initial: Record<string, string>;
  t: StatusMessagesLabels;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Record<string, string>>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function set(key: string, value: string) {
    setMessages((m) => ({ ...m, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/guilds/${guildId}/status-messages`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      if (!res.ok) throw new Error(t.errSave);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errSave);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-4">
        {statuses.map((s) => (
          <Field key={s.value} label={s.label}>
            <Textarea
              value={messages[s.value] ?? ""}
              onChange={(e) => set(s.value, e.target.value)}
              placeholder={t.placeholder}
              rows={2}
              maxLength={2000}
            />
          </Field>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{t.hint}</p>
      <div className="flex items-center gap-3">
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? t.saving : t.save}
        </Button>
        {saved && <span className="text-sm text-primary">{t.saved}</span>}
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </Card>
  );
}
