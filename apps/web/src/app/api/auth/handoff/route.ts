import { prisma } from "@msk-forms/db";
import { NextResponse, type NextRequest } from "next/server";

import { redeemHandoffToken } from "@/lib/auth-handoff";
import { getGuildByDomain, isPrimaryHostname } from "@/lib/custom-domain";
import { getSession } from "@/lib/session";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cross-domain login handoff endpoint. Runs on a customer's custom domain: it
 * redeems the one-time token minted by the primary-host OAuth callback and
 * establishes a session cookie for THIS host, so the applicant returns to the
 * custom domain logged in. Always lands the user on `returnTo` (relative).
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const rawReturnTo = request.nextUrl.searchParams.get("returnTo") ?? "/";
  // Relative-only to avoid open redirects.
  const returnTo = rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//") ? rawReturnTo : "/";
  const dest = new URL(returnTo, request.url);
  // Next talks http to the Apache proxy; the public custom domain is https.
  if (process.env.NODE_ENV === "production") dest.protocol = "https:";

  // Only meaningful on a verified custom domain (not the primary host).
  const host = (request.headers.get("host") ?? "").toLowerCase().split(":")[0]!;
  if (!host || isPrimaryHostname(host) || !(await getGuildByDomain(host))) {
    return NextResponse.redirect(dest);
  }

  // Throttle token redemption attempts.
  const rl = await rateLimit(`handoff:${clientIp(request.headers)}`, 20, 60);
  if (!rl.allowed || !token) {
    return NextResponse.redirect(dest);
  }

  const userId = await redeemHandoffToken(token);
  if (!userId) {
    return NextResponse.redirect(dest);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, discordId: true, username: true, avatar: true },
  });
  if (!user) {
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
