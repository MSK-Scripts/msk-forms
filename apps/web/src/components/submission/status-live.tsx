"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Subscribes to the realtime service for this submission and refreshes the
 * (server-rendered) status page when it changes — no polling, no manual reload.
 * Fully best-effort: if the WebSocket can't connect (e.g. local dev without the
 * Apache /realtime proxy) it silently retries and the page still works.
 */
export function StatusLive({ submissionId }: { submissionId: string }) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined" || !("WebSocket" in window)) return;
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${proto}//${window.location.host}/realtime`;

    let ws: WebSocket | null = null;
    let closed = false;
    let retry: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      if (closed) return;
      try {
        ws = new WebSocket(url);
      } catch {
        return;
      }
      ws.onopen = () =>
        ws?.send(JSON.stringify({ type: "subscribe", topic: `submission:${submissionId}` }));
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as { type?: string };
          if (msg.type === "update") router.refresh();
        } catch {
          /* ignore malformed frames */
        }
      };
      ws.onclose = () => {
        if (!closed) retry = setTimeout(connect, 5000); // reconnect with backoff
      };
      ws.onerror = () => ws?.close();
    };

    connect();
    return () => {
      closed = true;
      if (retry) clearTimeout(retry);
      ws?.close();
    };
  }, [submissionId, router]);

  return null;
}
