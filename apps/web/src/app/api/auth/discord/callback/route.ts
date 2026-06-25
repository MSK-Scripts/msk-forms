import { prisma } from "@msk-forms/db";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { isPrimaryHostname, requestHostname } from "@/lib/custom-domain";
import {
  discordAvatarUrl,
  exchangeCode,
  fetchDiscordGuildIds,
  fetchDiscordUser,
  mapLocale,
} from "@/lib/discord";
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
  const returnTo = safeRelativePath(cookieStore.get("oauth_return_to")?.value, "/dashboard");

  // Clear the one-shot CSRF cookies regardless of outcome.
  cookieStore.delete("oauth_state");
  cookieStore.delete("oauth_return_to");

  // Land the user on the same host the flow ran on (custom domain or primary).
  const host = await requestHostname();
  const onCustomDomain = Boolean(host) && !isPrimaryHostname(host!);
  const base = onCustomDomain ? `https://${host}` : appBaseUrl();
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

    return NextResponse.redirect(new URL(returnTo, base));
  } catch (error) {
    console.error("Discord OAuth callback failed:", error);
    return NextResponse.redirect(errorUrl);
  }
}
