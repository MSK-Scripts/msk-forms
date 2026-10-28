import type { ReactNode } from "react";

import { CheckCircle, Info, Minus, Warning, XCircle, type IconComponent } from "@/components/icons";
import { cn } from "@/lib/utils";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE: Record<StatusTone, { className: string; icon: IconComponent }> = {
  // Word and border in the status colour. Every status colour reaches 4.5:1 on
  // card and ground in both themes, also on its own tint, and the border is
  // the 3:1 a control needs (src/test/contrast.test.ts).
  success: { className: "text-success border-success bg-success/8", icon: CheckCircle },
  warning: { className: "text-warning border-warning bg-warning/8", icon: Warning },
  danger: { className: "text-danger border-danger bg-danger/8", icon: XCircle },
  info: { className: "text-info border-info bg-info/8", icon: Info },
  neutral: { className: "text-muted-foreground border-input bg-transparent", icon: Minus },
};

/**
 * State of a system object: "Live", "Draft", "Pending DNS".
 *
 * Always a word and a sign, never colour alone (WCAG 1.4.1): the icon is the
 * second feature, the border the third. Same state, same tone across the
 * dashboard. Only for system states, not for categories or tags; those are
 * `Badge` from components/ui. A guild's own submission statuses with their
 * custom colours are `SubmissionStatusBadge` from @msk-forms/ui.
 */
export function StatusBadge({
  tone,
  children,
  icon,
  className,
}: {
  tone: StatusTone;
  /** One or two words, a participle where it fits ("Archived", "Rejected"). */
  children: ReactNode;
  /** A sign of its own for this state; the tone's sign otherwise. */
  icon?: IconComponent;
  className?: string;
}) {
  const { className: toneClass, icon: ToneIcon } = TONE[tone];
  const Icon = icon ?? ToneIcon;
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-sm border-[1.5px] px-2 py-0.5 text-small font-semibold leading-tight",
        toneClass,
        className,
      )}
    >
      <Icon className="h-4 w-4 shrink-0" weight="bold" />
      {children}
    </span>
  );
}
