"use client";

import { SubmissionStatusBadge } from "@msk-forms/ui";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { DataTable, type DataColumn } from "@/components/dashboard-kit";
import { LocalDateTime } from "@/components/public/local-datetime";

export interface MySubmissionRow {
  id: string;
  form: string;
  guild: string;
  submittedAt: string;
  status: { label: string; color: string };
}

/** The person's own submissions across all servers, each leading to its status page. */
export function MySubmissionsTable({
  rows,
  empty,
  copy,
}: {
  rows: MySubmissionRow[];
  empty: ReactNode;
  copy: { caption: string; form: string; server: string; date: string; status: string };
}) {
  const columns: DataColumn<MySubmissionRow>[] = [
    {
      id: "form",
      header: copy.form,
      sortValue: (r) => r.form.toLowerCase(),
      cell: (r) => (
        <Link
          href={`/s/${r.id}` as Route}
          prefetch={false}
          translate="no"
          className="inline-flex min-h-11 items-center font-semibold text-primary hover:underline"
        >
          {r.form}
        </Link>
      ),
    },
    {
      id: "server",
      header: copy.server,
      sortValue: (r) => r.guild.toLowerCase(),
      cell: (r) => <span translate="no">{r.guild}</span>,
      className: "align-middle",
    },
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
      cell: (r) => <SubmissionStatusBadge label={r.status.label} color={r.status.color} />,
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
