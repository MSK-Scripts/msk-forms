"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  /** Content between the description and the buttons, a field say. */
  body?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * Modal dialog on the native <dialog> element.
 *
 * showModal() brings focus trapping, Escape to close, an inert page behind it
 * and the top layer without any script of ours, and injects no <style>
 * element at runtime. The page behind stops scrolling through a rule in
 * globals.css.
 *
 * Buttons go in as children; the confirming one last, red only when the
 * action destroys something.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  body,
  children,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      // A click on the backdrop lands on the dialog element itself.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "m-auto w-[min(100%_-_2rem,30rem)] rounded-lg border border-border bg-card p-5",
        "text-card-foreground shadow-[var(--shadow-card-hover)] backdrop:bg-black/50",
        className,
      )}
    >
      <div className="grid gap-2.5">
        <h2 id={titleId} className="text-h3 font-semibold">
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className="text-small text-muted-foreground">
            {description}
          </p>
        )}
        {body && <div className="mt-1.5">{body}</div>}
        {children && <div className="mt-1.5 flex flex-wrap justify-end gap-3">{children}</div>}
      </div>
    </dialog>
  );
}
