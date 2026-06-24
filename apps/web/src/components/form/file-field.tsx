"use client";

import type { FileAnswer, FormField } from "@msk-forms/shared";
import { useRef, useState } from "react";

export interface FileFieldLabels {
  uploading: string;
  remove: string;
  uploadFailed: string;
  /** Used by the signature pad's clear button. */
  clear: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * File/image upload control: on select it uploads to the form's upload endpoint
 * (server streams to MinIO) and stores the returned descriptor as the field's
 * answer. The bytes never go through the submit request.
 */
export function FileField({
  slug,
  field,
  value,
  onChange,
  disabled,
  labels,
}: {
  slug: string;
  field: FormField;
  value: FileAnswer | undefined;
  onChange: (value: FileAnswer | undefined) => void;
  disabled?: boolean;
  labels: FileFieldLabels;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept =
    field.validation.allowedMimeTypes?.join(",") ??
    (field.type === "image_upload" ? "image/*" : undefined);

  async function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("fieldId", field.id);
      const res = await fetch(`/api/forms/${slug}/upload`, { method: "POST", body: fd });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? labels.uploadFailed);
      }
      const data = (await res.json()) as FileAnswer;
      onChange({ key: data.key, name: data.name, size: data.size, mime: data.mime });
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.uploadFailed);
      onChange(undefined);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  if (value) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-md border border-input bg-background px-3 py-2 text-sm">
        <span className="truncate text-foreground">
          {value.name}{" "}
          <span className="text-muted-foreground">({formatSize(value.size)})</span>
        </span>
        <button
          type="button"
          onClick={() => {
            onChange(undefined);
            setError(null);
          }}
          disabled={disabled}
          className="shrink-0 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
        >
          {labels.remove}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled || uploading}
        onChange={onSelect}
        className="block w-full text-sm text-muted-foreground file:me-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-secondary/80 disabled:opacity-50"
      />
      {uploading && <p className="text-xs text-muted-foreground">{labels.uploading}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
