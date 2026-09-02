"use client";

import { Button, Card } from "@msk-forms/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Dictionary } from "@/i18n";

/**
 * One-time acceptance of the data processing agreement, shown in place of the
 * form builder while the guild has not accepted it.
 *
 * Art. 28 GDPR wants the agreement in place before the processing starts, and
 * the processing here starts the moment a form goes live and someone fills it
 * in. Creating a form is therefore the right gate: it is the last point at
 * which nothing has been collected yet.
 *
 * The checkbox is deliberate rather than an implicit "by continuing you
 * agree". An acceptance nobody actively gave is not one, and the timestamp we
 * store is meant to prove something.
 */
export function DpaGate({
  guildId,
  t,
  href,
}: {
  guildId: string;
  t: Dictionary["legal"];
  href: string;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    if (!checked) {
      setError(t.dpaUnchecked);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/guilds/${guildId}/dpa`, { method: "POST" });
      if (!res.ok) {
        setError(res.status === 403 ? t.dpaNoPerm : t.dpaError);
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError(t.dpaError);
      setBusy(false);
    }
  }

  return (
    <Card className="flex flex-col items-start gap-3 border-primary/30 bg-primary/5 p-6">
      <h3 className="font-heading text-base font-semibold text-foreground">{t.dpaTitle}</h3>
      <p className="text-sm text-muted-foreground">{t.dpaBody}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary hover:underline"
      >
        {t.dpaLink}
      </a>

      <label className="mt-1 flex items-start gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={checked}
          disabled={busy}
          onChange={(e) => {
            setChecked(e.target.checked);
            if (e.target.checked) setError(null);
          }}
          className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
        />
        <span>{t.dpaCheckbox}</span>
      </label>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="button" disabled={busy} onClick={accept}>
        {busy ? t.dpaBusy : t.dpaAccept}
      </Button>
    </Card>
  );
}
