import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("keeps a text colour beside a size of the type scale", () => {
    expect(cn("text-primary-foreground", "text-lead")).toBe("text-primary-foreground text-lead");
  });

  it("lets a later size of the type scale replace an earlier size", () => {
    expect(cn("text-sm", "text-lead")).toBe("text-lead");
    expect(cn("text-label", "text-small")).toBe("text-small");
  });
});
