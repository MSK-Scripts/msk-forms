"use client";

import {
  isLayoutField,
  type AutomationCondition,
  type AutomationRule,
  type FormField,
} from "@msk-forms/shared";
import { useId } from "react";

import { FormField as KitField } from "@/components/dashboard-kit";
import { Plus, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
  const uid = useId();
  const usable = fields.filter((f) => !isLayoutField(f.type));
  const fallbackStatus = statusOptions[0]?.value ?? "accepted";
  // Condition targets: the quiz score (reserved `__score`) plus the form's fields.
  const fieldOptions = [
    { value: "__score", label: t.autom.score },
    ...usable.map((f) => ({ value: f.id, label: f.label || f.id })),
  ];

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
      when: [...rule.when, { field: "__score", op: "greater_than", value: "" }],
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
    if (cond.op === "in_list")
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    return raw;
  }

  if (usable.length === 0) {
    return <p className="max-w-[65ch] text-muted-foreground">{t.autom.noFields}</p>;
  }

  return (
    <div className="@container grid gap-4">
      {automations.length > 0 && (
        <ol className="grid">
          {automations.map((rule, ri) => {
            const rn = String(ri + 1);
            const ruleLabel = `${uid}-rule-${ri}`;
            return (
              <li key={ri} className="border-t border-border py-5 first:border-t-0 first:pt-0">
                <div role="group" aria-labelledby={ruleLabel} className="grid gap-4">
                  <div className="flex items-center justify-between gap-2">
                    <span id={ruleLabel} className="font-semibold">
                      {t.autom.ruleN.replace("{n}", rn)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={t.autom.removeRuleN.replace("{n}", rn)}
                      onClick={() => removeRule(ri)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  <p className="text-small text-muted-foreground">
                    {rule.when.length === 0 ? t.autom.always : t.autom.whenAll}
                  </p>

                  {rule.when.length > 0 && (
                    <ol className="grid gap-4">
                      {rule.when.map((cond, ci) => {
                        const cNum = String(ci + 1);
                        return (
                          <li key={ci}>
                            <div
                              role="group"
                              aria-label={t.autom.conditionN.replace("{n}", cNum)}
                              className="grid items-end gap-3 @xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
                            >
                              <KitField label={t.cond.field}>
                                {(f) => (
                                  <Select
                                    {...f}
                                    value={cond.field}
                                    onChange={(e) =>
                                      replaceCondition(ri, ci, { ...cond, field: e.target.value })
                                    }
                                  >
                                    {fieldOptions.map((o) => (
                                      <option key={o.value} value={o.value}>
                                        {o.label}
                                      </option>
                                    ))}
                                  </Select>
                                )}
                              </KitField>
                              <KitField label={t.cond.operator}>
                                {(f) => (
                                  <Select
                                    {...f}
                                    value={cond.op}
                                    onChange={(e) =>
                                      replaceCondition(ri, ci, {
                                        ...cond,
                                        op: e.target.value as AutomationCondition["op"],
                                      })
                                    }
                                  >
                                    {opOptions.map((o) => (
                                      <option key={o.value} value={o.value}>
                                        {o.label}
                                      </option>
                                    ))}
                                  </Select>
                                )}
                              </KitField>
                              {!NO_VALUE_OPS.includes(cond.op) ? (
                                <KitField label={t.autom.valuePh}>
                                  {(f) => (
                                    <Input
                                      {...f}
                                      value={valueText(cond)}
                                      onChange={(e) =>
                                        replaceCondition(ri, ci, {
                                          ...cond,
                                          value: parseValue(cond, e.target.value),
                                        })
                                      }
                                    />
                                  )}
                                </KitField>
                              ) : (
                                <span aria-hidden className="hidden @xl:block" />
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={t.autom.removeConditionN.replace("{n}", cNum)}
                                onClick={() => removeCondition(ri, ci)}
                                className="mb-0.5 justify-self-start"
                              >
                                <X className="h-5 w-5" />
                              </Button>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addCondition(ri)}
                    className="justify-self-start"
                  >
                    <Plus className="h-4 w-4" />
                    {t.autom.addCondition}
                  </Button>

                  <KitField label={t.autom.setStatus} className="@xl:max-w-[50%]">
                    {(f) => (
                      <Select
                        {...f}
                        value={rule.setStatus}
                        onChange={(e) => replaceRule(ri, { ...rule, setStatus: e.target.value })}
                      >
                        {statusOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </Select>
                    )}
                  </KitField>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <Button type="button" variant="outline" onClick={addRule} className="justify-self-start">
        <Plus className="h-4 w-4" />
        {t.autom.addRule}
      </Button>
    </div>
  );
}
