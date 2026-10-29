"use client";

import { isLayoutField, type ConditionRule, type FormField } from "@msk-forms/shared";
import { useId } from "react";

import { FormField as KitField } from "@/components/dashboard-kit";
import { Plus, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Dictionary } from "@/i18n";

type CondDict = Dictionary["builder"]["cond"];

const ACTIONS = ["show", "hide", "require", "skip_to"] as const;
const NO_VALUE_OPS = ["is_empty", "is_not_empty"];

/** Per-field conditional-logic editor (show / hide / require / skip-to-page). */
export function ConditionEditor({
  field,
  fields,
  pages,
  onChange,
  t,
}: {
  field: FormField;
  fields: FormField[];
  pages: { id: string; title: string }[];
  onChange: (rules: ConditionRule[]) => void;
  t: CondDict;
}) {
  const uid = useId();
  const rules = field.conditional ?? [];
  const others = fields.filter((f) => f.id !== field.id && !isLayoutField(f.type));

  const actionLabel: Record<string, string> = {
    show: t.actShow,
    hide: t.actHide,
    require: t.actRequire,
    skip_to: t.actSkipTo,
  };
  const opOptions = [
    { value: "equals", label: t.opEquals },
    { value: "not_equals", label: t.opNotEquals },
    { value: "contains", label: t.opContains },
    { value: "greater_than", label: t.opGreater },
    { value: "less_than", label: t.opLess },
    { value: "is_empty", label: t.opEmpty },
    { value: "is_not_empty", label: t.opNotEmpty },
    { value: "in_list", label: t.opInList },
  ];

  if (others.length === 0) {
    return <p className="max-w-[65ch] text-small text-muted-foreground">{t.noFields}</p>;
  }

  function replace(i: number, rule: ConditionRule) {
    onChange(rules.map((r, j) => (j === i ? rule : r)));
  }
  function add() {
    onChange([
      ...rules,
      { action: "show", when: { field: others[0]!.id, op: "equals", value: "" } },
    ]);
  }
  function remove(i: number) {
    onChange(rules.filter((_, j) => j !== i));
  }

  function valueText(rule: ConditionRule): string {
    const v = rule.when.value;
    return Array.isArray(v) ? v.join(", ") : v == null ? "" : String(v);
  }
  function setValue(rule: ConditionRule, raw: string): ConditionRule["when"]["value"] {
    if (rule.when.op === "in_list") {
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return raw;
  }

  return (
    <div className="grid gap-4">
      {rules.length > 0 && (
        <ol className="grid">
          {rules.map((rule, i) => {
            const n = String(i + 1);
            const labelId = `${uid}-rule-${i}`;
            return (
              <li key={i} className="border-t border-border py-4 first:border-t-0 first:pt-0">
                <div role="group" aria-labelledby={labelId} className="grid gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span id={labelId} className="font-semibold">
                      {t.ruleN.replace("{n}", n)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={t.removeRuleN.replace("{n}", n)}
                      onClick={() => remove(i)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="grid gap-4 @md:grid-cols-2">
                    <KitField label={t.action}>
                      {(f) => (
                        <Select
                          {...f}
                          value={rule.action}
                          onChange={(e) => {
                            const action = e.target.value as ConditionRule["action"];
                            const target =
                              action === "skip_to" ? (rule.target ?? pages[0]?.id) : undefined;
                            replace(i, { ...rule, action, target });
                          }}
                        >
                          {ACTIONS.map((a) => (
                            <option key={a} value={a}>
                              {actionLabel[a]}
                            </option>
                          ))}
                        </Select>
                      )}
                    </KitField>
                    <KitField label={t.field}>
                      {(f) => (
                        <Select
                          {...f}
                          value={rule.when.field}
                          onChange={(e) =>
                            replace(i, { ...rule, when: { ...rule.when, field: e.target.value } })
                          }
                        >
                          {others.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.label || o.id}
                            </option>
                          ))}
                        </Select>
                      )}
                    </KitField>
                    <KitField label={t.operator}>
                      {(f) => (
                        <Select
                          {...f}
                          value={rule.when.op}
                          onChange={(e) =>
                            replace(i, {
                              ...rule,
                              when: {
                                ...rule.when,
                                op: e.target.value as ConditionRule["when"]["op"],
                              },
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
                    {!NO_VALUE_OPS.includes(rule.when.op) && (
                      <KitField label={t.valuePh}>
                        {(f) => (
                          <Input
                            {...f}
                            value={valueText(rule)}
                            onChange={(e) =>
                              replace(i, {
                                ...rule,
                                when: { ...rule.when, value: setValue(rule, e.target.value) },
                              })
                            }
                          />
                        )}
                      </KitField>
                    )}
                    {rule.action === "skip_to" && (
                      <KitField label={t.target}>
                        {(f) => (
                          <Select
                            {...f}
                            value={rule.target ?? pages[0]?.id ?? ""}
                            onChange={(e) => replace(i, { ...rule, target: e.target.value })}
                          >
                            {pages.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.title}
                              </option>
                            ))}
                          </Select>
                        )}
                      </KitField>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <Button type="button" variant="outline" onClick={add} className="justify-self-start">
        <Plus className="h-4 w-4" />
        {t.addRule}
      </Button>
    </div>
  );
}
