import { logoutAction } from "@/lib/auth-actions";

/**
 * Logout via a Server Action form. Native form POST means it works even if
 * client-side hydration is delayed or blocked.
 */
export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-sm border border-border px-4 py-2 font-mono text-xs uppercase tracking-widest text-text-secondary transition-colors hover:border-border-accent hover:text-text-primary"
      >
        Log out
      </button>
    </form>
  );
}
