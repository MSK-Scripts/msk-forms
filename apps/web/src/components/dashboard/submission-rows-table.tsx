"use client";

import { SubmissionStatusBadge } from "@msk-forms/ui";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { DataTable, type DataColumn } from "@/components/dashboard-kit";
import { LocalDateTime } from "@/components/public/local-datetime";
import { dotColors } from "@/lib/color-dot";

export interface SubmissionRow {
  id: string;
  applicant: string | null;
  /** The form's title, when the list spans several forms. */
  form?: string;
  submittedAt: string;
  status: { label: string; color: string };
}

/**
 * A plain, read-only list of submissions (an archived form's, the archived
 * ones of a guild): applicant, form, date and status, each row opening the
 * submission. The working list with filters and bulk actions is
 * SubmissionsTable.
 */
export function SubmissionRowsTable({
  guildId,
  rows,
  empty,
  copy,
}: {
  guildId: string;
  rows: SubmissionRow[];
  empty: ReactNode;
  copy: { caption: string; applicant: string; anonymous: string; form?: string; date: string; status: string };
}) {
  const columns: DataColumn<SubmissionRow>[] = [
    {
      id: "applicant",
      header: copy.applicant,
      sortValue: (r) => (r.applicant ?? "").toLowerCase(),
      cell: (r) => (
        <Link
          href={`/dashboard/${guildId}/submissions/${r.id}` as Route}
          prefetch={false}
          translate={r.applicant ? "no" : undefined}
          className="inline-flex min-h-11 items-center font-semibold text-primary hover:underline"
        >
          {r.applicant ?? copy.anonymous}
        </Link>
      ),
    },
    ...(copy.form
      ? [
          {
            id: "form",
            header: copy.form,
            sortValue: (r: SubmissionRow) => (r.form ?? "").toLowerCase(),
            cell: (r: SubmissionRow) => r.form,
            className: "align-middle",
          },
        ]
      : []),
    {
      id: "date",
      header: copy.date,
      sortValue: (r) => r.submittedAt,
      nowrap: true,
      className: "align-middle tabular-nums",
      cell: (r) => <LocalDateTime iso={r.submittedAt} />,
    },
    {
      id: "status",
      header: copy.status,
      sortValue: (r) => r.status.label,
      nowrap: true,
      className: "align-middle",
      cell: (r) => <SubmissionStatusBadge label={r.status.label} {...dotColors(r.status.color)} />,
    },
  ];

  return (
    <DataTable
      caption={copy.caption}
      captionHidden
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      empty={empty}
      initialSort={{ column: "date", direction: "desc" }}
    />
  );
}
