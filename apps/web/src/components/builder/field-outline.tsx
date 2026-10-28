"use client";

import type { FieldType, FormField, FormPage } from "@msk-forms/shared";
import { useId } from "react";

import { FormField as KitField } from "@/components/dashboard-kit";
import {
  ArrowDown,
  ArrowUp,
  CalendarBlank,
  CaretCircleDown,
  CaretDown,
  CaretUp,
  CheckSquare,
  EnvelopeSimple,
  Gauge,
  Hash,
  ImageSquare,
  LinkSimple,
  MathOperations,
  Minus,
  Paperclip,
  Paragraph,
  Phone,
  Plus,
  RadioButton,
  SealCheck,
  Signature,
  SlidersHorizontal,
  Smiley,
  Star,
  Table,
  TextAlignLeft,
  Textbox,
  TextH,
  TextT,
  ToggleRight,
  Trash,
  WarningCircle,
  type IconComponent,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/i18n";
import { BUILDER_FIELDS } from "@/lib/builder-fields";
import { cn } from "@/lib/utils";

type BuilderDict = Dictionary["builder"];
type PickerGroup = keyof BuilderDict["pickerGroups"];

/** Sign per field type, in the outline and the "Add field" picker. */
const FIELD_ICONS: Partial<Record<FieldType, IconComponent>> = {
  short_text: TextT,
  long_text: TextAlignLeft,
  email: EnvelopeSimple,
  number: Hash,
  phone: Phone,
  url: LinkSimple,
  single_choice: RadioButton,
  dropdown: CaretCircleDown,
  multi_choice: CheckSquare,
  yes_no: ToggleRight,
  rating_stars: Star,
  nps: Gauge,
  slider: SlidersHorizontal,
  emoji_scale: Smiley,
  matrix: Table,
  calculated: MathOperations,
  date: CalendarBlank,
  file_upload: Paperclip,
  image_upload: ImageSquare,
  signature: Signature,
  consent: SealCheck,
  heading: TextH,
  paragraph: Paragraph,
  divider: Minus,
};

export const fieldIcon = (type: FieldType): IconComponent => FIELD_ICONS[type] ?? Textbox;

/**
 * The picker groups the field types by what they ask for, so 24 types read as
 * five short groups. The types come from BUILDER_FIELDS; one that no group
 * names lands in "special", so a new type always shows up.
 */
const GROUP_TYPES: Record<PickerGroup, FieldType[]> = {
  text: ["short_text", "long_text", "email", "number", "phone", "url"],
  choice: ["single_choice", "dropdown", "multi_choice", "yes_no", "consent"],
  scale: ["rating_stars", "nps", "slider", "emoji_scale", "matrix"],
  special: ["date", "file_upload", "image_upload", "signature", "calculated"],
  layout: ["heading", "paragraph", "divider"],
};
const GROUP_ORDER: PickerGroup[] = ["text", "choice", "scale", "special", "layout"];
const grouped = new Set(Object.values(GROUP_TYPES).flat());
const PICKER = GROUP_ORDER.map((group) => ({
  group,
  types: BUILDER_FIELDS.map((f) => f.type).filter(
    (type) => GROUP_TYPES[group].includes(type) || (group === "special" && !grouped.has(type)),
  ),
})).filter((g) => g.types.length > 0);

export interface OutlineHandlers {
  onSelect: (fieldId: string) => void;
  onMoveField: (pi: number, fi: number, dir: -1 | 1) => void;
  onRemoveField: (pi: number, fi: number) => void;
  onMovePage: (pi: number, dir: -1 | 1) => void;
  onRemovePage: (pi: number) => void;
  onPageTitle: (pi: number, value: string) => void;
  onAddField: (pi: number, type: FieldType) => void;
  onAddPage: () => void;
  onPickerToggle: (pageId: string, open: boolean) => void;
}

/**
 * The list side of the builder: the pages, their fields in order and the
 * picker to add a field. Reordering is by buttons only (no dragging), each
 * named after the item it moves (WCAG 2.5.7); the builder keeps the focus on
 * the moved item and announces its new position.
 */
export function FieldOutline({
  pages,
  pageNames,
  selectedId,
  editorId,
  pickerFor,
  fieldsError,
  fieldName,
  handlers,
  t,
}: {
  pages: FormPage[];
  pageNames: string[];
  selectedId: string | null;
  /** id of the editor panel the field buttons control. */
  editorId: string;
  /** The page whose picker is open. */
  pickerFor: string | null;
  /** "Add at least one field", tied to the first picker. */
  fieldsError?: string;
  fieldName: (field: FormField, index: number) => string;
  handlers: OutlineHandlers;
  t: BuilderDict;
}) {
  const uid = useId();
  const errorId = `${uid}-fields-error`;
  const ftLabel = (type: FieldType) => (t.ft as Record<string, string>)[type] ?? type;
  const several = pages.length > 1;

  return (
    <div className="grid gap-6">
      {fieldsError && (
        <p id={errorId} className="flex items-start gap-1.5 text-small font-semibold text-danger">
          <WarningCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {fieldsError}
        </p>
      )}

      <ol className="grid gap-6">
        {pages.map((page, pi) => {
          const pageName = pageNames[pi] ?? `${t.page} ${pi + 1}`;
          const open = pickerFor === page.id;
          return (
            <li key={page.id} className="grid gap-4 border-t border-border pt-5 first:border-t-0 first:pt-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-h3 font-[650]">
                  {t.page} {pi + 1}
                </h3>
                {several && (
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      data-move={`page:${page.id}:up`}
                      aria-label={t.moveItemUp.replace("{name}", pageName)}
                      disabled={pi === 0}
                      onClick={() => handlers.onMovePage(pi, -1)}
                    >
                      <ArrowUp className="h-5 w-5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      data-move={`page:${page.id}:down`}
                      aria-label={t.moveItemDown.replace("{name}", pageName)}
                      disabled={pi === pages.length - 1}
                      onClick={() => handlers.onMovePage(pi, 1)}
                    >
                      <ArrowDown className="h-5 w-5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={t.removeItem.replace("{name}", pageName)}
                      onClick={() => handlers.onRemovePage(pi)}
                    >
                      <Trash className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>

              <KitField
                label={
                  <>
                    {t.pageTitle}
                    {several && (
                      <span className="sr-only">
                        , {t.page} {pi + 1}
                      </span>
                    )}
                  </>
                }
              >
                {(field) => (
                  <Input
                    {...field}
                    data-page-title={page.id}
                    value={page.title ?? ""}
                    onChange={(e) => handlers.onPageTitle(pi, e.target.value)}
                  />
                )}
              </KitField>

              {page.fields.length > 0 && (
                <ol className="grid divide-y divide-border border-y border-border">
                  {page.fields.map((field, fi) => {
                    const name = fieldName(field, fi);
                    const selected = field.id === selectedId;
                    const Icon = fieldIcon(field.type);
                    const meta = [
                      ftLabel(field.type),
                      field.validation?.required ? t.required : null,
                      field.conditional && field.conditional.length > 0 ? t.cond.title : null,
                    ]
                      .filter(Boolean)
                      .join(" · ");
                    return (
                      <li key={field.id} className="flex flex-wrap items-center gap-x-1 gap-y-1 py-1.5">
                        <button
                          type="button"
                          data-select={field.id}
                          aria-current={selected ? "true" : undefined}
                          aria-controls={editorId}
                          onClick={() => handlers.onSelect(field.id)}
                          className={cn(
                            "flex min-h-11 min-w-0 flex-1 basis-44 items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors duration-150",
                            selected ? "bg-accent-soft" : "hover:bg-muted",
                          )}
                        >
                          <span className="min-w-5 shrink-0 text-right tabular-nums text-muted-foreground">
                            {fi + 1}
                          </span>
                          <Icon
                            className={cn("mt-1 h-5 w-5 shrink-0", selected ? "text-primary" : "text-muted-foreground")}
                          />
                          <span className="grid min-w-0">
                            <span className={cn("font-semibold break-words", selected && "text-primary")}>
                              {name}
                            </span>
                            <span className="text-small text-muted-foreground">{meta}</span>
                          </span>
                        </button>
                        <div className="ms-auto flex shrink-0 gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            data-move={`field:${field.id}:up`}
                            aria-label={t.moveItemUp.replace("{name}", name)}
                            disabled={fi === 0}
                            onClick={() => handlers.onMoveField(pi, fi, -1)}
                          >
                            <ArrowUp className="h-5 w-5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            data-move={`field:${field.id}:down`}
                            aria-label={t.moveItemDown.replace("{name}", name)}
                            disabled={fi === page.fields.length - 1}
                            onClick={() => handlers.onMoveField(pi, fi, 1)}
                          >
                            <ArrowDown className="h-5 w-5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={t.removeItem.replace("{name}", name)}
                            onClick={() => handlers.onRemoveField(pi, fi)}
                          >
                            <Trash className="h-5 w-5" />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}

              {/* Native disclosure: keyboard and screen readers know it
                  without a script. Open on a page without fields. */}
              <details
                open={open}
                onToggle={(e) => handlers.onPickerToggle(page.id, e.currentTarget.open)}
              >
                <summary
                  data-picker={page.id}
                  aria-describedby={pi === 0 && fieldsError ? errorId : undefined}
                  className="inline-flex min-h-11 w-fit max-w-full cursor-pointer list-none items-center gap-2 rounded-md border-[1.5px] border-input px-4.5 py-2 font-semibold transition-colors duration-150 hover:border-foreground [&::-webkit-details-marker]:hidden"
                >
                  <Plus className="h-4 w-4" />
                  {several ? t.addFieldTo.replace("{page}", pageName) : t.addField}
                  {open ? <CaretUp className="h-4 w-4" /> : <CaretDown className="h-4 w-4" />}
                </summary>
                <div className="mt-4 grid gap-5">
                  {PICKER.map(({ group, types }) => {
                    const groupId = `${uid}-${pi}-${group}`;
                    return (
                      <div key={group} role="group" aria-labelledby={groupId} className="grid gap-2">
                        <p
                          id={groupId}
                          className="text-label font-semibold uppercase tracking-[0.08em] text-muted-foreground"
                        >
                          {t.pickerGroups[group]}
                        </p>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,10.5rem),1fr))] gap-2">
                          {types.map((type) => {
                            const Icon = fieldIcon(type);
                            return (
                              <Button
                                key={type}
                                type="button"
                                variant="outline"
                                onClick={() => handlers.onAddField(pi, type)}
                                className="justify-start px-3 text-left text-small"
                              >
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                {ftLabel(type)}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </details>
            </li>
          );
        })}
      </ol>

      <Button type="button" variant="outline" onClick={handlers.onAddPage} className="justify-self-start">
        <Plus className="h-4 w-4" />
        {t.addPage}
      </Button>
    </div>
  );
}
