import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Destroy the session. POST-only to keep it CSRF-safe (no GET side effects). */
export async function POST() {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ ok: true });
}
