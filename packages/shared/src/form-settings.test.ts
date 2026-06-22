import { describe, expect, it } from "vitest";

import { evaluateAutomations, parseFormSettings, type AutomationRule } from "./form-settings.js";

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
