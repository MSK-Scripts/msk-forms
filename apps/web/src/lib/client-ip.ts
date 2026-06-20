/**
 * Best-effort client IP. Behind the Apache reverse proxy the socket peer is
 * always 127.0.0.1, so the real client is in `X-Forwarded-For`.
 *
 * `X-Forwarded-For` is `client, proxy1, proxy2, …` — appended left-to-right as
 * the request passes through each hop. A client can spoof the *left* part by
 * sending its own header; our trusted proxy (Apache) appends the real peer at
 * the **right**. With exactly one trusted proxy in front, the **last** entry is
 * the only trustworthy one, so we key the rate limiter on it. Falls back to
 * `x-real-ip`, then a constant (which buckets all callers together — acceptable
 * degradation if no proxy header is present).
 *
 * Pure (no server-only / Redis imports) so it stays unit-testable.
 */
export function clientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((p) => p.trim());
    const last = parts[parts.length - 1];
    if (last && isIpish(last)) return last;
  }
  const real = headers.get("x-real-ip")?.trim();
  if (real && isIpish(real)) return real;
  return "unknown";
}

/**
 * Loose IPv4/IPv6 shape check. Not full validation — just enough to reject
 * obvious junk so a malformed header can't pollute the rate-limit keyspace.
 */
function isIpish(value: string): boolean {
  if (value.length > 45) return false; // longest possible IPv6 textual form
  // IPv4 dotted-quad, or IPv6 (hex groups + colons, optional zone/embedded v4).
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(value) || /^[0-9a-fA-F:]+(%[0-9a-zA-Z]+)?$/.test(value);
}
