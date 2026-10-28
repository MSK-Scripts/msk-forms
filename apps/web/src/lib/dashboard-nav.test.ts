import { describe, expect, it } from "vitest";

import { scopeFromRole } from "./access";
import { dashboardAccess, GUILD_AREAS, visibleGuildAreas, type GuildArea } from "./dashboard-nav";

/** What the sidebar lists for a member with this role and these per-form grants. */
function areasFor(role: string | null, grantedFormIds: string[] = []): GuildArea[] {
  return visibleGuildAreas(dashboardAccess(role, scopeFromRole(role, grantedFormIds)));
}

const REVIEW: GuildArea[] = ["forms", "submissions", "board"];

describe("sidebar visibility per role", () => {
  it("shows every area to the owner and to an admin", () => {
    expect(areasFor("owner")).toEqual([...GUILD_AREAS]);
    expect(areasFor("admin")).toEqual([...GUILD_AREAS]);
  });

  it("shows a guild-wide reviewer forms, submissions and the board, and nothing to manage", () => {
    expect(areasFor("reviewer")).toEqual(REVIEW);
  });

  it("shows a viewer with a per-form grant the same review areas", () => {
    expect(areasFor("viewer", ["form-1"])).toEqual(REVIEW);
  });

  it("shows a viewer without grants no area at all", () => {
    expect(areasFor("viewer")).toEqual([]);
  });

  it("shows a non-member nothing, whatever grants are passed in", () => {
    expect(areasFor(null, ["form-1"])).toEqual([]);
  });

  it("never lists a settings area for someone who does not manage the guild", () => {
    const settings = GUILD_AREAS.filter((a) => !REVIEW.includes(a));
    for (const [role, grants] of [
      ["reviewer", []],
      ["viewer", ["form-1"]],
      ["viewer", []],
    ] as const) {
      expect(areasFor(role, [...grants]).filter((a) => settings.includes(a))).toEqual([]);
    }
  });

  it("follows the access flags, not the role name", () => {
    expect(visibleGuildAreas({ canManage: true, canReview: false })).toEqual(
      GUILD_AREAS.filter((a) => a !== "submissions" && a !== "board"),
    );
    expect(visibleGuildAreas({ canManage: false, canReview: true })).toEqual(REVIEW);
    expect(visibleGuildAreas({ canManage: false, canReview: false })).toEqual([]);
  });
});
