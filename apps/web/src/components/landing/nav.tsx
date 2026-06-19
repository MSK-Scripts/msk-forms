import { IconBrandDiscord } from "@tabler/icons-react";

import { LogoutButton } from "@/components/logout-button";
import { Wordmark } from "@/components/landing/wordmark";

interface NavUser {
  username: string;
  avatar: string | null;
}

export function LandingNav({ user }: { user: NavUser | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6">
        <a href="/" aria-label="MSK Forms home">
          <Wordmark />
        </a>

        {user ? (
          <div className="flex items-center gap-3">
            {user.avatar && (
              <img src={user.avatar} alt="" width={28} height={28} className="rounded-full" />
            )}
            <a
              href="/dashboard"
              className="rounded-sm px-3 py-2 font-mono text-xs font-bold uppercase tracking-widest text-text-secondary transition-colors hover:text-text-primary"
            >
              Dashboard
            </a>
            <LogoutButton />
          </div>
        ) : (
          <a
            href="/api/auth/discord/login"
            className="inline-flex items-center gap-2 rounded-sm bg-accent px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-accent-ink transition-[transform,background-color] duration-150 ease-out hover:bg-accent-dim active:scale-[0.98]"
          >
            <IconBrandDiscord size={16} stroke={1.75} />
            Log in
          </a>
        )}
      </div>
    </header>
  );
}
