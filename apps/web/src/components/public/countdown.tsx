"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Live countdown to a scheduled form's opening time. Ticks every second and,
 * when it reaches zero, refreshes the route so the now-open form appears. With
 * `celebrate`, it fires a burst of confetti at that moment (used on the public
 * form page where the applicant is waiting).
 *
 * The initial render is timezone/clock independent (label only) to avoid a
 * hydration mismatch; the ticking numbers appear after mount.
 */
export function Countdown({
  targetIso,
  label,
  celebrate = false,
}: {
  targetIso: string;
  label: string;
  celebrate?: boolean;
}) {
  const router = useRouter();
  const target = new Date(targetIso).getTime();
  const [remaining, setRemaining] = useState<number | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    function tick() {
      const ms = target - Date.now();
      setRemaining(Math.max(0, ms));
      if (ms <= 0 && !firedRef.current) {
        firedRef.current = true;
        if (celebrate) fireConfetti();
        // Give the confetti a moment before swapping the form in.
        window.setTimeout(() => router.refresh(), celebrate ? 1500 : 0);
      }
    }
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target, celebrate, router]);

  if (remaining === null) {
    // Pre-mount placeholder (SSR + first paint): label only, no clock read.
    return (
      <span className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
        {label}
      </span>
    );
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const clock = `${days > 0 ? `${days}d ` : ""}${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return (
    <span className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
      {label}
      <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
      <span className="font-mono font-medium tabular-nums text-primary">{clock}</span>
    </span>
  );
}

/** Self-contained canvas confetti burst — no dependency, CSP-safe (no eval). */
function fireConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9999";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const colors = ["#4ea426", "#5eb131", "#f59e0b", "#3b82f6", "#ec4899", "#ffffff"];
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
