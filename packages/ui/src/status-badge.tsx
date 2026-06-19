export interface StatusBadgeProps {
  label: string;
  color?: string;
}

export function StatusBadge({ label, color = "#6b6b72" }: StatusBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-sm border px-3 py-1 font-mono text-xs uppercase tracking-wide"
      style={{ borderColor: `${color}59`, color }}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
