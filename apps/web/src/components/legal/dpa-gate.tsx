"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";

import { Checkbox } from "@/components/dashboard-kit";
import { ArrowSquareOut, CircleNotch, WarningCircle } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const uid = useId();
  const headingId = `${uid}-title`;
  const errorId = `${uid}-error`;

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

  // A task of its own, so a card: read the agreement, tick, accept.
  return (
    <Card
      role="region"
      aria-labelledby={headingId}
      className="grid max-w-[48rem] justify-items-start gap-3 p-[clamp(1rem,0.8rem+0.6vw,1.5rem)]"
    >
      <h2 id={headingId} className="font-display text-h3 font-[650]">
        {t.dpaTitle}
      </h2>
      <p className="max-w-[65ch] text-muted-foreground">{t.dpaBody}</p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-2 text-primary hover:underline"
      >
        {t.dpaLink}
        <ArrowSquareOut className="h-4 w-4 shrink-0" />
      </a>

      <Checkbox
        label={t.dpaCheckbox}
        checked={checked}
        disabled={busy}
        invalid={error === t.dpaUnchecked}
        describedBy={error ? errorId : undefined}
        onChange={(on) => {
          setChecked(on);
          if (on) setError(null);
        }}
      />

      {error && (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-small font-semibold text-danger">
          <WarningCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <Button type="button" disabled={busy} aria-busy={busy || undefined} onClick={accept} className="mt-1">
        {busy && <CircleNotch className="h-4 w-4 animate-spin" />}
        {busy ? t.dpaBusy : t.dpaAccept}
      </Button>
    </Card>
  );
}
