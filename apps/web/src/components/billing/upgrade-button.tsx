"use client";

import { Button } from "@msk-forms/ui";
import { useState } from "react";

/** Starts Stripe Checkout for the guild + tier and redirects to the hosted page. */
function startCheckout(guildId: string, tier: "pro" | "enterprise", setBusy: (b: boolean) => void) {
  setBusy(true);
  fetch(`/api/guilds/${guildId}/billing/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tier }),
  })
    .then((res) => res.json().catch(() => null))
    .then((data: { url?: string } | null) => {
      if (data?.url) window.location.href = data.url;
      else setBusy(false);
    })
    .catch(() => setBusy(false));
}

/** Upgrade buttons for the available paid tiers (Enterprise only when offered). */
export function UpgradeActions({
  guildId,
  proLabel,
  enterpriseLabel,
}: {
  guildId: string;
  proLabel: string;
  enterpriseLabel?: string;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" disabled={busy} onClick={() => startCheckout(guildId, "pro", setBusy)}>
        {proLabel}
      </Button>
      {enterpriseLabel && (
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={() => startCheckout(guildId, "enterprise", setBusy)}
        >
          {enterpriseLabel}
        </Button>
      )}
    </div>
  );
}
