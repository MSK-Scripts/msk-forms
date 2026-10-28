"use client";

import { useId, useState } from "react";

import { Check, Copy } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CopyFieldCopy {
  copy: string;
  copied: string;
  failed: string;
}

/**
 * A value to copy: a public form link, a webhook secret, a DNS record.
 *
 * The value stays selectable text, so it can always be copied by hand; the
 * button only saves the work. The browser refuses the clipboard outside a
 * secure context, and then the field says so instead of showing a tick that
 * lies. Copy: `kit.copyField`.
 */
export function CopyField({
  value,
  label,
  copy,
  className,
}: {
  value: string;
  /** Visible name of the value; also names the button for a screen reader. */
  label?: string;
  copy: CopyFieldCopy;
  className?: string;
}) {
  const labelId = useId();
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("failed");
    }
  }

  return (
    <div className={cn("grid min-w-0 gap-1.5", className)}>
      {label && (
        <span id={labelId} className="text-small font-semibold">
          {label}
        </span>
      )}
      <div className="flex min-w-0 flex-wrap items-stretch gap-2">
        <code
          aria-labelledby={label ? labelId : undefined}
          className="flex min-h-11 min-w-0 flex-1 basis-56 items-center rounded-md border border-border bg-muted px-3 py-2 font-mono text-small break-all"
        >
          {value}
        </code>
        <Button
          variant="outline"
          onClick={onCopy}
          aria-describedby={label ? labelId : undefined}
          className="shrink-0"
        >
          {state === "copied" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {state === "copied" ? copy.copied : copy.copy}
        </Button>
      </div>
      <p role="status" className="text-small text-danger empty:hidden">
        {state === "failed" ? copy.failed : ""}
      </p>
    </div>
  );
}
