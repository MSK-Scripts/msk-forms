/**
 * Sorting of the DataTable, in a module without "use client" so server code
 * and tests can call it too.
 */

export type SortDirection = "asc" | "desc";

export interface SortState {
  column: string;
  direction: SortDirection;
}

type SortValue = string | number | null | undefined;

function compare(a: SortValue, b: SortValue): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

/**
 * Sorted copy of `rows` by the column's `sortValue`; stable, so equal rows
 * keep the order they came in, and empty values stay at the end whichever way
 * the column is sorted.
 */
export function sortRows<Row>(
  rows: readonly Row[],
  columns: readonly { id: string; sortValue?: (row: Row) => SortValue }[],
  sort: SortState | null,
): Row[] {
  const column = sort ? columns.find((c) => c.id === sort.column) : undefined;
  if (!sort || !column?.sortValue) return [...rows];
  const value = column.sortValue;
  const sign = sort.direction === "asc" ? 1 : -1;
  return rows
    .map((row, index) => ({ row, index }))
    .sort((x, y) => {
      const a = value(x.row);
      const b = value(y.row);
      if (a == null || b == null) return compare(a, b) || x.index - y.index;
      return sign * compare(a, b) || x.index - y.index;
    })
    .map(({ row }) => row);
}
