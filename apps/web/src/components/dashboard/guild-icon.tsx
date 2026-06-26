"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Guild avatar with a layered fallback:
 *   1. the Discord server icon (preferred),
 *   2. the guild's uploaded MSK Forms branding logo,
 *   3. the guild's initial.
 *
 * Each image falls through on load error (Discord purges old icon hashes when a
 * server changes its icon, so a stale cached URL 404s) — so a broken icon shows
 * the logo, and a broken/absent logo shows the initial, never the browser's
 * broken-image glyph. `className` carries the shared rounding/size context.
 */
export function GuildIcon({
  icon,
  logoUrl,
  name,
  size,
  className,
  fallbackTextClassName,
}: {
  icon: string | null;
  logoUrl?: string | null;
  name: string;
  size: number;
  className?: string;
  fallbackTextClassName?: string;
}) {
  const [iconFailed, setIconFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const showIcon = Boolean(icon) && !iconFailed;
  const showLogo = !showIcon && Boolean(logoUrl) && !logoFailed;

  if (showIcon || showLogo) {
    return (
      <img
        src={(showIcon ? icon : logoUrl) as string}
        alt=""
        width={size}
        height={size}
        onError={() => (showIcon ? setIconFailed(true) : setLogoFailed(true))}
        className={cn("shrink-0 object-contain", className)}
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
