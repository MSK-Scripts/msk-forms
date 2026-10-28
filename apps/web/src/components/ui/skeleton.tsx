import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** Placeholder while data loads, with a quiet pulse (stopped under reduced motion). */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}
