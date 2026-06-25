import { prisma } from "@msk-forms/db";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { createHandoffToken } from "@/lib/auth-handoff";
import { getGuildByDomain, isPrimaryHostname } from "@/lib/custom-domain";
import {
  discordAvatarUrl,
  exchangeCode,
  fetchDiscordGuildIds,
  fetchDiscordUser,
  mapLocale,
} from "@/lib/discord";
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
  const origin = cookieStore.get("oauth_origin")?.value ?? "";
  const bind = cookieStore.get("oauth_bind")?.value ?? null;

  // Clear the one-shot CSRF cookies regardless of outcome.
  cookieStore.delete("oauth_state");
  cookieStore.delete("oauth_return_to");
  cookieStore.delete("oauth_origin");
  cookieStore.delete("oauth_bind");

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

    // Auto-provision membership: for every Discord guild the user is in that has
    // MSK Forms installed, add them as a `viewer` (never downgrade an existing
    // role). An owner/admin can then promote them on the members page.
    try {
      const guildIds = await fetchDiscordGuildIds(token.access_token);
      if (guildIds.length > 0) {
        const guilds = await prisma.guild.findMany({
          where: { discordGuildId: { in: guildIds } },
          select: { id: true },
        });
        for (const g of guilds) {
          await prisma.guildMember.upsert({
            where: { guildId_userId: { guildId: g.id, userId: user.id } },
            update: {},
            create: { guildId: g.id, userId: user.id, role: "viewer" },
          });
        }
      }
    } catch (err) {
      console.error("[auth] guild auto-provision failed:", (err as Error).message);
    }

    const session = await getSession();
    session.userId = user.id;
    session.discordId = user.discordId;
    session.username = user.username;
    session.avatar = user.avatar;
    session.isLoggedIn = true;
    await session.save();

    // If login started on a verified custom domain, hand the session back there
    // via a one-time token (a primary-host cookie can't be read cross-domain).
    // Re-validate the origin so a tampered cookie can't redirect us elsewhere.
    if (origin && !isPrimaryHostname(origin) && (await getGuildByDomain(origin))) {
      const handoff = await createHandoffToken(user.id, bind);
      if (handoff) {
        const url = new URL(`https://${origin}/api/auth/handoff`);
        url.searchParams.set("token", handoff);
        url.searchParams.set("returnTo", returnTo);
        return NextResponse.redirect(url.toString());
      }
    }

    return NextResponse.redirect(absoluteUrl(returnTo));
  } catch (error) {
    console.error("Discord OAuth callback failed:", error);
    return NextResponse.redirect(absoluteUrl("/?auth=error"));
  }
}
