"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Subscribes to a guild's realtime topic and refreshes the (server-rendered)
 * dashboard page when any of its submissions change — no polling. Best-effort:
 * silently retries if the WebSocket can't connect (e.g. dev without the proxy).
 * Requires a signed `token` from the server (off when REALTIME_TOKEN_SECRET is
 * unset, so this component just isn't rendered then).
 */
export function DashboardLive({ guildId, token }: { guildId: string; token: string }) {
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
        ws?.send(JSON.stringify({ type: "subscribe", topic: `guild:${guildId}`, token }));
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as { type?: string };
          if (msg.type === "update") router.refresh();
        } catch {
          /* ignore malformed frames */
        }
      };
      ws.onclose = () => {
        if (!closed) retry = setTimeout(connect, 5000);
      };
      ws.onerror = () => ws?.close();
    };

    connect();
    return () => {
      closed = true;
      if (retry) clearTimeout(retry);
      ws?.close();
    };
  }, [guildId, token, router]);

  return null;
}
