import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

/**
 * Session payload stored in the encrypted iron-session cookie (concept §17).
 * Stateless: the cookie itself carries the (encrypted) data — no Redis lookup
 * on the hot path. Keep this small; it is sent on every request.
 */
export interface SessionData {
  userId?: string;
  discordId?: string;
  username?: string;
  /** Full Discord CDN avatar URL, or null for the default avatar. */
  avatar?: string | null;
  isLoggedIn: boolean;
}

/**
 * Build session options at call time (not module load) so importing this file
 * during `next build` never throws on a missing secret — only an actual
 * request, which needs a valid secret anyway, does.
 */
function getSessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    // A short or missing secret silently weakens cookie encryption.
    throw new Error("SESSION_SECRET must be set and at least 32 characters long.");
  }
  return {
    password,
    cookieName: "msk_forms_session",
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // 30 days; refreshed on each save().
      maxAge: 60 * 60 * 24 * 30,
    },
  };
}

/**
 * Read (or lazily create) the current session from the request cookies.
 * Works in Server Components, Route Handlers and Server Actions.
 */
export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, getSessionOptions());
}
