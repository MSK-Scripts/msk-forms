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
  /**
   * Keeps the column at the inline end while the rest of a wide table
   * scrolls sideways beneath it: the row's actions, so they stay in reach on
   * a phone without scrolling the row first.
   */
  sticky?: boolean;
  className?: string;
}

// The sticky column needs a solid ground: the card, and on a hovered row the
// same tint the other cells show (muted at 50 % over the card, mixed in
// sRGB as the browser blends it). A hairline marks where the rows pass under.
const STICKY_CELL =
  "sticky end-0 bg-card shadow-[inset_1px_0_0_hsl(var(--border))] [tr:hover>&]:bg-[color-mix(in_srgb,hsl(var(--muted))_50%,hsl(var(--card)))]";

/**
 * The data table of the dashboard.
 *
 * - A caption names the table; it may be visually hidden when the page head
 *   already says it.
 * - Sortable headers are buttons, and `aria-sort` on the header cell tells a
 *   screen reader the order. The sign shows it to everyone else.
 * - The table scrolls in its own container, never the page (WCAG 1.4.10);
 *   the container is focusable so a keyboard can scroll it, and the header
 *   row stays in view while the rows scroll. The container is at most as
 *   tall as the window below the top bar (and above the tab bar of a
 *   phone), so it only scrolls in itself when the table is taller than the
 *   window, never leaving empty space below it on a tall screen.
 * - A `sticky` column (the row's actions) stays at the inline end while a
 *   wide table scrolls sideways.
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
        className="relative max-h-[calc(100dvh-var(--app-topbar)-5px-var(--app-tabbar)-var(--app-gutter-y))] overflow-auto rounded-lg border border-border bg-card lg:max-h-[calc(100dvh-var(--app-topbar)-5px-var(--app-gutter-y))]"
      >
        <table className="w-full border-collapse text-small">
          <caption
            id={captionId}
            className={cn("px-4 py-3 text-left font-semibold", captionHidden && "sr-only")}
          >
            {caption}
          </caption>
          <thead className="sticky top-0 z-10 bg-muted">
            <tr>
              {columns.map((col) => {
                const active = sort?.column === col.id ? sort.direction : null;
                const SortIcon =
                  active === "asc" ? CaretUp : active === "desc" ? CaretDown : CaretUpDown;
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
                      col.sticky &&
                        "sticky end-0 bg-muted shadow-[inset_1px_0_0_hsl(var(--border))]",
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
                <tr
                  key={rowKey(row)}
                  className="border-b border-border last:border-b-0 hover:bg-muted/50"
                >
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={cn(
                        "px-3 py-2.5 align-top",
                        col.numeric && "text-right tabular-nums",
                        col.nowrap && "whitespace-nowrap",
                        col.sticky && STICKY_CELL,
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
