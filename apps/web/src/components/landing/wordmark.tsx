/** MSK Forms wordmark: the green "M" brand mark (public/logo.png) + Syne wordmark. */
export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <img src="/logo.png" alt="" width={26} height={26} className="h-[26px] w-auto" />
      <span className="font-heading text-lg font-extrabold tracking-tight text-text-primary">
        MSK<span className="text-accent">Forms</span>
      </span>
    </span>
  );
}
