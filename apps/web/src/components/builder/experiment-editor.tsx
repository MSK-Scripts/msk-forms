"use client";

import type { Experiment, ExperimentVariant } from "@msk-forms/shared";
import { Checkbox, Input, Textarea } from "@msk-forms/ui";

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
    <div className="flex flex-col gap-3">
      <Checkbox
        label={t.enable}
        checked={experiment.enabled}
        onChange={(e) => setEnabled(e.target.checked)}
      />

      {experiment.enabled && (
        <div className="flex flex-col gap-3">
          {variants.map((v, i) => (
            <div key={v.id} className="flex flex-col gap-2 rounded-md border border-border p-3">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    value={v.name}
                    placeholder={t.namePh}
                    onChange={(e) => patchVariant(i, { name: e.target.value })}
                  />
                </div>
                <div className="w-20 shrink-0">
                  <Input
                    type="number"
                    min={0}
                    value={v.weight}
                    title={t.weight}
                    onChange={(e) => patchVariant(i, { weight: Number(e.target.value) || 0 })}
                  />
                </div>
                <button
                  type="button"
                  aria-label={t.remove}
                  onClick={() => removeVariant(i)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              <Input
                value={v.title ?? ""}
                placeholder={t.titlePh}
                onChange={(e) => patchVariant(i, { title: e.target.value || undefined })}
              />
              <Textarea
                rows={2}
                value={v.description ?? ""}
                placeholder={t.descPh}
                onChange={(e) => patchVariant(i, { description: e.target.value || undefined })}
              />
            </div>
          ))}
          {variants.length < 6 && (
            <button
              type="button"
              onClick={addVariant}
              className="self-start text-sm font-medium text-primary hover:underline"
            >
              + {t.addVariant}
            </button>
          )}
          <p className="text-xs text-muted-foreground">{t.hint}</p>
        </div>
      )}
    </div>
  );
}
