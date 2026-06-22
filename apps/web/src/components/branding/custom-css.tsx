import { sanitizeCustomCss } from "@msk-forms/shared";

/**
 * Inject a guild's custom CSS into its own public page. Rendered into a
 * same-page `<style>` (allowed by `style-src 'unsafe-inline'`); the content is
 * sanitized once more here as defence in depth even though it was sanitized on
 * save. No-op when empty.
 */
export function CustomCss({ css }: { css?: string }) {
  if (!css) return null;
  const safe = sanitizeCustomCss(css).trim();
  if (!safe) return null;
  return <style dangerouslySetInnerHTML={{ __html: safe }} />;
}
