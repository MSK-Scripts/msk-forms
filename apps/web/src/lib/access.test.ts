import { describe, expect, it } from "vitest";

import {
  countsTowardTeam,
  isGlobalReviewerRole,
  isManagerRole,
  manageScopeFromRole,
  scopeFromRole,
} from "./access";

describe("isManagerRole", () => {
  it("is true only for owner/admin", () => {
    expect(isManagerRole("owner")).toBe(true);
    expect(isManagerRole("admin")).toBe(true);
    expect(isManagerRole("reviewer")).toBe(false);
    expect(isManagerRole("viewer")).toBe(false);
    expect(isManagerRole(null)).toBe(false);
  });
});

describe("isGlobalReviewerRole", () => {
  it("is true for owner/admin/reviewer", () => {
    for (const r of ["owner", "admin", "reviewer"]) expect(isGlobalReviewerRole(r)).toBe(true);
    expect(isGlobalReviewerRole("viewer")).toBe(false);
    expect(isGlobalReviewerRole(null)).toBe(false);
  });
});

describe("scopeFromRole", () => {
  it("grants all forms to guild-wide reviewers (grants ignored)", () => {
    expect(scopeFromRole("owner", ["f1"])).toEqual({ all: true, formIds: [] });
    expect(scopeFromRole("admin", [])).toEqual({ all: true, formIds: [] });
    expect(scopeFromRole("reviewer", [])).toEqual({ all: true, formIds: [] });
  });

  it("scopes a viewer to their granted forms", () => {
    expect(scopeFromRole("viewer", ["f1", "f2"])).toEqual({ all: false, formIds: ["f1", "f2"] });
  });

  it("grants nothing to a viewer with no grants or a non-member", () => {
    expect(scopeFromRole("viewer", [])).toEqual({ all: false, formIds: [] });
    expect(scopeFromRole(null, ["f1"])).toEqual({ all: false, formIds: [] });
  });
});

describe("manageScopeFromRole", () => {
  it("lets guild managers manage every form (grants ignored)", () => {
    expect(manageScopeFromRole("owner", ["f1"])).toEqual({ all: true, formIds: [] });
    expect(manageScopeFromRole("admin", [])).toEqual({ all: true, formIds: [] });
  });

  it("does not treat a guild-wide reviewer as a manager", () => {
    expect(manageScopeFromRole("reviewer", ["f1"])).toEqual({ all: false, formIds: ["f1"] });
  });

  it("scopes a viewer to their per-form manage grants", () => {
    expect(manageScopeFromRole("viewer", ["f1"])).toEqual({ all: false, formIds: ["f1"] });
    expect(manageScopeFromRole("viewer", [])).toEqual({ all: false, formIds: [] });
    expect(manageScopeFromRole(null, ["f1"])).toEqual({ all: false, formIds: [] });
  });
});

describe("countsTowardTeam", () => {
  it("counts managers and global reviewers regardless of grants", () => {
    expect(countsTowardTeam("owner", false)).toBe(true);
    expect(countsTowardTeam("admin", false)).toBe(true);
    expect(countsTowardTeam("reviewer", false)).toBe(true);
  });

  it("counts a viewer only when they have a per-form grant", () => {
    expect(countsTowardTeam("viewer", true)).toBe(true);
    expect(countsTowardTeam("viewer", false)).toBe(false);
  });
});
