/**
 * The app's external base URL. Behind the Apache reverse proxy, a request's
 * `request.url` resolves to the internal loopback address (127.0.0.1:3008),
 * so building redirects from it leaks `http://localhost:3008`. Use APP_URL —
 * the canonical public origin — as the base for any browser-facing URL.
 */
export function appBaseUrl(): string {
  return process.env.APP_URL ?? "http://localhost:3000";
}

/** Resolve a relative path against the public origin. */
export function absoluteUrl(path: string): URL {
  return new URL(path, appBaseUrl());
}
