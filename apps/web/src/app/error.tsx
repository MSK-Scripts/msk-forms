"use client";

import { useEffect } from "react";

import { ArrowClockwise } from "@/components/icons";
import { useErrorCopy } from "@/components/site/error-copy";
import { Button } from "@/components/ui/button";

/**
 * Error page for anything below the root layout. A client component by
 * Next's rule, so it cannot render the server-side site header; it keeps to
 * a small frame of its own with the one `<main id="main">`, and its copy
 * comes from the root layout (components/site/error-copy.tsx).
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useErrorCopy();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col border-t-4 border-t-brand">
      <main
        id="main"
        tabIndex={-1}
        className="container-page flex-1 py-[clamp(4rem,2rem+6vw,10rem)] focus:outline-none"
      >
        <div className="grid max-w-[40rem] gap-5">
          <img
            src="/logo.png"
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-lg object-contain"
          />
          <span className="kicker">{t.kicker}</span>
          <h1 className="text-display font-[750] tracking-[-0.02em] text-balance">{t.title}</h1>
          <p className="max-w-[34rem] text-lead text-muted-foreground">{t.text}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Button type="button" onClick={reset}>
              <ArrowClockwise className="h-4 w-4" />
              {t.retry}
            </Button>
            <Button asChild variant="outline">
              <a href="/">{t.home}</a>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
