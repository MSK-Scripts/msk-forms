"use client";

import {
  isLayoutField,
  type AutomationCondition,
  type AutomationRule,
  type FormField,
} from "@msk-forms/shared";
import { Input, Select } from "@msk-forms/ui";

import type { Dictionary } from "@/i18n";

type BuilderDict = Dictionary["builder"];
type StatusOption = { value: string; label: string };

const NO_VALUE_OPS = ["is_empty", "is_not_empty"];

/**
 * Form-level "when-then" automation editor (concept §20). Each rule sets the
 * submission status when all of its conditions match on creation. V1 action:
 * set status.
 */
export function AutomationsEditor({
  automations,
  fields,
  statusOptions,
  onChange,
  t,
}: {
  automations: AutomationRule[];
  fields: FormField[];
  statusOptions: StatusOption[];
  onChange: (rules: AutomationRule[]) => void;
  t: BuilderDict;
}) {
  const usable = fields.filter((f) => !isLayoutField(f.type));
  const fallbackStatus = statusOptions[0]?.value ?? "accepted";

  const opOptions = [
    { value: "equals", label: t.cond.opEquals },
    { value: "not_equals", label: t.cond.opNotEquals },
    { value: "contains", label: t.cond.opContains },
    { value: "greater_than", label: t.cond.opGreater },
    { value: "less_than", label: t.cond.opLess },
    { value: "is_empty", label: t.cond.opEmpty },
    { value: "is_not_empty", label: t.cond.opNotEmpty },
    { value: "in_list", label: t.cond.opInList },
  ];

  function replaceRule(i: number, rule: AutomationRule) {
    onChange(automations.map((r, j) => (j === i ? rule : r)));
  }
  function addRule() {
    onChange([...automations, { when: [], setStatus: fallbackStatus }]);
  }
  function removeRule(i: number) {
    onChange(automations.filter((_, j) => j !== i));
  }
  function addCondition(ri: number) {
    const rule = automations[ri]!;
    replaceRule(ri, {
      ...rule,
      when: [...rule.when, { field: usable[0]!.id, op: "equals", value: "" }],
    });
  }
  function replaceCondition(ri: number, ci: number, cond: AutomationCondition) {
    const rule = automations[ri]!;
    replaceRule(ri, { ...rule, when: rule.when.map((c, j) => (j === ci ? cond : c)) });
  }
  function removeCondition(ri: number, ci: number) {
    const rule = automations[ri]!;
    replaceRule(ri, { ...rule, when: rule.when.filter((_, j) => j !== ci) });
  }

  function valueText(cond: AutomationCondition): string {
    const v = cond.value;
    return Array.isArray(v) ? v.join(", ") : v == null ? "" : String(v);
  }
  function parseValue(cond: AutomationCondition, raw: string): AutomationCondition["value"] {
    if (cond.op === "in_list") return raw.split(",").map((s) => s.trim()).filter(Boolean);
    return raw;
  }

  if (usable.length === 0) {
    return <p className="text-xs text-muted-foreground">{t.autom.noFields}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {automations.map((rule, ri) => (
        <div key={ri} className="flex flex-col gap-2 rounded-md border border-border p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.autom.thenSet}
            </span>
            <Select
              value={rule.setStatus}
              onChange={(e) => replaceRule(ri, { ...rule, setStatus: e.target.value })}
              options={statusOptions}
            />
            <button
              type="button"
              aria-label={t.autom.removeRule}
              onClick={() => removeRule(ri)}
              className="ml-auto text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            {rule.when.length === 0 ? t.autom.always : t.autom.whenAll}
          </p>

          {rule.when.map((cond, ci) => (
            <div key={ci} className="flex flex-wrap items-center gap-2">
              <Select
                value={cond.field}
                onChange={(e) => replaceCondition(ri, ci, { ...cond, field: e.target.value })}
                options={usable.map((f) => ({ value: f.id, label: f.label || f.id }))}
              />
              <Select
                value={cond.op}
                onChange={(e) =>
                  replaceCondition(ri, ci, { ...cond, op: e.target.value as AutomationCondition["op"] })
                }
                options={opOptions}
              />
              {!NO_VALUE_OPS.includes(cond.op) && (
                <Input
                  value={valueText(cond)}
                  placeholder={t.autom.valuePh}
                  onChange={(e) =>
                    replaceCondition(ri, ci, { ...cond, value: parseValue(cond, e.target.value) })
                  }
                />
              )}
              <button
                type="button"
                aria-label={t.autom.removeCondition}
                onClick={() => removeCondition(ri, ci)}
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => addCondition(ri)}
            className="self-start text-xs font-medium text-primary hover:underline"
          >
            + {t.autom.addCondition}
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addRule}
        className="self-start text-sm font-medium text-primary hover:underline"
      >
        + {t.autom.addRule}
      </button>
    </div>
  );
}
