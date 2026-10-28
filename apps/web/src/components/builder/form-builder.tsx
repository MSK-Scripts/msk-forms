"use client";

import {
  isLayoutField,
  parseIdList,
  type AutomationRule,
  type Experiment,
  type FieldType,
  type FormField,
  type FormPage,
} from "@msk-forms/shared";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { AutomationsEditor } from "@/components/builder/automations-editor";
import { ExperimentEditor } from "@/components/builder/experiment-editor";
import { FieldEditor } from "@/components/builder/field-editor";
import { FieldOutline } from "@/components/builder/field-outline";
import {
  Checkbox,
  EmptyState,
  FormField as KitField,
  FormSection,
  Notice,
  PageHeader,
  SectionCard,
} from "@/components/dashboard-kit";
import { FormStateBadge, formStatus } from "@/components/dashboard/form-state-badge";
import { DateField, type DateFieldLabels } from "@/components/form/date-field";
import { CircleNotch, FloppyDisk, ListBullets } from "@/components/icons";
import { ProNotice } from "@/components/pro-notice";
import { Button } from "@/components/ui/button";
import { fieldClassName, Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Dictionary } from "@/i18n";
import { migrateFieldType, needsOptions } from "@/lib/builder-fields";

type BuilderDict = Dictionary["builder"];
type StatusOption = { value: string; label: string };

/** Strings from outside the `builder` section of the dictionary. */
export interface FormBuilderCopy {
  /** `dashboard.formsTab`, the first breadcrumb. */
  formsTab: string;
  /** `dashboard.newFormTitle`, the title while the form has no name yet. */
  newFormTitle: string;
  /** `kit.breadcrumb`, `kit.dismiss`. */
  breadcrumb: string;
  dismiss: string;
  /** `pro.title`, heading of the Pro notices for automations and A/B tests. */
  proTitle: string;
}

export interface FormBuilderInitial {
  title: string;
  description: string;
  slug: string;
  status: string;
  visibility: string;
  acceptedRoles: string;
  reviewChannelId: string;
  /** ISO 8601 open/close timestamps, or "" when unset. */
  openAt: string;
  closeAt: string;
  /** Tease the scheduled form with a live countdown + confetti on the hub. */
  showCountdown: boolean;
  /** Limit each signed-in applicant to one active (non-terminal) submission. */
  singleSubmission: boolean;
  /** Selected category id, or null when uncategorized. */
  categoryId: string | null;
  pages: FormPage[];
  automations: AutomationRule[];
  experiment: Experiment;
  /** Per-form status message overrides, keyed by status key. */
  statusMessages: Record<string, string>;
}

/** ISO → `datetime-local` input value (YYYY-MM-DDTHH:MM) in the viewer's tz. */
function isoToLocalInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

function newField(type: FieldType): FormField {
  return {
    id: crypto.randomUUID(),
    type,
    label: "",
    width: "full",
    validation: { required: false },
    conditional: [],
    ...(needsOptions(type) ? { options: [] } : {}),
  };
}

/**
 * The form builder: details, the fields (an outline of pages and fields beside
 * the editor of the chosen field, stacked when the room is narrow), the
 * settings, automations and the A/B test. Saving is the one primary action, in
 * the page head and again at the end of the page.
 */
export function FormBuilder({
  guildId,
  formId,
  initial,
  statusOptions,
  categories,
  isPro,
  automationsProBody,
  experimentProBody,
  dateLabels,
  copy,
  t,
}: {
  guildId: string;
  formId?: string;
  initial: FormBuilderInitial;
  statusOptions: StatusOption[];
  categories: { id: string; name: string }[];
  isPro: boolean;
  automationsProBody: string;
  experimentProBody: string;
  dateLabels: DateFieldLabels;
  copy: FormBuilderCopy;
  t: BuilderDict;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [slug, setSlug] = useState(initial.slug);
  const [status, setStatus] = useState(initial.status);
  const [visibility, setVisibility] = useState(initial.visibility);
  const [acceptedRoles, setAcceptedRoles] = useState(initial.acceptedRoles);
  const [reviewChannelId, setReviewChannelId] = useState(initial.reviewChannelId);
  const [categoryId, setCategoryId] = useState(initial.categoryId ?? "");
  // Schedule inputs are localized on the client to avoid a hydration mismatch
  // (the ISO→local conversion depends on the viewer's timezone).
  const [openAt, setOpenAt] = useState("");
  const [closeAt, setCloseAt] = useState("");
  const [showCountdown, setShowCountdown] = useState(initial.showCountdown);
  const [singleSubmission, setSingleSubmission] = useState(initial.singleSubmission);
  useEffect(() => {
    setOpenAt(isoToLocalInput(initial.openAt));
    setCloseAt(isoToLocalInput(initial.closeAt));
  }, [initial.openAt, initial.closeAt]);
  const [pages, setPages] = useState<FormPage[]>(initial.pages);
  const [automations, setAutomations] = useState<AutomationRule[]>(initial.automations);
  const [experiment, setExperiment] = useState<Experiment>(initial.experiment);
  const [statusMessages, setStatusMessages] = useState<Record<string, string>>(
    initial.statusMessages,
  );
  const [errors, setErrors] = useState<{ title?: string; slug?: string; fields?: string }>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // The field whose settings the editor shows; the first field when unset.
  const [selectedId, setSelectedId] = useState<string | null>(
    () => initial.pages.flatMap((p) => p.fields)[0]?.id ?? null,
  );
  // The page whose "Add field" picker is open: a page without fields starts open.
  const [pickerFor, setPickerFor] = useState<string | null>(
    () => initial.pages.find((p) => p.fields.length === 0)?.id ?? null,
  );
  // Polite announcement of a move, an added or a removed item. The counter
  // makes a repeated sentence count as a change.
  const [announcement, setAnnouncement] = useState({ text: "", n: 0 });

  const rootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const editorHeadingRef = useRef<HTMLSpanElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const editorId = useId();
  const messagesHintId = useId();

  // Conditions can reference any field on any page, so offer the full list.
  const allFields = pages.flatMap((p) => p.fields);
  // Page targets for `skip_to` conditions (fall back to "Page N" when untitled).
  const pageOptions = pages.map((p, i) => ({ id: p.id, title: p.title?.trim() || `${t.page} ${i + 1}` }));
  const ftLabel = (type: FieldType) => (t.ft as Record<string, string>)[type] ?? type;
  const fieldName = (field: FormField, index: number) =>
    field.label?.trim() || t.fieldN.replace("{n}", String(index + 1));

  function locate(id: string | null): { pi: number; fi: number } | null {
    for (let pi = 0; pi < pages.length; pi++) {
      const fi = pages[pi]!.fields.findIndex((f) => f.id === id);
      if (fi >= 0) return { pi, fi };
    }
    return null;
  }
  const firstPos = (() => {
    const pi = pages.findIndex((p) => p.fields.length > 0);
    return pi >= 0 ? { pi, fi: 0 } : null;
  })();
  const selPos = locate(selectedId) ?? firstPos;
  const selected = selPos ? pages[selPos.pi]!.fields[selPos.fi]! : null;

  function announce(text: string) {
    setAnnouncement((a) => ({ text, n: a.n + 1 }));
  }
  function focusIn(selector: string) {
    rootRef.current?.querySelector<HTMLElement>(selector)?.focus();
  }
  /** After a move: the same button again, or the other one when the item reached an end. */
  function focusMoveButton(key: string, dir: -1 | 1) {
    const root = rootRef.current;
    if (!root) return;
    const k = CSS.escape(key);
    const same = root.querySelector<HTMLButtonElement>(`[data-move="${k}:${dir < 0 ? "up" : "down"}"]`);
    const other = root.querySelector<HTMLButtonElement>(`[data-move="${k}:${dir < 0 ? "down" : "up"}"]`);
    (same && !same.disabled ? same : other)?.focus();
  }

  function mutatePage(pi: number, fn: (page: FormPage) => FormPage) {
    setPages((prev) => prev.map((p, i) => (i === pi ? fn(p) : p)));
  }
  function setPageTitle(pi: number, value: string) {
    mutatePage(pi, (p) => ({ ...p, title: value }));
  }
  function addPage() {
    const id = crypto.randomUUID();
    flushSync(() => {
      setPages((prev) => [...prev, { id, title: "", fields: [] }]);
      setPickerFor(id);
    });
    focusIn(`[data-page-title="${CSS.escape(id)}"]`);
  }
  /** Mark every input field (across all pages) as required in one click. */
  function markAllRequired() {
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        fields: p.fields.map((f) =>
          isLayoutField(f.type) ? f : { ...f, validation: { ...f.validation, required: true } },
        ),
      })),
    );
  }
  function removePage(pi: number) {
    if (pages.length <= 1) return;
    const name = pageOptions[pi]!.title;
    const neighbour = pages[pi + 1] ?? pages[pi - 1]!;
    flushSync(() => setPages((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== pi))));
    focusIn(`[data-page-title="${CSS.escape(neighbour.id)}"]`);
    announce(t.removedItem.replace("{name}", name));
  }
  function movePage(pi: number, dir: -1 | 1) {
    const page = pages[pi];
    const target = pi + dir;
    if (!page || target < 0 || target >= pages.length) return;
    flushSync(() =>
      setPages((prev) => {
        const next = [...prev];
        [next[pi], next[target]] = [next[target]!, next[pi]!];
        return next;
      }),
    );
    focusMoveButton(`page:${page.id}`, dir);
    announce(t.movedTo.replace("{pos}", String(target + 1)).replace("{total}", String(pages.length)));
  }
  function updateField(pi: number, fi: number, next: FormField) {
    mutatePage(pi, (p) => ({ ...p, fields: p.fields.map((f, i) => (i === fi ? next : f)) }));
  }
  function removeField(pi: number, fi: number) {
    const page = pages[pi];
    const field = page?.fields[fi];
    if (!page || !field) return;
    const name = fieldName(field, fi);
    const neighbour = page.fields[fi + 1] ?? page.fields[fi - 1] ?? null;
    flushSync(() => {
      mutatePage(pi, (p) => ({ ...p, fields: p.fields.filter((_, i) => i !== fi) }));
      if (selected?.id === field.id) setSelectedId(neighbour?.id ?? null);
    });
    if (neighbour) focusIn(`[data-select="${CSS.escape(neighbour.id)}"]`);
    else focusIn(`[data-picker="${CSS.escape(page.id)}"]`);
    announce(t.removedItem.replace("{name}", name));
  }
  function moveField(pi: number, fi: number, dir: -1 | 1) {
    const page = pages[pi];
    const field = page?.fields[fi];
    const target = fi + dir;
    if (!page || !field || target < 0 || target >= page.fields.length) return;
    flushSync(() =>
      mutatePage(pi, (p) => {
        const fields = [...p.fields];
        [fields[fi], fields[target]] = [fields[target]!, fields[fi]!];
        return { ...p, fields };
      }),
    );
    focusMoveButton(`field:${field.id}`, dir);
    announce(t.movedTo.replace("{pos}", String(target + 1)).replace("{total}", String(page.fields.length)));
  }
  function addField(pi: number, type: FieldType) {
    const page = pages[pi];
    if (!page) return;
    const field = newField(type);
    mutatePage(pi, (p) => ({ ...p, fields: [...p.fields, field] }));
    setSelectedId(field.id);
    setErrors((e) => ({ ...e, fields: undefined }));
    announce(t.addedField.replace("{type}", ftLabel(type)).replace("{pos}", String(page.fields.length + 1)));
  }
  /** Choose a field and take the focus to its settings (below the list on a phone). */
  function selectField(id: string) {
    flushSync(() => setSelectedId(id));
    editorHeadingRef.current?.focus();
  }
  function backToList() {
    if (selected) focusIn(`[data-select="${CSS.escape(selected.id)}"]`);
  }

  async function save() {
    setSaveError(null);
    const next = {
      title: title.trim() ? undefined : t.errTitle,
      slug: slug.trim() ? undefined : t.errSlug,
      fields: allFields.length === 0 ? t.errFields : undefined,
    };
    if (next.title || next.slug || next.fields) {
      // Render the errors first, so the field that gets the focus already
      // carries aria-invalid and its message.
      flushSync(() => setErrors(next));
      if (next.title) titleRef.current?.focus();
      else if (next.slug) slugRef.current?.focus();
      else focusIn("[data-picker]");
      return;
    }
    setErrors({});

    const spec = {
      version: 1,
      pages: pages.map((p) => ({
        id: p.id,
        title: p.title?.trim() || undefined,
        fields: p.fields,
      })),
    };
    const settings: Record<string, unknown> = {};
    const roleIds = parseIdList(acceptedRoles);
    if (roleIds.length > 0) settings.acceptedRoleIds = roleIds;
    if (reviewChannelId.trim()) settings.reviewChannelId = reviewChannelId.trim();
    if (automations.length > 0) settings.automations = automations;
    if (experiment.enabled) settings.experiment = experiment;
    if (showCountdown) settings.showCountdown = true;
    settings.singleSubmission = singleSubmission;
    // Keep only non-blank per-status overrides.
    const trimmedMessages = Object.fromEntries(
      Object.entries(statusMessages)
        .map(([k, v]) => [k, v.trim()] as const)
        .filter(([, v]) => v),
    );
    if (Object.keys(trimmedMessages).length > 0) settings.statusMessages = trimmedMessages;
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      slug: slug.trim(),
      status,
      visibility,
      spec,
      settings,
      openAt: openAt ? new Date(openAt).toISOString() : null,
      closeAt: closeAt ? new Date(closeAt).toISOString() : null,
      categoryId: categoryId || null,
    };

    setSaving(true);
    try {
      const url = formId
        ? `/api/guilds/${guildId}/forms/${formId}`
        : `/api/guilds/${guildId}/forms`;
      const res = await fetch(url, {
        method: formId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? t.errSave);
      }
      router.push(`/dashboard/${guildId}/forms` as Route);
      router.refresh();
    } catch (err) {
      flushSync(() => {
        setSaveError(err instanceof Error ? err.message : t.errSave);
        setSaving(false);
      });
      // The message is an alert; bring it into view, the focus stays on Save.
      errorRef.current?.scrollIntoView({ block: "nearest" });
    }
  }

  const formsHref = `/dashboard/${guildId}/forms`;
  const statusLabel: Record<string, string> = {
    draft: t.statusDraft,
    live: t.statusLive,
    closed: t.statusClosed,
  };
  const saveButton = (
    <Button type="button" onClick={save} disabled={saving} aria-busy={saving || undefined}>
      {saving ? <CircleNotch className="h-4 w-4 animate-spin" /> : <FloppyDisk className="h-4 w-4" />}
      {saving ? t.saving : formId ? t.saveChanges : t.createForm}
    </Button>
  );

  return (
    <>
      <PageHeader
        title={
          formId ? (
            <span translate="no" className="break-words">
              {initial.title}
            </span>
          ) : (
            copy.newFormTitle
          )
        }
        badge={
          formId ? (
            <FormStateBadge
              status={formStatus(initial.status)}
              label={statusLabel[initial.status] ?? initial.status}
            />
          ) : undefined
        }
        breadcrumbs={[
          { label: copy.formsTab, href: formsHref },
          { label: formId ? <span translate="no">{initial.title}</span> : copy.newFormTitle },
        ]}
        breadcrumbLabel={copy.breadcrumb}
        action={saveButton}
      />

      <div ref={rootRef} className="@container/builder grid gap-[var(--app-gutter-y)]">
        <p aria-live="polite" className="sr-only">
          {announcement.text}
          {announcement.n % 2 ? " " : ""}
        </p>

        {saveError && (
          <div ref={errorRef}>
            <Notice
              tone="danger"
              role="alert"
              title={t.errSave}
              onDismiss={() => setSaveError(null)}
              dismissLabel={copy.dismiss}
            >
              {saveError !== t.errSave ? saveError : undefined}
            </Notice>
          </div>
        )}

        <div className="max-w-[80rem]">
          <FormSection title={t.detailsTitle} description={t.detailsIntro}>
            <KitField label={t.title} required error={errors.title}>
              {(f) => (
                <Input
                  {...f}
                  ref={titleRef}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors((x) => ({ ...x, title: undefined }));
                  }}
                />
              )}
            </KitField>
            <KitField label={t.description}>
              {(f) => (
                <textarea
                  {...f}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={fieldClassName}
                />
              )}
            </KitField>
            <KitField label={t.slug} required hint={t.slugHint} error={errors.slug}>
              {(f) => (
                <div className="flex flex-wrap gap-2">
                  <Input
                    {...f}
                    ref={slugRef}
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      if (errors.slug) setErrors((x) => ({ ...x, slug: undefined }));
                    }}
                    className="min-w-0 flex-1 basis-48 font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSlug(slugify(title));
                      if (errors.slug) setErrors((x) => ({ ...x, slug: undefined }));
                    }}
                  >
                    {t.slugFromTitle}
                  </Button>
                </div>
              )}
            </KitField>
          </FormSection>
        </div>

        <div className="grid items-start gap-[var(--app-gutter-y)] @4xl/builder:grid-cols-[minmax(19rem,2fr)_minmax(0,3fr)]">
          <SectionCard
            title={t.fieldsTitle}
            actions={
              allFields.length > 0 ? (
                <Button type="button" variant="outline" onClick={markAllRequired}>
                  {t.markAllRequired}
                </Button>
              ) : undefined
            }
          >
            <FieldOutline
              pages={pages}
              pageNames={pageOptions.map((p) => p.title)}
              selectedId={selected?.id ?? null}
              editorId={editorId}
              pickerFor={pickerFor}
              fieldsError={errors.fields}
              fieldName={fieldName}
              handlers={{
                onSelect: selectField,
                onMoveField: moveField,
                onRemoveField: removeField,
                onMovePage: movePage,
                onRemovePage: removePage,
                onPageTitle: setPageTitle,
                onAddField: addField,
                onAddPage: addPage,
                onPickerToggle: (pageId, open) =>
                  setPickerFor((prev) => (open ? pageId : prev === pageId ? null : prev)),
              }}
              t={t}
            />
          </SectionCard>

          {/* Beside the list the editor stays in view while the list scrolls,
              and scrolls in itself when it is taller than the window. */}
          <div
            id={editorId}
            className="rounded-lg @4xl/builder:sticky @4xl/builder:top-[calc(var(--app-topbar)+5px+1rem)] @4xl/builder:max-h-[calc(100dvh-var(--app-topbar)-5px-2rem)] @4xl/builder:overflow-y-auto"
          >
            {selected && selPos ? (
              <SectionCard
                title={
                  <span ref={editorHeadingRef} tabIndex={-1} className="break-words">
                    {fieldName(selected, selPos.fi)}
                  </span>
                }
                description={[pages.length > 1 ? pageOptions[selPos.pi]!.title : null, ftLabel(selected.type)]
                  .filter(Boolean)
                  .join(" · ")}
              >
                <div className="grid gap-5">
                  <Button
                    type="button"
                    variant="link"
                    onClick={backToList}
                    className="min-h-11 justify-self-start @4xl/builder:hidden"
                  >
                    <ListBullets className="h-4 w-4" />
                    {t.backToList}
                  </Button>
                  <FieldEditor
                    key={selected.id}
                    field={selected}
                    fields={allFields}
                    pages={pageOptions}
                    onChange={(next) => updateField(selPos.pi, selPos.fi, next)}
                    onChangeType={(nt) => updateField(selPos.pi, selPos.fi, migrateFieldType(selected, nt))}
                    t={t}
                  />
                </div>
              </SectionCard>
            ) : (
              <div className="rounded-lg border border-border bg-card">
                <EmptyState kind="first-use" title={t.editorEmpty}>
                  {t.editorEmptyBody}
                </EmptyState>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[80rem]">
          <FormSection title={t.publishTitle} description={t.publishIntro}>
            <div className="grid gap-5 @4xl:grid-cols-2">
              <KitField label={t.status}>
                {(f) => (
                  <Select {...f} value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="draft">{t.statusDraft}</option>
                    <option value="live">{t.statusLive}</option>
                    <option value="closed">{t.statusClosed}</option>
                  </Select>
                )}
              </KitField>
              <KitField label={t.visibility}>
                {(f) => (
                  <Select {...f} value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                    <option value="public">{t.visPublic}</option>
                    <option value="authenticated">{t.visAuth}</option>
                  </Select>
                )}
              </KitField>
              {categories.length > 0 && (
                <KitField label={t.category}>
                  {(f) => (
                    <Select {...f} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                      <option value="">{t.noCategory}</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  )}
                </KitField>
              )}
            </div>
          </FormSection>

          <FormSection title={t.scheduleTitle} description={t.scheduleIntro}>
            <div className="grid gap-5 @4xl:grid-cols-2">
              <KitField label={t.opensLabel} hint={t.scheduleHint}>
                {(f) => (
                  <DateField
                    id={f.id}
                    describedBy={f["aria-describedby"]}
                    mode="datetime"
                    value={openAt}
                    onChange={(v) => setOpenAt(v ?? "")}
                    labels={dateLabels}
                  />
                )}
              </KitField>
              <KitField label={t.closesLabel} hint={t.scheduleHint}>
                {(f) => (
                  <DateField
                    id={f.id}
                    describedBy={f["aria-describedby"]}
                    mode="datetime"
                    value={closeAt}
                    onChange={(v) => setCloseAt(v ?? "")}
                    labels={dateLabels}
                  />
                )}
              </KitField>
            </div>
            <Checkbox
              label={t.countdownLabel}
              hint={t.countdownHint}
              checked={showCountdown}
              onChange={setShowCountdown}
            />
          </FormSection>

          <FormSection title={t.discordTitle} description={t.discordIntro}>
            <KitField label={t.acceptedRole} hint={t.acceptedRoleHint}>
              {(f) => (
                <Input
                  {...f}
                  value={acceptedRoles}
                  placeholder="123456789012345678, 987654321098765432"
                  onChange={(e) => setAcceptedRoles(e.target.value)}
                  className="font-mono"
                />
              )}
            </KitField>
            <KitField label={t.reviewChannel} hint={t.reviewChannelHint}>
              {(f) => (
                <Input
                  {...f}
                  inputMode="numeric"
                  value={reviewChannelId}
                  placeholder="123456789012345678"
                  onChange={(e) => setReviewChannelId(e.target.value)}
                  className="font-mono"
                />
              )}
            </KitField>
          </FormSection>

          <FormSection title={t.submissionsTitle} description={t.submissionsIntro}>
            <Checkbox
              label={t.singleSubmissionLabel}
              hint={t.singleSubmissionHint}
              checked={singleSubmission}
              onChange={setSingleSubmission}
            />
            {statusOptions.length > 0 && (
              <fieldset className="grid gap-4" aria-describedby={messagesHintId}>
                <legend className="mb-1 font-semibold">{t.statusMessagesLabel}</legend>
                <p id={messagesHintId} className="max-w-[65ch] text-small text-muted-foreground">
                  {t.statusMessagesHint}
                </p>
                {statusOptions.map((s) => (
                  <KitField key={s.value} label={s.label}>
                    {(f) => (
                      <textarea
                        {...f}
                        rows={2}
                        maxLength={2000}
                        value={statusMessages[s.value] ?? ""}
                        placeholder={t.statusMessagesPlaceholder}
                        onChange={(e) => setStatusMessages((m) => ({ ...m, [s.value]: e.target.value }))}
                        className={fieldClassName}
                      />
                    )}
                  </KitField>
                ))}
              </fieldset>
            )}
          </FormSection>

          <FormSection title={t.autom.title} description={t.autom.intro}>
            {isPro ? (
              <AutomationsEditor
                automations={automations}
                fields={allFields}
                statusOptions={statusOptions}
                onChange={setAutomations}
                t={t}
              />
            ) : (
              <ProNotice title={copy.proTitle} body={automationsProBody} />
            )}
          </FormSection>

          <FormSection title={t.exp.title} description={t.exp.intro}>
            {isPro ? (
              <ExperimentEditor experiment={experiment} onChange={setExperiment} t={t.exp} />
            ) : (
              <ProNotice title={copy.proTitle} body={experimentProBody} />
            )}
          </FormSection>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
          {saveButton}
          <Button type="button" variant="outline" onClick={() => router.push(formsHref as Route)}>
            {t.cancel}
          </Button>
        </div>
      </div>
    </>
  );
}
