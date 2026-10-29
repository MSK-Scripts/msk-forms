import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();
const count = vi.fn();
vi.mock("@msk-forms/db", () => ({ prisma: { submission: { findMany, count } } }));

const { getGuildSubmissions, SUBMISSION_LIST_LIMIT } = await import("./guild");

const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `s${i}` }));

describe("getGuildSubmissions", () => {
  beforeEach(() => {
    findMany.mockReset();
    count.mockReset();
  });

  it("loads up to the list limit, newest first", async () => {
    findMany.mockResolvedValue(rows(3));
    await getGuildSubmissions("g1", { all: true, formIds: [] });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: SUBMISSION_LIST_LIMIT, orderBy: { submittedAt: "desc" } }),
    );
  });

  it("uses the row count as total below the limit, without a count query", async () => {
    findMany.mockResolvedValue(rows(3));
    const result = await getGuildSubmissions("g1", { all: true, formIds: [] });
    expect(result.total).toBe(3);
    expect(result.rows).toHaveLength(3);
    expect(count).not.toHaveBeenCalled();
  });

  it("counts the real total when the limit cut the list", async () => {
    findMany.mockResolvedValue(rows(SUBMISSION_LIST_LIMIT));
    count.mockResolvedValue(SUBMISSION_LIST_LIMIT + 234);
    const result = await getGuildSubmissions("g1", { all: false, formIds: ["f1"] });
    expect(result.total).toBe(SUBMISSION_LIST_LIMIT + 234);
    expect(result.rows).toHaveLength(SUBMISSION_LIST_LIMIT);
    // The count uses the same filter as the list, scope included.
    expect(count).toHaveBeenCalledWith({ where: findMany.mock.calls[0][0].where });
    expect(count.mock.calls[0][0].where.formId).toEqual({ in: ["f1"] });
  });

  it("returns nothing for a reviewer without grants, without touching the database", async () => {
    const result = await getGuildSubmissions("g1", { all: false, formIds: [] });
    expect(result).toEqual({ rows: [], total: 0 });
    expect(findMany).not.toHaveBeenCalled();
  });
});
