import { describe, expect, it } from "vitest";

import { sortRows } from "./sort-rows";

type Row = { name: string; count: number | null };

const rows: Row[] = [
  { name: "Form 10", count: 3 },
  { name: "form 2", count: null },
  { name: "Form 1", count: 7 },
  { name: "Form 3", count: 3 },
];
const columns = [
  { id: "name", sortValue: (r: Row) => r.name },
  { id: "count", sortValue: (r: Row) => r.count },
  { id: "actions" },
];
const names = (list: Row[]) => list.map((r) => r.name);

describe("sortRows", () => {
  it("sorts text naturally and without regard to case", () => {
    expect(names(sortRows(rows, columns, { column: "name", direction: "asc" }))).toEqual([
      "Form 1",
      "form 2",
      "Form 3",
      "Form 10",
    ]);
  });

  it("keeps empty values last in both directions and equal rows in their order", () => {
    expect(names(sortRows(rows, columns, { column: "count", direction: "asc" }))).toEqual([
      "Form 10",
      "Form 3",
      "Form 1",
      "form 2",
    ]);
    expect(names(sortRows(rows, columns, { column: "count", direction: "desc" }))).toEqual([
      "Form 1",
      "Form 10",
      "Form 3",
      "form 2",
    ]);
  });

  it("leaves the order alone without a sortable column", () => {
    expect(sortRows(rows, columns, null)).toEqual(rows);
    expect(sortRows(rows, columns, { column: "actions", direction: "asc" })).toEqual(rows);
  });
});
