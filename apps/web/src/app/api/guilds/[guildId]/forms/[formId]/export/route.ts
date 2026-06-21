import { prisma } from "@msk-forms/db";
import { formatAnswerValue, isLayoutField } from "@msk-forms/shared";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { parseFormSpec, resolveStatus } from "@/lib/forms";
import { canReviewSubmissions } from "@/lib/guild";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Quote a CSV cell when it contains a delimiter, quote, or newline. */
function csvCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * Export a form's submissions as CSV. Reviewer-only, rate-limited. Columns are
 * the form's non-layout fields (in spec order) plus id/date/status/applicant;
 * cells reuse the shared answer formatter so they match the dashboard.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guildId: string; formId: string }> },
) {
  const { guildId, formId } = await params;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!(await canReviewSubmissions(guildId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const rl = await rateLimit(`export:${clientIp(request.headers)}`, 10, 60);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: { guildId: true, title: true, slug: true, schema: true },
  });
  if (!form || form.guildId !== guildId) {
    return NextResponse.json({ error: "Form not found." }, { status: 404 });
  }

  const spec = parseFormSpec(form.schema);
  if (!spec) return NextResponse.json({ error: "Form is misconfigured." }, { status: 500 });

  const [submissions, defs] = await Promise.all([
    prisma.submission.findMany({
      where: { formId, guildId },
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        status: true,
        answers: true,
        submittedAt: true,
        user: { select: { username: true } },
      },
    }),
    prisma.formStatusDef.findMany({
      where: { guildId },
      select: { key: true, label: true, color: true },
    }),
  ]);

  const fields = spec.pages.flatMap((p) => p.fields).filter((f) => !isLayoutField(f.type));
  const labels = { empty: "", yes: "Yes", no: "No" };

  const header = ["Submission ID", "Submitted", "Status", "Applicant", ...fields.map((f) => f.label ?? f.id)];
  const lines = [header.map(csvCell).join(",")];
  for (const s of submissions) {
    const answers = (s.answers ?? {}) as Record<string, unknown>;
    const row = [
      s.id,
      s.submittedAt.toISOString(),
      resolveStatus(s.status, defs).label,
      s.user?.username ?? "Anonymous",
      ...fields.map((f) => formatAnswerValue(f, answers[f.id], labels)),
    ];
    lines.push(row.map((c) => csvCell(String(c))).join(","));
  }

  // Prepend a UTF-8 BOM so Excel opens non-ASCII answers correctly.
  const body = "﻿" + lines.join("\r\n");
  const filename = `${form.slug || "submissions"}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
