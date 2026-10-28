"use client";

import type { ReactNode } from "react";

import { DataTable, type DataColumn } from "@/components/dashboard-kit";
import { Badge } from "@/components/ui/badge";

export interface ExperimentResultRow {
  id: string;
  name: string;
  views: number;
  submissions: number;
  /** Submissions per view, null while the variant has no views. */
  rate: number | null;
  /** The figures as the viewer's language writes them. */
  viewsLabel: string;
  submissionsLabel: string;
  /** The rate in percent, or "No views yet". */
  rateLabel: string;
  leading: boolean;
}

export interface ExperimentResultsCopy {
  caption: string;
  variant: string;
  views: string;
  submissions: string;
  rate: string;
  winner: string;
}

/** The A/B results per variant: views, submissions and conversion, sortable. */
export function ExperimentResultsTable({
  rows,
  copy,
  empty,
}: {
  rows: ExperimentResultRow[];
  copy: ExperimentResultsCopy;
  empty: ReactNode;
}) {
  const columns: DataColumn<ExperimentResultRow>[] = [
    {
      id: "variant",
      header: copy.variant,
      sortValue: (r) => r.name.toLowerCase(),
      cell: (r) => (
        <span className="flex flex-wrap items-center gap-2">
          <span translate="no" className="font-semibold break-words">
            {r.name}
          </span>
          {r.leading && <Badge>{copy.winner}</Badge>}
        </span>
      ),
    },
    {
      id: "views",
      header: copy.views,
      numeric: true,
      sortValue: (r) => r.views,
      cell: (r) => r.viewsLabel,
    },
    {
      id: "submissions",
      header: copy.submissions,
      numeric: true,
      sortValue: (r) => r.submissions,
      cell: (r) => r.submissionsLabel,
    },
    {
      id: "rate",
      header: copy.rate,
      numeric: true,
      sortValue: (r) => r.rate,
      cell: (r) =>
        r.rate === null ? (
          <span className="text-muted-foreground">{r.rateLabel}</span>
        ) : (
          <span className="font-semibold">{r.rateLabel}</span>
        ),
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
    />
  );
}
