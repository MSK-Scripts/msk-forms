import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { buildAuthorizeUrl } from "@/lib/discord";

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

  // Only allow same-origin relative redirects to avoid open-redirect abuse.
  const rawReturnTo = request.nextUrl.searchParams.get("returnTo") ?? "/dashboard";
  const returnTo = rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//")
    ? rawReturnTo
    : "/dashboard";

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

  return NextResponse.redirect(buildAuthorizeUrl(state));
}
