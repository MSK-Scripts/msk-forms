import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { isReservedHandle } from "@msk-forms/shared";
import { describe, expect, it } from "vitest";

/**
 * `/[handle]` serves a guild's form index at forms.msk-scripts.de/<handle>.
 * Every explicit top-level route wins over it, and its name must be a
 * reserved handle, or a guild could pick a handle that never resolves.
 *
 * Route groups such as `(site)` add nothing to an address, so a page moved
 * into one is still a top-level route; this test looks through them, where a
 * glance at `src/app` would miss it.
 */

const APP_DIR = fileURLToPath(new URL("../app/", import.meta.url));

function topLevelSegments(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (!statSync(path).isDirectory()) return [];
    if (/^\(.+\)$/.test(name)) return topLevelSegments(path); // route group: look inside
    if (name.startsWith("[") || name.startsWith("_") || name.startsWith("@")) return [];
    return [name];
  });
}

describe("top-level routes", () => {
  const segments = topLevelSegments(APP_DIR);

  it("finds the pages inside route groups", () => {
    expect(segments).toEqual(expect.arrayContaining(["pricing", "stats", "terms", "dashboard", "f", "s", "g", "offline", "api"]));
  });

  it.each(segments)("/%s is a reserved handle", (segment) => {
    expect(isReservedHandle(segment)).toBe(true);
  });
});
