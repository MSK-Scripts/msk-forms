import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Return the current user for client-side hydration, or null when logged out. */
export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: {
      id: session.userId,
      discordId: session.discordId,
      username: session.username,
      avatar: session.avatar ?? null,
    },
  });
}
