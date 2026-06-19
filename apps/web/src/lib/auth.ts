import type { Route } from "next";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

/**
 * Server-side guard for protected pages/actions. Returns the logged-in user's
 * core identity, or redirects to the Discord login (preserving `returnTo`).
 */
export async function requireUser(returnTo = "/dashboard") {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    redirect(
      `/api/auth/discord/login?returnTo=${encodeURIComponent(returnTo)}` as Route,
    );
  }
  return {
    id: session.userId,
    discordId: session.discordId!,
    username: session.username!,
    avatar: session.avatar ?? null,
  };
}

/** Non-redirecting variant: returns the user or null. */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) return null;
  return {
    id: session.userId,
    discordId: session.discordId!,
    username: session.username!,
    avatar: session.avatar ?? null,
  };
}
