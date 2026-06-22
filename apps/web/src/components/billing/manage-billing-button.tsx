"use client";

import { useState } from "react";

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
    <button
      type="button"
      onClick={go}
      disabled={busy}
      className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
    >
      {label}
    </button>
  );
}
