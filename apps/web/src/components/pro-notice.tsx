import type { ReactNode } from "react";

import { Star } from "@/components/icons";
import { Badge } from "@/components/ui/badge";

/**
 * Says that an area or a control needs the Pro plan, in place of what it
 * gates: the plan as a tag, a title, one sentence and the upgrade as the one
 * next step. A surface of its own, because the upgrade is a task of its own.
 */
export function ProNotice({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="grid justify-items-start gap-2 rounded-lg border border-border bg-card p-[clamp(1rem,0.8rem+0.6vw,1.5rem)]">
      <Badge>
        <Star className="h-3.5 w-3.5" weight="bold" />
        Pro
      </Badge>
      <p className="font-display text-h3 font-[650]">{title}</p>
      <p className="max-w-[65ch] text-muted-foreground">{body}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
