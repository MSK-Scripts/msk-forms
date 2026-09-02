"use client";

import { Button } from "@msk-forms/ui";
import { useState } from "react";

import type { UpgradeCopy } from "@/lib/upgrade-copy";

type PaidTier = "pro" | "enterprise";

/** Starts Stripe Checkout for the guild + tier and redirects to the hosted page. */
function startCheckout(guildId: string, tier: PaidTier, setBusy: (b: boolean) => void) {
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

/**
 * Upgrade buttons for the offered paid tiers. Pass whichever labels apply: a
 * Free guild gets both (proLabel + enterpriseLabel); a Pro guild that can still
 * move up gets only enterpriseLabel.
 *
 * Picking a tier no longer starts the checkout. § 312j Abs. 2 BGB wants the
 * service, the total price and the term stated immediately before the order
 * button, so the first click opens the summary and only the button inside it
 * orders. That button's wording is prescribed by § 312j Abs. 3 and must not be
 * shortened to "Subscribe" or "Continue".
 *
 * The summary is an inline panel rather than a modal on purpose: a fixed
 * overlay rendered inside a subtree with a sticky or transformed ancestor gets
 * its own stacking context and slides under unrelated elements. That has
 * already cost a day in msk-shop.
 */
export function UpgradeActions({
  guildId,
  copy,
  proLabel,
  enterpriseLabel,
}: {
  guildId: string;
  copy: UpgradeCopy;
  proLabel?: string;
  enterpriseLabel?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<PaidTier | null>(null);
  const t = copy.legal;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {proLabel && (
          <Button
            type="button"
            disabled={busy}
            aria-expanded={pending === "pro"}
            onClick={() => setPending(pending === "pro" ? null : "pro")}
          >
            {proLabel}
          </Button>
        )}
        {enterpriseLabel && (
          <Button
            type="button"
            variant={proLabel ? "ghost" : "primary"}
            disabled={busy}
            aria-expanded={pending === "enterprise"}
            onClick={() => setPending(pending === "enterprise" ? null : "enterprise")}
          >
            {enterpriseLabel}
          </Button>
        )}
      </div>

      {pending && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <h4 className="text-sm font-semibold text-foreground">{t.orderTitle}</h4>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-muted-foreground">{t.orderService}:</dt>
              <dd className="font-medium text-foreground">
                MSK Forms {pending === "enterprise" ? "Enterprise" : "Pro"}
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-muted-foreground">{t.orderPrice}:</dt>
              <dd className="font-medium text-foreground">
                {t.orderPriceValue.replace("{price}", copy.prices[pending])}
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-muted-foreground">{t.orderTerm}:</dt>
              <dd className="font-medium text-foreground">{t.orderTermValue}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {t.orderLegalPre}{" "}
            <a href={copy.termsHref} className="text-primary hover:underline">
              {t.orderTerms}
            </a>{" "}
            {t.orderLegalAnd}{" "}
            <a
              href={copy.withdrawalHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {t.orderWithdrawal}
            </a>
            {t.orderLegalPost}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={busy}
              onClick={() => startCheckout(guildId, pending, setBusy)}
            >
              {t.orderSubmit}
            </Button>
            <Button type="button" variant="ghost" disabled={busy} onClick={() => setPending(null)}>
              {t.orderCancel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
