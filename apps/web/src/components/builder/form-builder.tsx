"use client";

import type { FieldType, FormField } from "@msk-forms/shared";
import { Button, Card, Field, Input, Select, Textarea } from "@msk-forms/ui";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FieldEditor } from "@/components/builder/field-editor";
import { BUILDER_FIELDS, needsOptions } from "@/lib/builder-fields";

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
}: {
  guildId: string;
  formId?: string;
  initial: FormBuilderInitial;
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
    if (!title.trim()) return setError("Title is required.");
    if (!slug.trim()) return setError("Slug is required.");
    if (fields.length === 0) return setError("Add at least one field.");

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
        throw new Error(data?.error ?? "Could not save the form.");
      }
      router.push(`/dashboard/${guildId}/forms` as Route);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the form.");
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4 p-5">
        <Field label="Title" required>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Description">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Slug" required hint="Public URL: /f/<slug>">
            <div className="flex gap-2">
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
              <button
                type="button"
                onClick={() => setSlug(slugify(title))}
                className="shrink-0 rounded-sm border border-border px-2 font-mono text-xs uppercase text-muted-foreground hover:border-primary/40"
              >
                Auto
              </button>
            </div>
          </Field>
          <Field label="Status">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: "draft", label: "Draft" },
                { value: "live", label: "Live" },
                { value: "closed", label: "Closed" },
                { value: "archived", label: "Archived" },
              ]}
            />
          </Field>
          <Field label="Visibility">
            <Select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              options={[
                { value: "public", label: "Public" },
                { value: "authenticated", label: "Login required" },
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
            index={i}
            isFirst={i === 0}
            isLast={i === fields.length - 1}
            onChange={(next) => updateField(i, next)}
            onRemove={() => removeField(i)}
            onMove={(dir) => moveField(i, dir)}
          />
        ))}
      </div>

      <Card className="flex items-end gap-3 p-4">
        <Field label="Add field">
          <Select
            value={addType}
            onChange={(e) => setAddType(e.target.value as FieldType)}
            options={BUILDER_FIELDS.map((f) => ({ value: f.type, label: f.label }))}
          />
        </Field>
        <Button variant="ghost" type="button" onClick={addField}>
          + Add
        </Button>
      </Card>

      {error && <p className="font-mono text-xs text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? "Saving…" : formId ? "Save changes" : "Create form"}
        </Button>
        <button
          type="button"
          onClick={() => router.push(`/dashboard/${guildId}/forms` as Route)}
          className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-muted-foreground"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
