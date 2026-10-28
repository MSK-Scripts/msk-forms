"use client";

import { useState } from "react";

import { CircleNotch } from "@/components/icons";
import { Button } from "@/components/ui/button";

/** Opens the Stripe billing portal for the guild's subscription. */
export function ManageBillingButton({ guildId, label }: { guildId: string; label: string }) {
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/billing/portal`, { method: "POST" });
      const data = (await res.json().catch(() => null)) as { url?: string } | null;
      if (data?.url) window.location.href = data.url;
      else setBusy(false);
    } catch {
      setBusy(false);
    }
  }

  return (
    <Button variant="outline" onClick={go} disabled={busy} aria-busy={busy || undefined}>
      {busy && <CircleNotch className="h-4 w-4 animate-spin" />}
      {label}
    </Button>
  );
}
