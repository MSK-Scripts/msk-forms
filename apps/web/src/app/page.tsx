export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="font-mono text-xs uppercase tracking-widest text-accent">
        MSK Scripts
      </span>
      <h1 className="font-heading text-5xl font-bold">MSK Forms</h1>
      <p className="max-w-xl text-text-secondary">
        Moderne Form- &amp; Bewerbungs-Plattform mit echtem Status-Feedback und nativer
        Discord-Integration. Phase&nbsp;0 — Foundation.
      </p>
      <div className="rounded-lg border border-border bg-bg-panel px-5 py-3 font-mono text-sm text-text-muted shadow-panel">
        🚧 In Entwicklung — siehe <span className="text-accent">Konzept.md</span>
      </div>
    </main>
  );
}
