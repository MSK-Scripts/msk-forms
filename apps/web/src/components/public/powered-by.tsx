/** The small "Powered by MSK Forms" line in the footer of a Free guild's public pages. */
export function PoweredBy({ label }: { label: string }) {
  return (
    <p className="text-small text-muted-foreground">
      <a
        href="https://forms.msk-scripts.de"
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 items-center underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        {label}
      </a>
    </p>
  );
}
