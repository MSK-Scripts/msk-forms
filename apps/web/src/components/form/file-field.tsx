"use client";

import type { FileAnswer, FormField } from "@msk-forms/shared";
import { useRef, useState } from "react";

import { UploadSimple, WarningCircle } from "@/components/icons";

export interface FileFieldLabels {
  uploading: string;
  remove: string;
  uploadFailed: string;
  /** Used by the signature pad's clear button. */
  clear: string;
  /** The signature pad's word for a stored signature. */
  uploaded: string;
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
  id,
  describedBy,
  slug,
  field,
  value,
  onChange,
  disabled,
  labels,
}: {
  id: string;
  describedBy?: string;
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
      <div className="flex min-h-11 items-center justify-between gap-3 rounded-md border-[1.5px] border-input bg-card py-1 ps-3 pe-1">
        <span className="min-w-0 truncate text-foreground">
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
          className="inline-flex min-h-11 shrink-0 items-center rounded-md px-3 font-semibold text-muted-foreground transition-colors hover:text-danger"
        >
          {labels.remove}
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-1.5">
      <input
        ref={inputRef}
        id={id}
        aria-describedby={describedBy}
        type="file"
        accept={accept}
        disabled={disabled || uploading}
        onChange={onSelect}
        className="block w-full text-base text-muted-foreground file:me-3 file:min-h-11 file:cursor-pointer file:rounded-md file:border-[1.5px] file:border-input file:bg-card file:px-4 file:py-2 file:font-semibold file:text-foreground hover:file:border-foreground disabled:opacity-50"
      />
      <p role="status" className="text-small text-muted-foreground empty:hidden">
        {uploading && (
          <span className="inline-flex items-center gap-1.5">
            <UploadSimple className="h-4 w-4" />
            {labels.uploading}
          </span>
        )}
      </p>
      {error && (
        <p role="alert" className="flex items-start gap-1.5 text-small font-semibold text-danger">
          <WarningCircle className="mt-0.5 h-4 w-4 shrink-0" weight="bold" />
          {error}
        </p>
      )}
    </div>
  );
}
