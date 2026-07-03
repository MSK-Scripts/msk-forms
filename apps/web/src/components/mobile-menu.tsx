"use client";

import { IconMenu2, IconX } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

/**
 * Mobile-only header menu (`sm:hidden`). Holds the nav links and auth actions
 * that don't fit the bar on a phone, behind a hamburger. Closes on outside
 * click, Escape, or any click inside (so navigating a link dismisses it).
 */
export function MobileMenu({ children, label }: { children: React.ReactNode; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative sm:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <IconX size={20} stroke={1.75} /> : <IconMenu2 size={20} stroke={1.75} />}
      </Button>
      {open && (
        <div
          role="menu"
          onClick={() => setOpen(false)}
          className="absolute end-0 z-50 mt-1.5 w-56 rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-md"
        >
          {children}
        </div>
      )}
    </div>
  );
}
