"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Discord server icon with a graceful fallback. If the cached CDN URL fails to
 * load (Discord purges old icon hashes when a server changes its icon, so a
 * stale stored URL 404s), we fall back to the guild's initial instead of the
 * browser's broken-image glyph. `className` carries the rounding/size context
 * shared by the image and the fallback box.
 */
export function GuildIcon({
  icon,
  name,
  size,
  className,
  fallbackTextClassName,
}: {
  icon: string | null;
  name: string;
  size: number;
  className?: string;
  fallbackTextClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (icon && !failed) {
    return (
      <img
        src={icon}
        alt=""
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className={cn("shrink-0", className)}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "flex shrink-0 items-center justify-center bg-muted font-heading text-muted-foreground",
        className,
        fallbackTextClassName,
      )}
    >
      {name.charAt(0)}
    </div>
  );
}
