"use client";

import {
  isComputedField,
  isLayoutField,
  type ConditionRule,
  type FieldType,
  type FormField,
} from "@msk-forms/shared";
import { useId } from "react";

import { ConditionEditor } from "@/components/builder/condition-editor";
import { Checkbox, FormField as KitField } from "@/components/dashboard-kit";
import { Plus, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { fieldClassName, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Dictionary } from "@/i18n";
import {
  BUILDER_FIELDS,
  fieldCarriesTypeData,
  isLayoutType,
  needsFormula,
  needsOptions,
  needsRows,
  needsSliderConfig,
  needsStarsConfig,
  needsYesNoScore,
} from "@/lib/builder-fields";
import { cn } from "@/lib/utils";

type BuilderDict = Dictionary["builder"];

interface FieldEditorProps {
  field: FormField;
  fields: FormField[];
  pages: { id: string; title: string }[];
  onChange: (field: FormField) => void;
  onChangeType: (newType: FieldType) => void;
  t: BuilderDict;
}

/**
 * The settings of the field chosen in the outline: type, label, help text,
 * the type's own configuration (options, matrix rows, formula, scale, points)
 * and its logic. Moving and removing a field happen in the outline.
 */
export function FieldEditor({ field, fields, pages, onChange, onChangeType, t }: FieldEditorProps) {
  const uid = useId();
  const layout = isLayoutType(field.type);
  const ftLabels = t.ft as Record<string, string>;

  function patch(partial: Partial<FormField>) {
    onChange({ ...field, ...partial });
  }

  function setOption(i: number, value: string) {
    const options = [...(field.options ?? [])];
    options[i] = { ...options[i], value, label: value };
    patch({ options });
  }
  function setOptionScore(i: number, raw: string) {
    const options = [...(field.options ?? [])];
    const n = raw === "" ? undefined : Number(raw);
    options[i] = { ...options[i]!, score: n !== undefined && Number.isFinite(n) ? n : undefined };
    patch({ options });
  }
  function addOption() {
    patch({ options: [...(field.options ?? []), { value: "", label: "" }] });
  }
  function removeOption(i: number) {
    patch({ options: (field.options ?? []).filter((_, j) => j !== i) });
  }
  /**
   * Set the score for the "yes" or "no" answer of a yes_no field. Scores live on
   * two synthetic options (values "yes"/"no") so they flow through the shared
   * scoring, seeded on first edit.
   */
  function setYesNoScore(which: "yes" | "no", raw: string) {
    const base =
      field.options?.length === 2
        ? [...field.options]
        : [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ];
    const i = which === "yes" ? 0 : 1;
    const n = raw === "" ? undefined : Number(raw);
    base[i] = { ...base[i]!, score: n !== undefined && Number.isFinite(n) ? n : undefined };
    patch({ options: base });
  }
  function setValidation(partial: Partial<FormField["validation"]>) {
    patch({ validation: { ...field.validation, ...partial } });
  }
  /** Parse a numeric config input, treating an empty string as "unset". */
  const num = (s: string): number | undefined => (s === "" ? undefined : Number(s));

  function setRow(i: number, label: string) {
    const rows = [...(field.rows ?? [])];
    rows[i] = { id: rows[i]?.id ?? crypto.randomUUID(), label };
    patch({ rows });
  }
  function addRow() {
    patch({ rows: [...(field.rows ?? []), { id: crypto.randomUUID(), label: "" }] });
  }
  function removeRow(i: number) {
    patch({ rows: (field.rows ?? []).filter((_, j) => j !== i) });
  }

  const formulaRefs = needsFormula(field.type)
    ? fields.filter((f) => f.id !== field.id && !isLayoutField(f.type) && !isComputedField(f.type))
    : [];

  return (
    <div className="grid gap-x-10 gap-y-6 @4xl:grid-cols-2">
      <div className="grid content-start gap-5">
        <KitField label={t.changeType} hint={fieldCarriesTypeData(field) ? t.changeTypeWarn : undefined}>
          {(f) => (
            <Select {...f} value={field.type} onChange={(e) => onChangeType(e.target.value as FieldType)}>
              {BUILDER_FIELDS.map((b) => (
                <option key={b.type} value={b.type}>
                  {ftLabels[b.type] ?? b.type}
                </option>
              ))}
            </Select>
          )}
        </KitField>

        {field.type === "divider" ? (
          <p className="max-w-[65ch] text-muted-foreground">{t.dividerNoSettings}</p>
        ) : (
          <KitField label={layout ? t.fieldText : t.fieldLabel}>
            {(f) => (
              <Input
                {...f}
                value={field.label ?? ""}
                onChange={(e) => patch({ label: e.target.value })}
                placeholder={layout ? t.headingPh : t.labelPh}
              />
            )}
          </KitField>
        )}

        {!layout && (
          <>
            <KitField label={t.helpText} hint={t.helpHint}>
              {(f) => (
                <Input {...f} value={field.description ?? ""} onChange={(e) => patch({ description: e.target.value })} />
              )}
            </KitField>

            {(field.type === "consent" || field.type === "age_check") && (
              <KitField label={t.consentText} hint={t.consentHint}>
                {(f) => (
                  <Input
                    {...f}
                    value={field.placeholder ?? ""}
                    onChange={(e) => patch({ placeholder: e.target.value })}
                    placeholder={t.consentPh}
                  />
                )}
              </KitField>
            )}

            {needsOptions(field.type) && (
              <fieldset className="grid gap-2">
                <legend className="mb-1.5 font-semibold">{needsRows(field.type) ? t.columns : t.options}</legend>
                {(field.options ?? []).length > 0 && (
                  <ol className="grid gap-2">
                    {(field.options ?? []).map((opt, i) => {
                      const name = opt.label || `${t.optionPh} ${i + 1}`;
                      return (
                        <li key={i} className="flex flex-wrap items-center gap-2">
                          <Input
                            aria-label={`${t.optionPh} ${i + 1}`}
                            value={opt.label}
                            onChange={(e) => setOption(i, e.target.value)}
                            placeholder={`${t.optionPh} ${i + 1}`}
                            className="min-w-0 flex-1 basis-40"
                          />
                          {!needsRows(field.type) && (
                            <label className="flex items-center gap-2 text-small text-muted-foreground">
                              <span aria-hidden>{t.points}</span>
                              <Input
                                type="number"
                                aria-label={t.pointsFor.replace("{name}", name)}
                                value={opt.score ?? ""}
                                onChange={(e) => setOptionScore(i, e.target.value)}
                                className="w-24 tabular-nums"
                              />
                            </label>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={t.removeItem.replace("{name}", name)}
                            onClick={() => removeOption(i)}
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </li>
                      );
                    })}
                  </ol>
                )}
                <Button type="button" variant="outline" onClick={addOption} className="justify-self-start">
                  <Plus className="h-4 w-4" />
                  {t.addOption}
                </Button>
              </fieldset>
            )}

            {needsYesNoScore(field.type) && (
              <fieldset className="grid gap-2" aria-describedby={`${uid}-yesno-hint`}>
                <legend className="font-semibold">{t.points}</legend>
                <p id={`${uid}-yesno-hint`} className="max-w-[65ch] text-small text-muted-foreground">
                  {t.yesNoScoreHint}
                </p>
                <div className="flex flex-wrap gap-4">
                  {(["yes", "no"] as const).map((which) => (
                    <KitField key={which} label={which === "yes" ? t.yes : t.no} className="w-32">
                      {(f) => (
                        <Input
                          {...f}
                          type="number"
                          value={field.options?.find((o) => o.value === which)?.score ?? ""}
                          onChange={(e) => setYesNoScore(which, e.target.value)}
                          className="tabular-nums"
                        />
                      )}
                    </KitField>
                  ))}
                </div>
              </fieldset>
            )}

            {needsRows(field.type) && (
              <fieldset className="grid gap-2">
                <legend className="mb-1.5 font-semibold">{t.rows}</legend>
                {(field.rows ?? []).length > 0 && (
                  <ol className="grid gap-2">
                    {(field.rows ?? []).map((row, i) => {
                      const name = row.label || `${t.rowPh} ${i + 1}`;
                      return (
                        <li key={row.id} className="flex items-center gap-2">
                          <Input
                            aria-label={`${t.rowPh} ${i + 1}`}
                            value={row.label}
                            onChange={(e) => setRow(i, e.target.value)}
                            placeholder={`${t.rowPh} ${i + 1}`}
                            className="min-w-0 flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={t.removeItem.replace("{name}", name)}
                            onClick={() => removeRow(i)}
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </li>
                      );
                    })}
                  </ol>
                )}
                <Button type="button" variant="outline" onClick={addRow} className="justify-self-start">
                  <Plus className="h-4 w-4" />
                  {t.addRow}
                </Button>
              </fieldset>
            )}

            {needsFormula(field.type) && (
              <div className="grid gap-3">
                <KitField label={t.formula} hint={t.formulaHint}>
                  {(f) => (
                    <textarea
                      {...f}
                      value={field.formula ?? ""}
                      onChange={(e) => patch({ formula: e.target.value })}
                      placeholder="{a} + {b} * 2"
                      rows={2}
                      className={cn(fieldClassName, "font-mono")}
                    />
                  )}
                </KitField>
                {formulaRefs.length > 0 && (
                  <div role="group" aria-labelledby={`${uid}-refs`} className="grid gap-2">
                    <p id={`${uid}-refs`} className="text-small text-muted-foreground">
                      {t.formulaFields}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formulaRefs.map((f) => (
                        <Button
                          key={f.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          title={`{${f.id}}`}
                          onClick={() =>
                            patch({
                              formula: `${field.formula ? `${field.formula} ` : ""}{${f.id}}`,
                            })
                          }
                          className="max-w-full break-words"
                        >
                          {f.label || f.id}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {needsStarsConfig(field.type) && (
              <KitField label={t.stars} className="max-w-40">
                {(f) => (
                  <Input
                    {...f}
                    type="number"
                    min={1}
                    value={field.validation.max ?? ""}
                    placeholder="5"
                    onChange={(e) => setValidation({ max: num(e.target.value) })}
                    className="tabular-nums"
                  />
                )}
              </KitField>
            )}

            {needsSliderConfig(field.type) && (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-4">
                <KitField label={t.min}>
                  {(f) => (
                    <Input
                      {...f}
                      type="number"
                      value={field.validation.min ?? ""}
                      placeholder="0"
                      onChange={(e) => setValidation({ min: num(e.target.value) })}
                      className="tabular-nums"
                    />
                  )}
                </KitField>
                <KitField label={t.max}>
                  {(f) => (
                    <Input
                      {...f}
                      type="number"
                      value={field.validation.max ?? ""}
                      placeholder="100"
                      onChange={(e) => setValidation({ max: num(e.target.value) })}
                      className="tabular-nums"
                    />
                  )}
                </KitField>
                <KitField label={t.step}>
                  {(f) => (
                    <Input
                      {...f}
                      type="number"
                      min={1}
                      value={field.validation.step ?? ""}
                      placeholder="1"
                      onChange={(e) => setValidation({ step: num(e.target.value) })}
                      className="tabular-nums"
                    />
                  )}
                </KitField>
              </div>
            )}

            {!needsFormula(field.type) && (
              <Checkbox
                label={t.required}
                checked={field.validation.required}
                onChange={(required) => patch({ validation: { ...field.validation, required } })}
              />
            )}
          </>
        )}
      </div>

      {!layout && (
        <section
          aria-labelledby={`${uid}-logic`}
          className="@container grid content-start gap-4 border-t border-border pt-6 @4xl:border-t-0 @4xl:pt-0"
        >
          <h3 id={`${uid}-logic`} className="font-display text-h3 font-[650]">
            {t.cond.title}
          </h3>
          <ConditionEditor
            field={field}
            fields={fields}
            pages={pages}
            onChange={(conditional: ConditionRule[]) => patch({ conditional })}
            t={t.cond}
          />
        </section>
      )}
    </div>
  );
}
