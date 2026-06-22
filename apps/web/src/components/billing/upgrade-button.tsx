"use client";

import { Button } from "@msk-forms/ui";
import { useState } from "react";

/** Starts Stripe Checkout for the guild and redirects to the hosted page. */
export function UpgradeButton({ guildId, label }: { guildId: string; label: string }) {
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/billing/checkout`, { method: "POST" });
      const data = (await res.json().catch(() => null)) as { url?: string } | null;
      if (data?.url) window.location.href = data.url;
      else setBusy(false);
    } catch {
      setBusy(false);
    }
  }

  return (
    <Button type="button" onClick={go} disabled={busy}>
      {label}
    </Button>
  );
}
