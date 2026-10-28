import { describe, expect, it } from "vitest";

import { dictionaries } from "@/i18n/dictionaries";

import type { ShellCopy } from "./app-shell";
import type { CopyFieldCopy } from "./copy-field";
import type { GuildSwitcherCopy } from "./guild-switcher";
import type { SaveBarCopy } from "./save-bar";

/** Every string of a nested dictionary section. */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe("kit copy", () => {
  it.each(Object.entries(dictionaries))("%s fits the kit components and has no empty string", (_locale, dict) => {
    // Assignments, so `tsc` fails when the dictionary and the components drift apart.
    const shell: ShellCopy = dict.kit.shell;
    const switcher: GuildSwitcherCopy = dict.kit.guildSwitcher;
    const copyField: CopyFieldCopy = dict.kit.copyField;
    const saveBar: SaveBarCopy = dict.kit.saveBar;
    const all = strings([shell, switcher, copyField, saveBar, dict.kit.breadcrumb, dict.kit.dismiss]);
    expect(all.filter((s) => s.trim() === "")).toEqual([]);
  });

  it("no visible copy of any language contains an em dash", () => {
    // The exclusion list of DESIGN.md: no em dashes in visible copy.
    const offenders = Object.entries(dictionaries).flatMap(([locale, dict]) =>
      strings(dict)
        .filter((s) => s.includes("—"))
        .map((s) => `${locale}: ${s}`),
    );
    expect(offenders).toEqual([]);
  });
});
