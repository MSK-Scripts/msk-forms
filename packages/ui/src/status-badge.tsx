export interface StatusBadgeProps {
  label: string;
  color?: string;
}

/**
 * A submission status in a guild's own colour: the colour as a dot, the word
 * in the text colour. A guild picks any colour for its statuses, and as text
 * many of them would not reach 4.5:1 on the ground; the dot carries the
 * colour and the word stays readable, so it is never told by colour alone.
 */
export function StatusBadge({ label, color = "#6b6b72" }: StatusBadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-sm border border-input px-2.5 py-1 text-small font-semibold text-foreground">
      <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
