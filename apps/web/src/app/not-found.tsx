import { SiteChrome } from "@/components/site/site-chrome";
import { Button } from "@/components/ui/button";
import { getGuildByDomain, isPrimaryHostname, requestHostname } from "@/lib/custom-domain";
import { getDict } from "@/i18n";

/**
 * The 404 page, after the shop's NotFoundContent. Rendered for an address
 * the routes do not know and wherever a page calls `notFound()` (an unknown
 * form, a handle that is reserved). It replaces everything below the root
 * layout, so it brings its own frame: on our own host the site header and
 * footer, on a guild's custom domain a plain page without msk-scripts.de's
 * navigation, pointing back to the guild's form index.
 */
export default async function NotFound() {
  const t = (await getDict()).site;
  const host = await requestHostname();
  const onCustomDomain = Boolean(host) && !isPrimaryHostname(host!);
  const guild = onCustomDomain ? await getGuildByDomain(host!) : null;

  const content = (
    <div className="container-page py-[clamp(4rem,2rem+6vw,10rem)]">
      <div className="grid max-w-[40rem] gap-5">
        <span className="kicker">{t.notFoundKicker}</span>
        <h1 className="text-display font-[750] tracking-[-0.02em] text-balance">
          {t.notFoundTitle}
        </h1>
        <p className="max-w-[34rem] text-lead text-muted-foreground">{t.notFoundText}</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Button asChild>
            <a href="/">{t.notFoundHome}</a>
          </Button>
        </div>
      </div>
    </div>
  );

  if (!onCustomDomain) return <SiteChrome>{content}</SiteChrome>;

  return (
    <div className="flex min-h-dvh flex-col">
      {guild && (
        <header className="border-b border-border bg-card">
          <div className="container-page flex min-h-[var(--header-height)] items-center">
            <a
              href="/"
              translate="no"
              className="inline-flex min-h-11 items-center font-display text-lead font-bold"
            >
              {guild.name}
            </a>
          </div>
        </header>
      )}
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {content}
      </main>
    </div>
  );
}
