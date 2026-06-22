"use client";

import type { AutomationRule, FieldType, FormField, FormPage } from "@msk-forms/shared";
import { Button, Card, Field, Input, Select, Textarea } from "@msk-forms/ui";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AutomationsEditor } from "@/components/builder/automations-editor";
import { FieldEditor } from "@/components/builder/field-editor";
import { BUILDER_FIELDS, needsOptions } from "@/lib/builder-fields";
import type { Dictionary } from "@/i18n";

type BuilderDict = Dictionary["builder"];
type StatusOption = { value: string; label: string };

export interface FormBuilderInitial {
  title: string;
  description: string;
  slug: string;
  status: string;
  visibility: string;
  acceptedRoleId: string;
  pages: FormPage[];
  automations: AutomationRule[];
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

export function FormBuilder({
  guildId,
  formId,
  initial,
  statusOptions,
  isPro,
  automationsProBody,
  t,
}: {
  guildId: string;
  formId?: string;
  initial: FormBuilderInitial;
  statusOptions: StatusOption[];
  isPro: boolean;
  automationsProBody: string;
  t: BuilderDict;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [slug, setSlug] = useState(initial.slug);
  const [status, setStatus] = useState(initial.status);
  const [visibility, setVisibility] = useState(initial.visibility);
  const [acceptedRoleId, setAcceptedRoleId] = useState(initial.acceptedRoleId);
  const [pages, setPages] = useState<FormPage[]>(initial.pages);
  const [automations, setAutomations] = useState<AutomationRule[]>(initial.automations);
  const [addType, setAddType] = useState<FieldType>("short_text");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Conditions can reference any field on any page, so offer the full list.
  const allFields = pages.flatMap((p) => p.fields);
  // Page targets for `skip_to` conditions (fall back to "Page N" when untitled).
  const pageOptions = pages.map((p, i) => ({ id: p.id, title: p.title?.trim() || `${t.page} ${i + 1}` }));

  function mutatePage(pi: number, fn: (page: FormPage) => FormPage) {
    setPages((prev) => prev.map((p, i) => (i === pi ? fn(p) : p)));
  }
  function setPageTitle(pi: number, value: string) {
    mutatePage(pi, (p) => ({ ...p, title: value }));
  }
  function addPage() {
    setPages((prev) => [...prev, { id: crypto.randomUUID(), title: "", fields: [] }]);
  }
  function removePage(pi: number) {
    setPages((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== pi)));
  }
  function movePage(pi: number, dir: -1 | 1) {
    setPages((prev) => {
      const target = pi + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[pi], next[target]] = [next[target]!, next[pi]!];
      return next;
    });
  }
  function updateField(pi: number, fi: number, next: FormField) {
    mutatePage(pi, (p) => ({ ...p, fields: p.fields.map((f, i) => (i === fi ? next : f)) }));
  }
  function removeField(pi: number, fi: number) {
    mutatePage(pi, (p) => ({ ...p, fields: p.fields.filter((_, i) => i !== fi) }));
  }
  function moveField(pi: number, fi: number, dir: -1 | 1) {
    mutatePage(pi, (p) => {
      const target = fi + dir;
      if (target < 0 || target >= p.fields.length) return p;
      const fields = [...p.fields];
      [fields[fi], fields[target]] = [fields[target]!, fields[fi]!];
      return { ...p, fields };
    });
  }
  function addField(pi: number) {
    mutatePage(pi, (p) => ({ ...p, fields: [...p.fields, newField(addType)] }));
  }

  async function save() {
    setError(null);
    if (!title.trim()) return setError(t.errTitle);
    if (!slug.trim()) return setError(t.errSlug);
    if (allFields.length === 0) return setError(t.errFields);

    const spec = {
      version: 1,
      pages: pages.map((p) => ({
        id: p.id,
        title: p.title?.trim() || undefined,
        fields: p.fields,
      })),
    };
    const settings: Record<string, unknown> = {};
    if (acceptedRoleId.trim()) settings.acceptedRoleId = acceptedRoleId.trim();
    if (automations.length > 0) settings.automations = automations;
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      slug: slug.trim(),
      status,
      visibility,
      spec,
      settings,
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
      setError(err instanceof Error ? err.message : t.errSave);
      setSaving(false);
    }
  }

  const typeOptions = BUILDER_FIELDS.map((f) => ({
    value: f.type,
    label: (t.ft as Record<string, string>)[f.type] ?? f.label,
  }));

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4 p-5">
        <Field label={t.title} required>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label={t.description}>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t.slug} required hint={t.slugHint}>
            <div className="flex gap-2">
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
              <button
                type="button"
                onClick={() => setSlug(slugify(title))}
                className="shrink-0 rounded-md border border-border px-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {t.auto}
              </button>
            </div>
          </Field>
          <Field label={t.status}>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: "draft", label: t.statusDraft },
                { value: "live", label: t.statusLive },
                { value: "closed", label: t.statusClosed },
                { value: "archived", label: t.statusArchived },
              ]}
            />
          </Field>
          <Field label={t.visibility}>
            <Select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              options={[
                { value: "public", label: t.visPublic },
                { value: "authenticated", label: t.visAuth },
              ]}
            />
          </Field>
        </div>
        <Field label={t.acceptedRole} hint={t.acceptedRoleHint}>
          <Input
            value={acceptedRoleId}
            placeholder="123456789012345678"
            onChange={(e) => setAcceptedRoleId(e.target.value)}
          />
        </Field>
      </Card>

      {pages.map((page, pi) => (
        <Card key={page.id} className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-primary">
              {t.page} {pi + 1}
            </span>
            <Input
              value={page.title ?? ""}
              placeholder={t.pageTitlePh}
              onChange={(e) => setPageTitle(pi, e.target.value)}
            />
            <PageButton label={t.moveUp} disabled={pi === 0} onClick={() => movePage(pi, -1)}>
              ↑
            </PageButton>
            <PageButton
              label={t.moveDown}
              disabled={pi === pages.length - 1}
              onClick={() => movePage(pi, 1)}
            >
              ↓
            </PageButton>
            <PageButton
              label={t.removePage}
              disabled={pages.length <= 1}
              onClick={() => removePage(pi)}
            >
              ✕
            </PageButton>
          </div>

          {page.fields.map((field, fi) => (
            <FieldEditor
              key={field.id}
              field={field}
              fields={allFields}
              pages={pageOptions}
              index={fi}
              isFirst={fi === 0}
              isLast={fi === page.fields.length - 1}
              onChange={(next) => updateField(pi, fi, next)}
              onRemove={() => removeField(pi, fi)}
              onMove={(dir) => moveField(pi, fi, dir)}
              t={t}
            />
          ))}

          <div className="flex items-end gap-3 border-t border-border pt-3">
            <Field label={t.addField}>
              <Select
                value={addType}
                onChange={(e) => setAddType(e.target.value as FieldType)}
                options={typeOptions}
              />
            </Field>
            <Button variant="ghost" type="button" onClick={() => addField(pi)}>
              + {t.add}
            </Button>
          </div>
        </Card>
      ))}

      <div>
        <Button variant="ghost" type="button" onClick={addPage}>
          + {t.addPage}
        </Button>
      </div>

      <Card className="flex flex-col gap-3 p-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-sm font-semibold text-foreground">{t.autom.title}</h3>
          <p className="text-xs text-muted-foreground">{t.autom.intro}</p>
        </div>
        {isPro ? (
          <AutomationsEditor
            automations={automations}
            fields={allFields}
            statusOptions={statusOptions}
            onChange={setAutomations}
            t={t}
          />
        ) : (
          <p className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-muted-foreground">
            ★ {automationsProBody}
          </p>
        )}
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? t.saving : formId ? t.saveChanges : t.createForm}
        </Button>
        <button
          type="button"
          onClick={() => router.push(`/dashboard/${guildId}/forms` as Route)}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {t.cancel}
        </button>
      </div>
    </div>
  );
}

function PageButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}
