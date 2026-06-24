import { describe, expect, it } from "vitest";

import {
  evaluateAutomations,
  experimentActive,
  parseFormSettings,
  pickVariant,
  type AutomationRule,
  type ExperimentVariant,
} from "./form-settings.js";

describe("evaluateAutomations", () => {
  const answers = { score: 85, age: 16, country: "de" };

  it("returns the first matching rule's status (conditions are AND-combined)", () => {
    const rules: AutomationRule[] = [
      { when: [{ field: "score", op: "greater_than", value: 90 }], setStatus: "accepted" },
      {
        when: [
          { field: "score", op: "greater_than", value: 80 },
          { field: "country", op: "equals", value: "de" },
        ],
        setStatus: "in_review",
      },
    ];
    expect(evaluateAutomations(rules, answers)).toBe("in_review");
  });

  it("treats an empty condition list as always matching", () => {
    expect(evaluateAutomations([{ when: [], setStatus: "accepted" }], answers)).toBe("accepted");
  });

  it("returns null when no rule matches", () => {
    const rules: AutomationRule[] = [
      { when: [{ field: "age", op: "greater_than", value: 17 }], setStatus: "rejected" },
    ];
    expect(evaluateAutomations(rules, answers)).toBeNull();
  });
});

describe("parseFormSettings", () => {
  it("defaults automations to an empty array", () => {
    expect(parseFormSettings(undefined)).toEqual({ automations: [] });
    expect(parseFormSettings({ acceptedRoleId: "123456789012345678" }).automations).toEqual([]);
  });

  it("keeps valid automation rules and drops invalid blobs", () => {
    const parsed = parseFormSettings({
      automations: [{ when: [{ field: "x", op: "equals", value: "y" }], setStatus: "accepted" }],
    });
    expect(parsed.automations).toHaveLength(1);
    expect(parseFormSettings({ automations: [{ setStatus: "" }] }).automations).toEqual([]);
  });
});

describe("experiment helpers", () => {
  const variants: ExperimentVariant[] = [
    { id: "a", name: "A", weight: 1 },
    { id: "b", name: "B", weight: 3 },
  ];

  it("experimentActive needs enabled + at least two variants", () => {
    expect(experimentActive(undefined)).toBe(false);
    expect(experimentActive({ enabled: false, variants })).toBe(false);
    expect(experimentActive({ enabled: true, variants: [variants[0]!] })).toBe(false);
    expect(experimentActive({ enabled: true, variants })).toBe(true);
  });

  it("pickVariant respects weights across the [0,1) range", () => {
    // total weight 4: a covers [0, 0.25), b covers [0.25, 1).
    expect(pickVariant(variants, 0)).toBe("a");
    expect(pickVariant(variants, 0.24)).toBe("a");
    expect(pickVariant(variants, 0.25)).toBe("b");
    expect(pickVariant(variants, 0.99)).toBe("b");
  });

  it("pickVariant skips zero-weight variants and returns null when all are zero", () => {
    expect(pickVariant([{ id: "x", name: "X", weight: 0 }], 0.5)).toBeNull();
    expect(
      pickVariant(
        [
          { id: "x", name: "X", weight: 0 },
          { id: "y", name: "Y", weight: 5 },
        ],
        0.5,
      ),
    ).toBe("y");
  });
});
