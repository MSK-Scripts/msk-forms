import { StatusBadge, type StatusTone } from "@/components/dashboard-kit";
import { Lock, type IconComponent } from "@/components/icons";

export type FormStatus = "draft" | "live" | "closed";

/**
 * The one rule for the state of a form, wherever it shows (the forms list,
 * the builder's head): live is success with a check, a draft is neutral with
 * a dash, and closed is neutral with a lock. Closing a form is a decision,
 * not a problem, so it is told apart by its word and its sign, not by a
 * warning colour. Only "ending soon" asks for attention (warning, hourglass).
 */
const STATE: Record<FormStatus, { tone: StatusTone; icon?: IconComponent }> = {
  live: { tone: "success" },
  draft: { tone: "neutral" },
  closed: { tone: "neutral", icon: Lock },
};

/** Narrows a stored status to a known one; anything else shows as a draft. */
export function formStatus(value: string): FormStatus {
  return value === "live" || value === "closed" ? value : "draft";
}

export function FormStateBadge({ status, label }: { status: FormStatus; label: string }) {
  const { tone, icon } = STATE[status];
  return (
    <StatusBadge tone={tone} icon={icon}>
      {label}
    </StatusBadge>
  );
}
