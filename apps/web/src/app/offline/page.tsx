import type { Metadata } from "next";
import Image from "next/image";

import { RetryButton } from "@/components/pwa/retry-button";
import { getDict } from "@/i18n";

export const metadata: Metadata = {
  title: "Offline",
};

/**
 * Branded offline fallback served by the service worker when a navigation fails
 * with no network. Kept self-contained (no data fetching) so it renders from
 * cache alone.
 */
export default async function OfflinePage() {
  const dict = await getDict();

  return (
    <main className="msk-form pwa-safe-x flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <Image src="/logo.png" alt="" width={56} height={56} className="mb-6 opacity-90" priority />
      <h1 className="text-2xl font-bold tracking-tight">{dict.pwa.offlineTitle}</h1>
      <p className="mt-3 max-w-md text-muted-foreground">{dict.pwa.offlineBody}</p>
      <div className="mt-8">
        <RetryButton label={dict.pwa.retry} />
      </div>
    </main>
  );
}
