import { LogoutButton } from "@/components/logout-button";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string }>;
}) {
  const user = await getCurrentUser();
  const { auth } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="font-mono text-xs uppercase tracking-widest text-accent">
        MSK Scripts
      </span>
      <h1 className="font-heading text-5xl font-bold">MSK Forms</h1>
      <p className="max-w-xl text-text-secondary">
        A modern form &amp; application platform with real status feedback and native
        Discord integration.
      </p>

      {auth === "error" && (
        <div className="rounded-sm border border-red-500/40 bg-red-500/10 px-4 py-2 font-mono text-xs text-red-400">
          Login failed — please try again.
        </div>
      )}

      {user ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-bg-panel px-5 py-3 shadow-panel">
            {user.avatar && (
              <img
                src={user.avatar}
                alt=""
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <span className="font-mono text-sm text-text-primary">{user.username}</span>
          </div>
          <div className="flex gap-3">
            <a
              href="/dashboard"
              className="rounded-sm bg-accent px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-bg transition-opacity hover:opacity-90"
            >
              Dashboard
            </a>
            <LogoutButton />
          </div>
        </div>
      ) : (
        <a
          href="/api/auth/discord/login"
          className="rounded-sm bg-accent px-5 py-3 font-mono text-sm font-bold uppercase tracking-widest text-bg transition-opacity hover:opacity-90"
        >
          Log in with Discord
        </a>
      )}
    </main>
  );
}
