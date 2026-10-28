"use client";

import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { DataTable, type DataColumn } from "@/components/dashboard-kit";
import { Button } from "@/components/ui/button";

import { GuildIcon } from "./guild-icon";

export interface GuildRow {
  id: string;
  name: string;
  iconUrl: string | null;
  logoUrl: string | null;
  role: string;
  forms: number;
  submissions: number;
}

/** The servers a person is a member of, on the server list of the dashboard. */
export function GuildTable({
  rows,
  empty,
  copy,
}: {
  rows: GuildRow[];
  empty: ReactNode;
  copy: {
    caption: string;
    server: string;
    role: string;
    forms: string;
    submissions: string;
    open: string;
  };
}) {
  const columns: DataColumn<GuildRow>[] = [
    {
      id: "name",
      header: copy.server,
      sortValue: (g) => g.name.toLowerCase(),
      cell: (g) => (
        <Link
          href={`/dashboard/${g.id}/forms` as Route}
          prefetch={false}
          className="flex min-h-11 items-center gap-3 font-semibold text-foreground hover:text-primary"
        >
          <GuildIcon
            icon={g.iconUrl}
            logoUrl={g.logoUrl}
            name={g.name}
            size={36}
            className="h-9 w-9 rounded-md"
            fallbackTextClassName="bg-accent-soft font-display text-small font-bold uppercase text-primary"
          />
          <span translate="no" className="min-w-0 break-words">
            {g.name}
          </span>
        </Link>
      ),
    },
    {
      id: "role",
      header: copy.role,
      sortValue: (g) => g.role,
      cell: (g) => g.role,
      className: "align-middle",
    },
    {
      id: "forms",
      header: copy.forms,
      numeric: true,
      sortValue: (g) => g.forms,
      cell: (g) => g.forms,
      className: "align-middle",
    },
    {
      id: "submissions",
      header: copy.submissions,
      numeric: true,
      sortValue: (g) => g.submissions,
      cell: (g) => g.submissions,
      className: "align-middle",
    },
    {
      id: "open",
      sticky: true,
      header: <span className="sr-only">{copy.open}</span>,
      nowrap: true,
      className: "align-middle text-right",
      cell: (g) => (
        <Button asChild size="sm" variant="outline">
          <Link href={`/dashboard/${g.id}/forms` as Route} prefetch={false}>
            {copy.open}
            <span className="sr-only">
              : <span translate="no">{g.name}</span>
            </span>
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      caption={copy.caption}
      captionHidden
      columns={columns}
      rows={rows}
      rowKey={(g) => g.id}
      empty={empty}
      initialSort={{ column: "name", direction: "asc" }}
    />
  );
}
