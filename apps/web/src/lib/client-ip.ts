/**
 * Best-effort client IP. Behind the Apache reverse proxy the socket peer is
 * always 127.0.0.1, so the real client is in `X-Forwarded-For` (mod_proxy adds
 * it by default). Falls back to `x-real-ip`, then a constant (which buckets all
 * callers together — acceptable degradation if no proxy header is present).
 *
 * Pure (no server-only / Redis imports) so it stays unit-testable.
 */
export function clientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}
