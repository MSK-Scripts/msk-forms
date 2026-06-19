import { logoutAction } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";

/**
 * Logout via a Server Action form. Native form POST means it works even if
 * client-side hydration is delayed or blocked.
 */
export function LogoutButton({ label = "Log out" }: { label?: string }) {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="ghost" size="sm">
        {label}
      </Button>
    </form>
  );
}
