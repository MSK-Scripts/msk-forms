import { NextResponse, type NextRequest } from "next/server";

import { generateBindNonce } from "@/lib/auth-handoff";
import { getGuildByDomain, isPrimaryHostname, requestHostname } from "@/lib/custom-domain";
import { absoluteUrl, appBaseUrl, safeRelativePath } from "@/lib/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lifetime of the OAuth round-trip cookies (10 minutes). */
const MAX_AGE = 600;

/**
 * Start the login flow FROM a custom domain. Sets a host-only `handoff_bind`
 * nonce cookie on the custom domain, then redirects to the primary-host Discord
 * login carrying that nonce. After OAuth, the cross-domain handoff requires the
 * cookie to match the token's bound nonce — so a token leaked on its own (e.g.
 * from an access log) can't be redeemed by another browser. Auth itself still
 * happens on the primary host (same-origin OAuth state/callback).
 */
export async function GET(request: NextRequest) {
  const returnTo = safeRelativePath(request.nextUrl.searchParams.get("returnTo"), "/");

  // Only meaningful on a verified custom domain; otherwise just hand off to the
  // normal primary-host login.
  const host = await requestHostname();
  const isCustom = host && !isPrimaryHostname(host) && (await getGuildByDomain(host));
  if (!host || !isCustom) {
    return NextResponse.redirect(
      absoluteUrl(`/api/auth/discord/login?returnTo=${encodeURIComponent(returnTo)}`),
    );
  }

  const bind = generateBindNonce();
  const target = new URL(`${appBaseUrl()}/api/auth/discord/login`);
  target.searchParams.set("returnTo", returnTo);
  target.searchParams.set("origin", host);
  target.searchParams.set("bind", bind);

  const res = NextResponse.redirect(target.toString());
  // Host-only (no Domain attribute) cookie on THIS custom domain. SameSite=Lax so
  // it is still sent on the final top-level GET navigation back from the callback.
  res.cookies.set("handoff_bind", bind, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return res;
}
