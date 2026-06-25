import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { isPrimaryHostname, requestHostname } from "@/lib/custom-domain";
import { buildAuthorizeUrl } from "@/lib/discord";
import { resolveHostOAuth } from "@/lib/guild-oauth";
import { absoluteUrl, safeRelativePath } from "@/lib/url";

// Prisma/iron-session need the Node.js runtime (not Edge).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Start the Discord OAuth2 flow: generate a CSRF `state`, stash it (plus the
 * post-login redirect) in short-lived HttpOnly cookies, then 302 to Discord.
 *
 * Host-aware: on a verified custom domain whose guild has its own Discord OAuth
 * app, the whole flow runs on that host (its own client_id + callback) so the
 * session cookie is established directly on the custom domain — no cross-domain
 * handoff. On a custom domain WITHOUT its own app, fall back to the primary host.
 */
export async function GET(request: NextRequest) {
  const state = crypto.randomUUID();

  const host = await requestHostname();
  const onCustomDomain = host != null && !isPrimaryHostname(host);

  // Same-origin relative redirect only (rejects "//", backslashes, control chars).
  // The dashboard lives only on the primary host, so on a custom domain default
  // to the guild's branded home ("/") instead of "/dashboard".
  const returnTo = safeRelativePath(
    request.nextUrl.searchParams.get("returnTo"),
    onCustomDomain ? "/" : "/dashboard",
  );

  let app: { clientId: string; redirectUri: string } | undefined;
  if (onCustomDomain) {
    const oauth = await resolveHostOAuth(host);
    if (!oauth) {
      // No usable per-guild OAuth app for this custom domain — fall back to the
      // primary host. Logged so a mis-saved secret (present but undecryptable)
      // or an unverified domain is diagnosable instead of silently bouncing to
      // the global MSK Forms app.
      console.warn(`[oauth-login] no per-guild OAuth for host "${host}" — falling back to primary host`);
      return NextResponse.redirect(
        absoluteUrl(`/api/auth/discord/login?returnTo=${encodeURIComponent(returnTo)}`),
      );
    }
    app = { clientId: oauth.clientId, redirectUri: oauth.redirectUri };
  }

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

  return NextResponse.redirect(buildAuthorizeUrl(state, app));
}
