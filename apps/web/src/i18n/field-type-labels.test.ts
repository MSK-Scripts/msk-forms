import { FIELD_TYPES } from "@msk-forms/shared";
import { describe, expect, it } from "vitest";

import { dictionaries } from "./dictionaries";

describe("builder field type labels", () => {
  // The builder falls back to the raw type key for a missing label, so an
  // imported form with, say, `steam_hex` would show that key to the owner.
  it.each(Object.entries(dictionaries))("%s has a label for every field type", (_, dict) => {
    const labels = dict.builder.ft as Record<string, string>;
    const missing = FIELD_TYPES.filter((type) => !labels[type]);
    expect(missing).toEqual([]);
  });
});
