/** MSK Forms wordmark: the green "M" brand mark (public/logo.png) + wordmark. */
export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2">
      <img src="/logo.png" alt="" width={24} height={24} className="h-6 w-auto" />
      <span className="font-heading text-base font-bold tracking-tight text-foreground">
        MSK<span className="text-primary">Forms</span>
      </span>
    </span>
  );
}
