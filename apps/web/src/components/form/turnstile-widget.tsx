"use client";

import { useEffect, useRef } from "react";

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      theme?: "auto" | "light" | "dark";
    },
  ) => string;
  remove: (id: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/**
 * Renders the Cloudflare Turnstile widget and reports the solved token to the
 * parent. The api.js script is loaded by the page (with the CSP nonce); this
 * component waits for `window.turnstile`, then renders explicitly so the token
 * flows into React state. Remount with a changing `key` to force a fresh token.
 */
export function TurnstileWidget({
  siteKey,
  onToken,
}: {
  siteKey: string;
  onToken: (token: string | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let widgetId: string | null = null;
    let poll: ReturnType<typeof setInterval> | undefined;

    function render() {
      if (!ref.current || !window.turnstile) return false;
      widgetId = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        callback: (token) => onToken(token),
        "expired-callback": () => onToken(null),
        "error-callback": () => onToken(null),
        theme: "auto",
      });
      return true;
    }

    if (!render()) {
      poll = setInterval(() => {
        if (render() && poll) clearInterval(poll);
      }, 200);
    }

    return () => {
      if (poll) clearInterval(poll);
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [siteKey, onToken]);

  return <div ref={ref} />;
}
