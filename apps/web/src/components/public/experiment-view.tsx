"use client";

import { useEffect, useRef } from "react";

/**
 * Fires a single A/B-test view event for the assigned variant when the public
 * form mounts. The endpoint records the view and sets the sticky cookie. Renders
 * nothing.
 */
export function ExperimentView({ slug, variant }: { slug: string; variant: string }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void fetch(`/api/forms/${slug}/experiment/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant }),
      keepalive: true,
    }).catch(() => undefined);
  }, [slug, variant]);
  return null;
}
