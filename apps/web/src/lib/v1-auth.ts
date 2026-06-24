import "server-only";

import { NextResponse, type NextRequest } from "next/server";

import { authenticateApiKey } from "@/lib/api-key";
import { isGuildEnterprise } from "@/lib/plan";
import { rateLimit } from "@/lib/rate-limit";

/** Successful auth context for a v1 API request. */
export interface V1Auth {
  keyId: string;
  guildId: string;
}

/**
 * Shared guard for the public v1 API (concept §20/§21): authenticate the
 * `Authorization: Bearer mskf_…` key, throttle per key, and require the
 * Enterprise plan. Returns the auth context on success, or a ready-to-return
 * `NextResponse` (401/402/429) on failure. Enterprise is checked at request time
 * so a downgrade revokes access automatically.
 */
export async function authorizeV1(request: NextRequest): Promise<V1Auth | NextResponse> {
  const auth = await authenticateApiKey(request.headers.get("authorization"));
  if (!auth) {
    return NextResponse.json({ error: "Invalid API key." }, { status: 401 });
  }

  // Per-key throttle: 60 requests/minute (fails open without Redis).
  const rl = await rateLimit(`api:${auth.keyId}`, 60, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  if (!(await isGuildEnterprise(auth.guildId))) {
    return NextResponse.json(
      { error: "The API requires the Enterprise plan." },
      { status: 402 },
    );
  }

  return auth;
}
