"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export interface CountdownUnits {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

/**
 * Live countdown to a scheduled form's opening time, the customer's own
 * content on their page. Ticks every second and, at zero, refreshes the route
 * so the now-open form appears. With `celebrate` it fires a burst of confetti
 * in the guild's colours at that moment, unless the visitor asked the system
 * for reduced motion.
 *
 * The first render is clock independent (label only) to avoid a hydration
 * mismatch; the figures appear after mount. The ticking figures are hidden
 * from screen readers, which would otherwise be told every second; the
 * opening time beside them (rendered by the page) is what they read.
 */
export function Countdown({
  targetIso,
  label,
  units,
  celebrate = false,
  size = "lg",
}: {
  targetIso: string;
  label: string;
  units: CountdownUnits;
  celebrate?: boolean;
  /** `lg` on the form page, `sm` in the form index. */
  size?: "lg" | "sm";
}) {
  const router = useRouter();
  const target = new Date(targetIso).getTime();
  const [remaining, setRemaining] = useState<number | null>(null);
  const firedRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function tick() {
      const ms = target - Date.now();
      setRemaining(Math.max(0, ms));
      if (ms <= 0 && !firedRef.current) {
        firedRef.current = true;
        const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const party = celebrate && !still;
        if (party) fireConfetti(confettiColours(rootRef.current));
        // Give the confetti a moment before swapping the form in.
        window.setTimeout(() => router.refresh(), party ? 1500 : 0);
      }
    }
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target, celebrate, router]);

  const totalSeconds = Math.floor((remaining ?? 0) / 1000);
  const parts = [
    { value: Math.floor(totalSeconds / 86_400), unit: units.days },
    { value: Math.floor((totalSeconds % 86_400) / 3600), unit: units.hours },
    { value: Math.floor((totalSeconds % 3600) / 60), unit: units.minutes },
    { value: totalSeconds % 60, unit: units.seconds },
  ].filter((part, i) => i > 0 || part.value > 0);

  return (
    <div ref={rootRef} className="grid gap-2">
      <p className={cn("font-semibold text-muted-foreground", size === "sm" && "text-small")}>{label}</p>
      {remaining !== null && (
        <dl aria-hidden className="flex flex-wrap gap-x-[clamp(1rem,0.5rem+1.5vw,2rem)] gap-y-2">
          {parts.map((part) => (
            <div key={part.unit} className="grid">
              {/* The unit is the term, the figure its value; shown figure first. */}
              <dt className="order-2 text-label font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                {part.unit}
              </dt>
              <dd
                className={cn(
                  "order-1 font-display font-bold tabular-nums text-primary",
                  size === "lg" ? "text-display leading-none" : "text-h3",
                )}
              >
                {String(part.value).padStart(2, "0")}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

/**
 * The guild's colours for the confetti: its accent as the page shows it and
 * the chart series of the theme, read from the custom properties in effect
 * where the countdown sits. No hard-coded brand green.
 */
function confettiColours(el: HTMLElement | null): string[] {
  const style = getComputedStyle(el ?? document.documentElement);
  const colours = ["--primary", "--chart-2", "--chart-3", "--chart-4", "--chart-5"]
    .map((name) => style.getPropertyValue(name).trim())
    .filter(Boolean)
    .map((channels) => `hsl(${channels})`);
  return colours.length > 0 ? [...colours, "#ffffff"] : ["#ffffff"];
}

/** Self-contained canvas confetti burst: no dependency, CSP-safe (no eval). */
function fireConfetti(colors: string[]) {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const gravity = 0.32;
  const parts = Array.from({ length: 160 }, () => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * 160,
    y: canvas.height / 3,
    vx: (Math.random() - 0.5) * 13,
    vy: Math.random() * -16 - 4,
    size: Math.random() * 6 + 4,
    color: colors[Math.floor(Math.random() * colors.length)]!,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.35,
  }));

  const start = performance.now();
  let raf = 0;
  function frame(now: number) {
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    for (const p of parts) {
      p.vy += gravity;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      if (p.y < canvas.height + 24) alive = true;
      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rot);
      ctx!.fillStyle = p.color;
      ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx!.restore();
    }
    if (alive && now - start < 5000) {
      raf = requestAnimationFrame(frame);
    } else {
      cancelAnimationFrame(raf);
      canvas.remove();
    }
  }
  raf = requestAnimationFrame(frame);
}
