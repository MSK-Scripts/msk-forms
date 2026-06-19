import { Wordmark } from "@/components/landing/wordmark";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-content flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xs">
          <Wordmark />
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            Application forms with a real status loop, by MSK Scripts.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs uppercase tracking-widest text-text-secondary">
          <a href="/f/demo-whitelist" className="transition-colors hover:text-text-primary">
            Demo form
          </a>
          <a
            href="https://docu.msk-scripts.de"
            className="transition-colors hover:text-text-primary"
          >
            Documentation
          </a>
          <a
            href="https://msk-scripts.de"
            className="transition-colors hover:text-text-primary"
          >
            MSK Scripts
          </a>
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-content px-6 py-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-text-muted">
            © 2026 MSK Scripts
          </p>
        </div>
      </div>
    </footer>
  );
}
