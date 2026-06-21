"use client";

import type { FileAnswer, FormField } from "@msk-forms/shared";
import { useRef, useState } from "react";

import type { FileFieldLabels } from "./file-field";

/**
 * Signature pad: the applicant draws on a canvas; on each completed stroke the
 * drawing is exported to a PNG and uploaded through the form's normal upload
 * endpoint (server → MinIO), so the answer is a `FileAnswer` like any file field.
 */
export function SignatureField({
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const dirty = useRef(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    if (disabled) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineTo(x, y);
    ctx.stroke();
    dirty.current = true;
  }

  async function end() {
    if (!drawing.current) return;
    drawing.current = false;
    if (dirty.current) await upload();
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    dirty.current = false;
    setError(null);
    onChange(undefined);
  }

  async function upload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return;

    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", new File([blob], "signature.png", { type: "image/png" }));
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
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <canvas
        ref={canvasRef}
        width={500}
        height={160}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="h-40 w-full touch-none rounded-md border border-input bg-white"
      />
      <div className="flex items-center gap-3 text-xs">
        <button
          type="button"
          onClick={clear}
          disabled={disabled || uploading}
          className="font-medium text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
        >
          {labels.clear}
        </button>
        {uploading && <span className="text-muted-foreground">{labels.uploading}</span>}
        {!uploading && value && <span className="text-primary">✓</span>}
        {error && <span className="text-destructive">{error}</span>}
      </div>
    </div>
  );
}
