"use client";

import { Card, Checkbox } from "@msk-forms/ui";
import { useState } from "react";

/**
 * Owner-only switch: may admins permanently delete archived forms? Saves on
 * change and reverts the checkbox when the request fails.
 */
export function FormDeletionSetting({
  guildId,
  initial,
  t,
}: {
  guildId: string;
  initial: boolean;
  t: { title: string; label: string; hint: string; saved: string; failed: string };
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
    <Card className="flex flex-col gap-2 p-5">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t.title}
      </h3>
      <Checkbox
        id="admins-can-delete-forms"
        label={t.label}
        checked={allowed}
        disabled={busy}
        onChange={toggle}
      />
      <p className="text-xs text-muted-foreground">{t.hint}</p>
      {message && (
        <p className={`text-xs ${message.ok ? "text-primary" : "text-destructive"}`}>
          {message.text}
        </p>
      )}
    </Card>
  );
}
