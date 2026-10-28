"use client";

import { useId, useMemo, useState, type ReactNode } from "react";

import { CaretDown, CaretUp, CaretUpDown } from "@/components/icons";
import { cn } from "@/lib/utils";

import { sortRows, type SortState } from "./sort-rows";

export interface DataColumn<Row> {
  id: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  /** Makes the column sortable. Null values sort last in both directions. */
  sortValue?: (row: Row) => string | number | null | undefined;
  /** Numbers right-aligned with tabular figures. */
  numeric?: boolean;
  /** Column for the row's actions or status: never wraps. */
  nowrap?: boolean;
  className?: string;
}

/**
 * The data table of the dashboard.
 *
 * - A caption names the table; it may be visually hidden when the page head
 *   already says it.
 * - Sortable headers are buttons, and `aria-sort` on the header cell tells a
 *   screen reader the order. The sign shows it to everyone else.
 * - The table scrolls in its own container, never the page (WCAG 1.4.10);
 *   the container is focusable so a keyboard can scroll it, and the header
 *   row stays in view while the rows scroll.
 * - No rows: one row with the empty state across all columns, so the headers
 *   still say what would be there.
 *
 * Sorting is local by default. A server that sorts and pages passes `sort`
 * and `onSortChange` and hands over the rows in their order.
 */
export function DataTable<Row>({
  caption,
  captionHidden = false,
  columns,
  rows,
  rowKey,
  empty,
  initialSort = null,
  sort: controlledSort,
  onSortChange,
  footer,
  className,
}: {
  caption: string;
  captionHidden?: boolean;
  columns: DataColumn<Row>[];
  rows: readonly Row[];
  rowKey: (row: Row) => string;
  /** The EmptyState for no rows. */
  empty: ReactNode;
  initialSort?: SortState | null;
  sort?: SortState | null;
  onSortChange?: (sort: SortState) => void;
  /** Pagination or totals below the table. */
  footer?: ReactNode;
  className?: string;
}) {
  const captionId = useId();
  const [localSort, setLocalSort] = useState<SortState | null>(initialSort);
  const controlled = controlledSort !== undefined;
  const sort = controlled ? controlledSort : localSort;

  const shown = useMemo(
    () => (controlled ? [...rows] : sortRows(rows, columns, sort)),
    [controlled, rows, columns, sort],
  );

  function toggle(column: string) {
    const next: SortState =
      sort?.column === column && sort.direction === "asc"
        ? { column, direction: "desc" }
        : { column, direction: "asc" };
    if (!controlled) setLocalSort(next);
    onSortChange?.(next);
  }

  return (
    <div className={cn("grid gap-3", className)}>
      <div
        role="region"
        aria-labelledby={captionId}
        tabIndex={0}
        className="relative max-h-[min(75dvh,56rem)] overflow-auto rounded-lg border border-border bg-card"
      >
        <table className="w-full border-collapse text-small">
          <caption id={captionId} className={cn("px-4 py-3 text-left font-semibold", captionHidden && "sr-only")}>
            {caption}
          </caption>
          <thead className="sticky top-0 z-10 bg-muted">
            <tr>
              {columns.map((col) => {
                const active = sort?.column === col.id ? sort.direction : null;
                const SortIcon = active === "asc" ? CaretUp : active === "desc" ? CaretDown : CaretUpDown;
                return (
                  <th
                    key={col.id}
                    scope="col"
                    aria-sort={
                      col.sortValue
                        ? active === "asc"
                          ? "ascending"
                          : active === "desc"
                            ? "descending"
                            : "none"
                        : undefined
                    }
                    className={cn(
                      "border-b border-border px-3 py-2 text-left align-middle font-semibold text-foreground",
                      col.numeric && "text-right",
                      col.nowrap && "whitespace-nowrap",
                    )}
                  >
                    {col.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggle(col.id)}
                        className={cn(
                          // 36 px: inside a dense table the smaller target is allowed.
                          "-mx-1 inline-flex min-h-9 items-center gap-1 rounded-sm px-1 hover:text-primary",
                          col.numeric && "flex-row-reverse",
                          active && "text-primary",
                        )}
                      >
                        {col.header}
                        <SortIcon className="h-4 w-4 shrink-0" />
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>{empty}</td>
              </tr>
            ) : (
              shown.map((row) => (
                <tr key={rowKey(row)} className="border-b border-border last:border-b-0 hover:bg-muted/50">
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={cn(
                        "px-3 py-2.5 align-top",
                        col.numeric && "text-right tabular-nums",
                        col.nowrap && "whitespace-nowrap",
                        col.className,
                      )}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  );
}
