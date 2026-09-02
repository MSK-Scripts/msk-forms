import "server-only";

import { shopLegalUrl } from "@/lib/legal";
import { getDict, getLocale, type Dictionary } from "@/i18n";

/**
 * Everything the order summary in <UpgradeActions> needs, gathered once on the
 * server.
 *
 * § 312j Abs. 2 BGB wants the essential characteristics, the total price and
 * the term stated immediately before the order button, plus a way to reach the
 * terms and the withdrawal instructions. That is more than a label, and
 * threading five separate props through the five pages that render the upgrade
 * buttons would guarantee that one of them ends up with a different set.
 */
export interface UpgradeCopy {
  legal: Dictionary["legal"];
  /** Display prices per paid tier, from the pricing dictionary. */
  prices: { pro: string; enterprise: string };
  /** Our own terms; they live in this app. */
  termsHref: string;
  /** Withdrawal instructions; they live on msk-scripts.de. */
  withdrawalHref: string;
}

export async function upgradeCopy(): Promise<UpgradeCopy> {
  const t = await getDict();
  const locale = await getLocale();
  return {
    legal: t.legal,
    prices: { pro: t.pricing.tiers.pro.price, enterprise: t.pricing.tiers.enterprise.price },
    termsHref: "/terms",
    withdrawalHref: shopLegalUrl(locale, "/terms/widerruf"),
  };
}
