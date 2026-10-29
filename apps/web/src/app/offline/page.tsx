import type { Metadata } from "next";

import { RetryButton } from "@/components/pwa/retry-button";
import { getDict } from "@/i18n";

export const metadata: Metadata = {
  title: "Offline",
};

/**
 * Offline fallback served by the service worker when a navigation fails with
 * no network. Self-contained (no data fetching, no navigation that would need
 * the network) so it renders from cache alone, on our host and on a guild's
 * custom domain alike; hence no site header and no guild colour, only the
 * `.msk-form` wrapper customers' CSS knows.
 */
export default async function OfflinePage() {
  const dict = await getDict();

  return (
    <main id="main" tabIndex={-1} className="flex min-h-dvh items-center py-16 focus:outline-none">
      <div className="msk-form public-column grid justify-items-start gap-5">
        <img
          src="/logo.png"
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 rounded-lg object-contain"
        />
        <h1 className="text-h2 font-bold tracking-[-0.015em] text-balance">
          {dict.pwa.offlineTitle}
        </h1>
        <p className="max-w-[46ch] text-lead text-muted-foreground">{dict.pwa.offlineBody}</p>
        <RetryButton label={dict.pwa.retry} />
      </div>
    </main>
  );
}
