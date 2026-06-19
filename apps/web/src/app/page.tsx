export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="font-mono text-xs uppercase tracking-widest text-accent">
        MSK Scripts
      </span>
      <h1 className="font-heading text-5xl font-bold">MSK Forms</h1>
      <p className="max-w-xl text-text-secondary">
        A modern form &amp; application platform with real status feedback and native
        Discord integration. Phase&nbsp;0 — Foundation.
      </p>
      <div className="rounded-lg border border-border bg-bg-panel px-5 py-3 font-mono text-sm text-text-muted shadow-panel">
        🚧 Work in progress
      </div>
    </main>
  );
}
