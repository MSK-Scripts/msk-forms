/** Subtle "Powered by MSK Forms" footer shown on Free guilds' public pages. */
export function PoweredBy({ label }: { label: string }) {
  return (
    <p className="pt-2 text-center text-xs text-muted-foreground">
      <a
        href="https://forms.msk-scripts.de"
        target="_blank"
        rel="noreferrer"
        className="transition-colors hover:text-foreground"
      >
        {label}
      </a>
    </p>
  );
}
