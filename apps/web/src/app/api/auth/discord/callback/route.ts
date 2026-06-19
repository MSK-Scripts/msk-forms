import { prisma } from "@msk-forms/db";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { discordAvatarUrl, exchangeCode, fetchDiscordUser, mapLocale } from "@/lib/discord";
import { getSession } from "@/lib/session";
import { absoluteUrl } from "@/lib/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Discord OAuth2 callback: validate the CSRF `state`, exchange the code,
 * upsert the user, and establish the session cookie.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  const returnTo = cookieStore.get("oauth_return_to")?.value ?? "/dashboard";

  // Clear the one-shot CSRF cookies regardless of outcome.
  cookieStore.delete("oauth_state");
  cookieStore.delete("oauth_return_to");

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(absoluteUrl("/?auth=error"));
  }

  try {
    const token = await exchangeCode(code);
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

    const session = await getSession();
    session.userId = user.id;
    session.discordId = user.discordId;
    session.username = user.username;
    session.avatar = user.avatar;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.redirect(absoluteUrl(returnTo));
  } catch (error) {
    console.error("Discord OAuth callback failed:", error);
    return NextResponse.redirect(absoluteUrl("/?auth=error"));
  }
}
