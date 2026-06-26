"use client";

import { Button } from "@/components/ui/button";

/** Reloads the current page — used by the offline screen to retry once the
 *  network is back. */
export function RetryButton({ label }: { label: string }) {
  return <Button onClick={() => window.location.reload()}>{label}</Button>;
}
