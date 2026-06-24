import { prisma } from "@msk-forms/db";
import { experimentActive, parseFormSettings } from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { experimentCookieName, recordExperimentView } from "@/lib/experiment";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Record an A/B-test view and stickily assign the variant. Called once on mount
 * from the public form page. Validates the variant against the form's live
 * experiment; sets the sticky cookie when absent so refreshes keep the same arm.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // Light throttle so view counts can't be trivially inflated.
  const rl = await rateLimit(`exp:${clientIp(request.headers)}`, 30, 60);
  if (!rl.allowed) return new NextResponse(null, { status: 429 });

  const body = (await request.json().catch(() => null)) as { variant?: unknown } | null;
  const variant = body?.variant;
  if (typeof variant !== "string") return new NextResponse(null, { status: 400 });

  const form = await prisma.form.findUnique({
    where: { slug },
    select: { id: true, settings: true },
  });
  if (!form) return new NextResponse(null, { status: 404 });

  const exp = parseFormSettings(form.settings).experiment;
  // Unknown variant or inactive experiment → ignore quietly.
  if (!experimentActive(exp) || !exp!.variants.some((v) => v.id === variant)) {
    return new NextResponse(null, { status: 204 });
  }

  await recordExperimentView(form.id, variant);

  const res = new NextResponse(null, { status: 204 });
  const cookie = experimentCookieName(form.id);
  if (!request.cookies.get(cookie)) {
    res.cookies.set(cookie, variant, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    });
  }
  return res;
}
