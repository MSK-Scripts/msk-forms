export interface SubmissionStatusBadgeProps {
  label: string;
  color?: string;
}

/**
 * A submission status in a guild's own colour: the colour as a dot, the word
 * in the text colour. A guild picks any colour for its statuses, and as text
 * many of them would not reach 4.5:1 on the ground; the dot carries the
 * colour and the word stays readable in both themes, so the status is never
 * told by colour alone. A thin edge in the text colour keeps a pale colour
 * (a light yellow on white, a navy on the dark ground) visible as a dot.
 *
 * Not the dashboard kit's `StatusBadge`: that one shows the state of a system
 * object (live, draft, failed) in one of the fixed status tones with a sign.
 * This one shows a customer-defined status in the customer's colour.
 */
export function SubmissionStatusBadge({ label, color = "#6b6b72" }: SubmissionStatusBadgeProps) {
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-sm border border-input px-2.5 py-1 text-small font-semibold leading-tight text-foreground">
      <span
        aria-hidden="true"
        className="h-2.5 w-2.5 shrink-0 rounded-full shadow-[0_0_0_1px_hsl(var(--foreground)/0.35)]"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
