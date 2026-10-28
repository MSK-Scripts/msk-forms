"use client";

import { useState } from "react";

import { FormSection, Notice } from "@/components/dashboard-kit";

/**
 * Owner-only switch: may admins permanently delete archived forms? Saves on
 * change and reverts the checkbox when the request fails.
 */
export function FormDeletionSetting({
  guildId,
  initial,
  t,
  dismissLabel,
}: {
  guildId: string;
  initial: boolean;
  t: { title: string; label: string; hint: string; saved: string; failed: string };
  /** `kit.dismiss` of the dictionary. */
  dismissLabel: string;
}) {
  const [allowed, setAllowed] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function toggle() {
    const next = !allowed;
    setAllowed(next);
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/guilds/${guildId}/form-deletion`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminsCanDelete: next }),
      });
      if (!res.ok) throw new Error();
      setMessage({ ok: true, text: t.saved });
    } catch {
      setAllowed(!next);
      setMessage({ ok: false, text: t.failed });
    } finally {
      setBusy(false);
    }
  }

  return (
    <FormSection title={t.title} description={t.hint}>
      <label className="flex min-h-11 w-fit cursor-pointer items-center gap-3">
        <input
          id="admins-can-delete-forms"
          type="checkbox"
          checked={allowed}
          disabled={busy}
          onChange={toggle}
          className="h-5 w-5 shrink-0 accent-primary"
        />
        <span>{t.label}</span>
      </label>
      {message && (
        <Notice
          tone={message.ok ? "success" : "danger"}
          role={message.ok ? "status" : "alert"}
          title={message.text}
          onDismiss={() => setMessage(null)}
          dismissLabel={dismissLabel}
        />
      )}
    </FormSection>
  );
}
