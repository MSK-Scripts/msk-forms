"use client";

import type { FieldType, FormField } from "@msk-forms/shared";
import { Button, Card, Field, Input, Select, Textarea } from "@msk-forms/ui";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FieldEditor } from "@/components/builder/field-editor";
import { BUILDER_FIELDS, needsOptions } from "@/lib/builder-fields";
import type { Dictionary } from "@/i18n";

type BuilderDict = Dictionary["builder"];

export interface FormBuilderInitial {
  title: string;
  description: string;
  slug: string;
  status: string;
  visibility: string;
  fields: FormField[];
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
  t,
}: {
  guildId: string;
  formId?: string;
  initial: FormBuilderInitial;
  t: BuilderDict;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [slug, setSlug] = useState(initial.slug);
  const [status, setStatus] = useState(initial.status);
  const [visibility, setVisibility] = useState(initial.visibility);
  const [fields, setFields] = useState<FormField[]>(initial.fields);
  const [addType, setAddType] = useState<FieldType>("short_text");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function updateField(index: number, next: FormField) {
    setFields((prev) => prev.map((f, i) => (i === index ? next : f)));
  }
  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }
  function moveField(index: number, dir: -1 | 1) {
    setFields((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  }
  function addField() {
    setFields((prev) => [...prev, newField(addType)]);
  }

  async function save() {
    setError(null);
    if (!title.trim()) return setError(t.errTitle);
    if (!slug.trim()) return setError(t.errSlug);
    if (fields.length === 0) return setError(t.errFields);

    const spec = { version: 1, pages: [{ id: "p1", fields }] };
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      slug: slug.trim(),
      status,
      visibility,
      spec,
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
      </Card>

      <div className="flex flex-col gap-3">
        {fields.map((field, i) => (
          <FieldEditor
            key={field.id}
            field={field}
            fields={fields}
            index={i}
            isFirst={i === 0}
            isLast={i === fields.length - 1}
            onChange={(next) => updateField(i, next)}
            onRemove={() => removeField(i)}
            onMove={(dir) => moveField(i, dir)}
            t={t}
          />
        ))}
      </div>

      <Card className="flex items-end gap-3 p-4">
        <Field label={t.addField}>
          <Select
            value={addType}
            onChange={(e) => setAddType(e.target.value as FieldType)}
            options={BUILDER_FIELDS.map((f) => ({
              value: f.type,
              label: (t.ft as Record<string, string>)[f.type] ?? f.label,
            }))}
          />
        </Field>
        <Button variant="ghost" type="button" onClick={addField}>
          + {t.add}
        </Button>
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
