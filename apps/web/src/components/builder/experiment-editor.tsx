"use client";

import type { Experiment, ExperimentVariant } from "@msk-forms/shared";
import { useId } from "react";

import { Checkbox, FormField as KitField } from "@/components/dashboard-kit";
import { Plus, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { fieldClassName, Input } from "@/components/ui/input";
import type { Dictionary } from "@/i18n";

type ExperimentDict = Dictionary["builder"]["exp"];

/** Editor for a form's A/B test: enable + a list of copy variants with weights. */
export function ExperimentEditor({
  experiment,
  onChange,
  t,
}: {
  experiment: Experiment;
  onChange: (experiment: Experiment) => void;
  t: ExperimentDict;
}) {
  const uid = useId();
  const variants = experiment.variants;

  function setEnabled(enabled: boolean) {
    // Seed two variants the first time it's switched on so it's immediately usable.
    const seeded: ExperimentVariant[] =
      enabled && variants.length < 2
        ? [
            { id: crypto.randomUUID(), name: "A", weight: 1 },
            { id: crypto.randomUUID(), name: "B", weight: 1 },
          ]
        : variants;
    onChange({ enabled, variants: seeded });
  }

  function patchVariant(i: number, patch: Partial<ExperimentVariant>) {
    onChange({ ...experiment, variants: variants.map((v, j) => (j === i ? { ...v, ...patch } : v)) });
  }
  function addVariant() {
    if (variants.length >= 6) return;
    onChange({
      ...experiment,
      variants: [
        ...variants,
        { id: crypto.randomUUID(), name: String.fromCharCode(65 + variants.length), weight: 1 },
      ],
    });
  }
  function removeVariant(i: number) {
    onChange({ ...experiment, variants: variants.filter((_, j) => j !== i) });
  }

  return (
    <div className="@container grid gap-4">
      <Checkbox label={t.enable} checked={experiment.enabled} onChange={setEnabled} />

      {experiment.enabled && (
        <>
          {variants.length > 0 && (
            <ol className="grid">
              {variants.map((v, i) => {
                const n = String(i + 1);
                const labelId = `${uid}-variant-${i}`;
                return (
                  <li key={v.id} className="border-t border-border py-5 first:border-t-0 first:pt-0">
                    <div role="group" aria-labelledby={labelId} className="grid gap-4">
                      <div className="flex items-center justify-between gap-2">
                        <span id={labelId} className="font-semibold">
                          {t.variantN.replace("{n}", n)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={t.removeN.replace("{n}", n)}
                          onClick={() => removeVariant(i)}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="grid gap-4 @xl:grid-cols-[minmax(0,1fr)_10rem]">
                        <KitField label={t.namePh}>
                          {(f) => (
                            <Input {...f} value={v.name} onChange={(e) => patchVariant(i, { name: e.target.value })} />
                          )}
                        </KitField>
                        <KitField label={t.weight}>
                          {(f) => (
                            <Input
                              {...f}
                              type="number"
                              min={0}
                              value={v.weight}
                              onChange={(e) => patchVariant(i, { weight: Number(e.target.value) || 0 })}
                              className="tabular-nums"
                            />
                          )}
                        </KitField>
                      </div>
                      <KitField label={t.titlePh}>
                        {(f) => (
                          <Input
                            {...f}
                            value={v.title ?? ""}
                            onChange={(e) => patchVariant(i, { title: e.target.value || undefined })}
                          />
                        )}
                      </KitField>
                      <KitField label={t.descPh}>
                        {(f) => (
                          <textarea
                            {...f}
                            rows={2}
                            value={v.description ?? ""}
                            onChange={(e) => patchVariant(i, { description: e.target.value || undefined })}
                            className={fieldClassName}
                          />
                        )}
                      </KitField>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
          {variants.length < 6 && (
            <Button type="button" variant="outline" onClick={addVariant} className="justify-self-start">
              <Plus className="h-4 w-4" />
              {t.addVariant}
            </Button>
          )}
          <p className="max-w-[65ch] text-small text-muted-foreground">{t.hint}</p>
        </>
      )}
    </div>
  );
}
