import { NextResponse, type NextRequest } from "next/server";

/**
 * Nonce-based CSP ('strict-dynamic') + security headers (concept §18).
 * Headers are set centrally here; the Apache vhost neutralizes its own via
 * `Header always unset` to avoid duplicates.
 *
 * Next.js 16 renamed the `middleware` file convention to `proxy`.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  // Cloudflare Turnstile (captcha): loads api.js, opens an iframe challenge and
  // calls back to challenges.cloudflare.com.
  const TURNSTILE = "https://challenges.cloudflare.com";

  // Dev (Turbopack/HMR) needs eval + inline + a websocket; production stays on
  // the strict nonce + 'strict-dynamic' policy with no eval.
  const csp = [
    `default-src 'self'`,
    isDev
      ? `script-src 'self' 'unsafe-eval' 'unsafe-inline' ${TURNSTILE}`
      : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${TURNSTILE}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https://cdn.discordapp.com`,
    `font-src 'self'`,
    isDev ? `connect-src 'self' ws: wss: ${TURNSTILE}` : `connect-src 'self' ${TURNSTILE}`,
    `frame-src ${TURNSTILE}`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    // PWA: the web app manifest and the service worker are same-origin. Declared
    // explicitly so browsers don't fall back to default-src/script-src for them.
    `manifest-src 'self'`,
    `worker-src 'self'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set("X-Frame-Options", "DENY");

  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest).*)",
    },
  ],
};
