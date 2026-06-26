"use client";

import { useEffect } from "react";

/**
 * Registers the service worker (PWA installability + offline shell). Production
 * only — in dev a SW fights HMR and caches stale chunks. Registration is a
 * normal bundled module (loaded via the CSP nonce + 'strict-dynamic'), so no
 * inline script is needed.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* installability is best-effort; ignore */
      });
    };

    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
