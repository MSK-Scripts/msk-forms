"use client";

import { isLayoutField, type ConditionRule, type FormField } from "@msk-forms/shared";
import { Input, Select } from "@msk-forms/ui";

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
    return <p className="text-xs text-muted-foreground">{t.noFields}</p>;
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
    <div className="flex flex-col gap-2">
      {rules.map((rule, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2 rounded-md border border-border p-2">
          <Select
            value={rule.action}
            onChange={(e) => {
              const action = e.target.value as ConditionRule["action"];
              const target = action === "skip_to" ? (rule.target ?? pages[0]?.id) : undefined;
              replace(i, { ...rule, action, target });
            }}
            options={ACTIONS.map((a) => ({ value: a, label: actionLabel[a]! }))}
          />
          <Select
            value={rule.when.field}
            onChange={(e) => replace(i, { ...rule, when: { ...rule.when, field: e.target.value } })}
            options={others.map((f) => ({ value: f.id, label: f.label || f.id }))}
          />
          <Select
            value={rule.when.op}
            onChange={(e) =>
              replace(i, { ...rule, when: { ...rule.when, op: e.target.value as ConditionRule["when"]["op"] } })
            }
            options={opOptions}
          />
          {!NO_VALUE_OPS.includes(rule.when.op) && (
            <Input
              value={valueText(rule)}
              placeholder={t.valuePh}
              onChange={(e) =>
                replace(i, { ...rule, when: { ...rule.when, value: setValue(rule, e.target.value) } })
              }
            />
          )}
          {rule.action === "skip_to" && (
            <Select
              value={rule.target ?? pages[0]?.id ?? ""}
              onChange={(e) => replace(i, { ...rule, target: e.target.value })}
              options={pages.map((p) => ({ value: p.id, label: p.title }))}
            />
          )}
          <button
            type="button"
            aria-label={t.removeRule}
            onClick={() => remove(i)}
            className="ml-auto text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="self-start text-sm font-medium text-primary hover:underline"
      >
        + {t.addRule}
      </button>
    </div>
  );
}
