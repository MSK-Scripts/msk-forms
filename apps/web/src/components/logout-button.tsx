"use client";

import { useState } from "react";

/** Logs out via POST /api/auth/logout, then reloads to reflect the new state. */
export function LogoutButton() {
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.reload();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      className="rounded-sm border border-border px-4 py-2 font-mono text-xs uppercase tracking-widest text-text-secondary transition-colors hover:border-border-accent hover:text-text-primary disabled:opacity-50"
    >
      {pending ? "…" : "Log out"}
    </button>
  );
}
