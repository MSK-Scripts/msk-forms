import { NextResponse, type NextRequest } from "next/server";

import { authenticateApiKey } from "@/lib/api-key";
import { getSubmissionsTable } from "@/lib/forms";
import { isGuildEnterprise } from "@/lib/plan";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public REST export (Enterprise, concept §21). Authenticated by an API key:
 * `Authorization: Bearer mskf_…`. Returns the form's submissions as JSON,
 * scoped to the key's guild. The form must belong to that guild.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> },
) {
  const { formId } = await params;

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

  // API access is Enterprise-only — revoked automatically on downgrade.
  if (!(await isGuildEnterprise(auth.guildId))) {
    return NextResponse.json(
      { error: "The API requires the Enterprise plan." },
      { status: 402 },
    );
  }

  const table = await getSubmissionsTable(formId, auth.guildId);
  if (!table) {
    return NextResponse.json({ error: "Form not found." }, { status: 404 });
  }

  const submissions = table.rows.map((r) =>
    Object.fromEntries(table.columns.map((c, i) => [c, r[i]])),
  );
  return NextResponse.json(
    { form: table.formTitle, count: submissions.length, submissions },
    { headers: { "Cache-Control": "no-store" } },
  );
}
