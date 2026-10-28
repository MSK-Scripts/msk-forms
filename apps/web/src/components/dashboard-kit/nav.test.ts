import { describe, expect, it } from "vitest";

import { Lock } from "@/components/icons";

import { currentNavId, type ShellNavGroup } from "./nav";

const nav: ShellNavGroup[] = [
  { id: "top", items: [{ id: "overview", href: "/dashboard/1", label: "Overview", icon: Lock }] },
  {
    id: "work",
    label: "Work",
    items: [
      { id: "forms", href: "/dashboard/1/forms", label: "Forms", icon: Lock },
      { id: "archive", href: "/dashboard/1/forms/archive", label: "Archive", icon: Lock },
      { id: "members", href: "/dashboard/1/members", label: "Members", icon: Lock, locked: "Needs a role" },
    ],
  },
];

describe("currentNavId", () => {
  it("prefers the item whose address is the path", () => {
    expect(currentNavId(nav, "/dashboard/1")).toBe("overview");
    expect(currentNavId(nav, "/dashboard/1/forms")).toBe("forms");
  });

  it("marks the deepest item a page lies below", () => {
    expect(currentNavId(nav, "/dashboard/1/forms/9/edit")).toBe("forms");
    expect(currentNavId(nav, "/dashboard/1/forms/archive/3")).toBe("archive");
    expect(currentNavId(nav, "/dashboard/1/board")).toBe("overview");
  });

  it("does not match a sibling that only shares a prefix of letters", () => {
    expect(currentNavId(nav, "/dashboard/1/formsx")).toBe("overview");
    expect(currentNavId(nav, "/dashboard/12")).toBeUndefined();
  });

  it("marks an exact item on its own address only", () => {
    const withHome: ShellNavGroup[] = [
      ...nav,
      { id: "account", items: [{ id: "all", href: "/dashboard", label: "All", icon: Lock, exact: true }] },
    ];
    expect(currentNavId(withHome, "/dashboard")).toBe("all");
    expect(currentNavId(withHome, "/dashboard/2/forms")).toBeUndefined();
  });

  it("never marks a locked item", () => {
    expect(currentNavId(nav, "/dashboard/1/members")).toBe("overview");
  });
});
