"use client";

/**
 * Render an ISO timestamp in the viewer's local timezone. The server renders it
 * in UTC and the client re-renders in local time on hydration — suppressed so
 * React doesn't warn about the expected mismatch.
 */
export function LocalDateTime({ iso }: { iso: string }) {
  let label = iso;
  try {
    label = new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    // Fall back to the raw ISO string.
  }
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {label}
    </time>
  );
}
