import { prisma } from "@msk-forms/db";
import ExcelJS from "exceljs";
import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getSubmissionsTable } from "@/lib/forms";
import { canReviewSubmissions } from "@/lib/guild";
import { submissionsPdf } from "@/lib/pdf";
import { isGuildPro } from "@/lib/plan";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getDict } from "@/i18n";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Supported export formats. Free guilds get CSV only; the rest are Pro+. */
const FORMATS = ["csv", "json", "xlsx", "pdf"] as const;
type ExportFormat = (typeof FORMATS)[number];

/** Quote a CSV cell when it contains a delimiter, quote, or newline. */
function csvCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * Export a form's submissions. Reviewer-only, rate-limited. Columns are the
 * form's non-layout fields (in spec order) plus id/date/status/applicant; cells
 * reuse the shared answer formatter so they match the dashboard. CSV is on every
 * plan; JSON and XLSX are Pro+ (concept §21).
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

  const fmt = request.nextUrl.searchParams.get("format") ?? "csv";
  if (!FORMATS.includes(fmt as ExportFormat)) {
    return NextResponse.json({ error: "Unknown format." }, { status: 422 });
  }
  const format = fmt as ExportFormat;
  if (format !== "csv" && !(await isGuildPro(guildId))) {
    return NextResponse.json(
      { error: "This export format requires Pro.", code: "pro_required" },
      { status: 402 },
    );
  }

  const rl = await rateLimit(`export:${clientIp(request.headers)}`, 10, 60);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: { slug: true },
  });

  const statusLabels = (await getDict()).statusLabels;
  const table = await getSubmissionsTable(formId, guildId, statusLabels);
  if (!form || !table) {
    return NextResponse.json({ error: "Form not found." }, { status: 404 });
  }
  const { columns, rows } = table;

  const base = `${form.slug || "submissions"}-${new Date().toISOString().slice(0, 10)}`;
  const download = (body: BodyInit, type: string, ext: string) =>
    new NextResponse(body, {
      headers: {
        "Content-Type": type,
        "Content-Disposition": `attachment; filename="${base}.${ext}"`,
        "Cache-Control": "no-store",
      },
    });

  if (format === "json") {
    const data = rows.map((r) => Object.fromEntries(columns.map((c, i) => [c, r[i]])));
    return download(JSON.stringify(data, null, 2), "application/json; charset=utf-8", "json");
  }

  if (format === "pdf") {
    const pdf = await submissionsPdf(table);
    return download(Buffer.from(pdf), "application/pdf", "pdf");
  }

  if (format === "xlsx") {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Submissions");
    sheet.addRow(columns).font = { bold: true };
    rows.forEach((r) => sheet.addRow(r));
    const buffer = await workbook.xlsx.writeBuffer();
    return download(
      Buffer.from(buffer),
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "xlsx",
    );
  }

  // CSV (default). Prepend a UTF-8 BOM so Excel opens non-ASCII answers correctly.
  const lines = [columns, ...rows].map((r) => r.map((c) => csvCell(String(c))).join(","));
  return download("﻿" + lines.join("\r\n"), "text/csv; charset=utf-8", "csv");
}
