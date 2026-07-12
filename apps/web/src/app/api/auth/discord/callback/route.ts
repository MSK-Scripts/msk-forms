import { prisma } from "@msk-forms/db";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { isPrimaryHostname, requestHostname } from "@/lib/custom-domain";
import { discordAvatarUrl, exchangeCode, fetchDiscordUser, mapLocale } from "@/lib/discord";
import { resolveHostOAuth } from "@/lib/guild-oauth";
import { getSession } from "@/lib/session";
import { appBaseUrl, safeRelativePath } from "@/lib/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Discord OAuth2 callback: validate the CSRF `state`, exchange the code, upsert
 * the user, and establish the session cookie on THIS host. On a verified custom
 * domain with its own OAuth app, that means the applicant is logged in directly
 * on the custom domain (no cross-domain handoff).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  const returnToCookie = cookieStore.get("oauth_return_to")?.value;

  // Clear the one-shot CSRF cookies regardless of outcome.
  cookieStore.delete("oauth_state");
  cookieStore.delete("oauth_return_to");

  // Land the user on the same host the flow ran on (custom domain or primary).
  const host = await requestHostname();
  const onCustomDomain = Boolean(host) && !isPrimaryHostname(host!);
  const base = onCustomDomain ? `https://${host}` : appBaseUrl();
  // The dashboard is primary-only; default custom-domain logins to the guild home.
  const returnTo = safeRelativePath(returnToCookie, onCustomDomain ? "/" : "/dashboard");
  const errorUrl = new URL("/?auth=error", base);

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(errorUrl);
  }

  try {
    // Per-guild OAuth app when on the guild's own custom domain; else the global
    // app. The same redirect_uri/client_id as the authorize step (Discord checks).
    const app = (await resolveHostOAuth(host)) ?? undefined;

    const token = await exchangeCode(code, app);
    const discordUser = await fetchDiscordUser(token.access_token);

    const avatar = discordAvatarUrl(discordUser);
    const user = await prisma.user.upsert({
      where: { discordId: discordUser.id },
      create: {
        discordId: discordUser.id,
        username: discordUser.username,
        avatar,
        email: discordUser.email ?? null,
        locale: mapLocale(discordUser.locale),
      },
      update: {
        username: discordUser.username,
        avatar,
        email: discordUser.email ?? null,
      },
    });

    // No membership auto-provisioning: logging in (e.g. an applicant submitting a
    // form) must not add the user to any guild's members list. Managers add team
    // members explicitly by Discord ID on the members page; the guild owner is
    // created when the bot joins.

    const session = await getSession();
    session.userId = user.id;
    session.discordId = user.discordId;
    session.username = user.username;
    session.avatar = user.avatar;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.redirect(new URL(returnTo, base));
  } catch (error) {
    console.error("Discord OAuth callback failed:", error);
    return NextResponse.redirect(errorUrl);
  }
}
