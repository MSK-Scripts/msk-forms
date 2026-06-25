import { prisma } from "@msk-forms/db";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { redeemHandoffToken } from "@/lib/auth-handoff";
import { getGuildByDomain, isPrimaryHostname, requestHostname } from "@/lib/custom-domain";
import { getSession } from "@/lib/session";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { absoluteUrl, safeRelativePath } from "@/lib/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Token-redemption throttle: 20 attempts per 60s per IP. */
const REDEEM_LIMIT = 20;
const REDEEM_WINDOW_SECONDS = 60;

/**
 * Cross-domain login handoff endpoint. Runs on a customer's custom domain: it
 * redeems the one-time token minted by the primary-host OAuth callback and
 * establishes a session cookie for THIS host, so the applicant returns to the
 * custom domain logged in. Always lands the user on `returnTo` (relative).
 */
export async function GET(request: NextRequest) {
  // Relative-only target (rejects "//", backslashes and control chars that could
  // turn into an off-origin URL once resolved).
  const returnTo = safeRelativePath(request.nextUrl.searchParams.get("returnTo"), "/");
  const token = request.nextUrl.searchParams.get("token");

  // Resolve + validate the host via the shared helper (strips port + trailing
  // dot, consistent with the rest of the custom-domain logic). The handoff is
  // only meaningful on a verified custom domain.
  const host = await requestHostname();
  const domainGuild = host && !isPrimaryHostname(host) ? await getGuildByDomain(host) : null;
  if (!host || !domainGuild) {
    // Not a verified custom domain — nothing to hand off; go to the primary copy.
    return NextResponse.redirect(absoluteUrl(returnTo));
  }

  // Build the destination from the validated custom-domain host — never from
  // request.url, which resolves to the loopback backend behind Apache (see
  // lib/url.ts). https is intrinsic to the public custom domain.
  const dest = new URL(returnTo, `https://${host}`);

  // Throttle redemption attempts.
  const rl = await rateLimit(`handoff:${clientIp(request.headers)}`, REDEEM_LIMIT, REDEEM_WINDOW_SECONDS);
  if (!rl.allowed || !token) {
    return NextResponse.redirect(dest);
  }

  const claims = await redeemHandoffToken(token);
  if (!claims) {
    // Expired, already used, or Redis unavailable — indistinguishable here by design.
    console.warn("[auth-handoff] no valid token (expired, reused, or store unavailable)");
    return NextResponse.redirect(dest);
  }

  // Browser-binding: the token's bind nonce must match the host-only cookie set
  // by /api/auth/start before the OAuth round-trip. A token leaked on its own
  // (e.g. from an access log) is then not redeemable from another browser.
  const cookieStore = await cookies();
  const bindCookie = cookieStore.get("handoff_bind")?.value ?? null;
  if (claims.bind && claims.bind !== bindCookie) {
    console.warn("[auth-handoff] bind mismatch — token not redeemed");
    return NextResponse.redirect(dest);
  }
  cookieStore.delete("handoff_bind");

  const user = await prisma.user.findUnique({
    where: { id: claims.userId },
    select: { id: true, discordId: true, username: true, avatar: true },
  });
  if (!user) {
    console.warn(`[auth-handoff] token user ${claims.userId} no longer exists`);
    return NextResponse.redirect(dest);
  }

  const session = await getSession();
  session.userId = user.id;
  session.discordId = user.discordId;
  session.username = user.username;
  session.avatar = user.avatar;
  session.isLoggedIn = true;
  await session.save();

  return NextResponse.redirect(dest);
}
