import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { isValidBindNonce } from "@/lib/auth-handoff";
import { getGuildByDomain, isPrimaryHostname } from "@/lib/custom-domain";
import { buildAuthorizeUrl } from "@/lib/discord";
import { safeRelativePath } from "@/lib/url";

// Prisma/iron-session need the Node.js runtime (not Edge).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Start the Discord OAuth2 flow: generate a CSRF `state`, stash it (plus an
 * optional post-login redirect) in a short-lived HttpOnly cookie, then 302 to
 * Discord. The callback verifies the state.
 */
export async function GET(request: NextRequest) {
  const state = crypto.randomUUID();

  // Only allow same-origin relative redirects to avoid open-redirect abuse
  // (rejects `//`, backslashes and control chars — see safeRelativePath).
  const returnTo = safeRelativePath(request.nextUrl.searchParams.get("returnTo"), "/dashboard");

  // Optional: the verified custom domain the login was started from. After OAuth
  // (which always completes on the primary host) the callback hands the session
  // back to this domain. Validated against the DB so we never hand off to an
  // arbitrary host.
  const rawOrigin = (request.nextUrl.searchParams.get("origin") ?? "").toLowerCase();
  const origin =
    rawOrigin && !isPrimaryHostname(rawOrigin) && (await getGuildByDomain(rawOrigin))
      ? rawOrigin
      : "";

  // Binding nonce from /api/auth/start (set as a host-only cookie on the custom
  // domain). Carried through to the callback so the minted token is tied to it.
  const rawBind = request.nextUrl.searchParams.get("bind");
  const bind = isValidBindNonce(rawBind) ? rawBind : "";

  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";
  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes to complete the round-trip.
  });
  cookieStore.set("oauth_return_to", returnTo, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  if (origin) {
    cookieStore.set("oauth_origin", origin, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
  }
  if (origin && bind) {
    cookieStore.set("oauth_bind", bind, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
  }

  return NextResponse.redirect(buildAuthorizeUrl(state));
}
