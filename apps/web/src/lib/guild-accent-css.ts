/**
 * The rules that map a guild's accent sets (`brandVariables` in
 * lib/branding.ts) onto `--primary`, `--primary-foreground` and `--ring`.
 *
 * The live pages get them from app/globals.css, where they are explained; the
 * custom CSS preview (components/branding/css-preview-base.ts) cannot load
 * that file and embeds this copy, inside a cascade layer like there, so a
 * customer's CSS wins over the accent in the preview exactly as on the page.
 * src/test/css-preview-sync.test.ts fails when the two texts drift apart.
 */
export const GUILD_ACCENT_CSS = `
[data-guild-accent] {
  --primary: var(--guild-accent-light);
  --primary-foreground: var(--guild-accent-light-label);
}
.dark [data-guild-accent] {
  --primary: var(--guild-accent-dark);
  --primary-foreground: var(--guild-accent-dark-label);
}
.msk-form,
[data-guild-accent] {
  --ring: var(--primary);
}
@supports (color: hsl(from red h s l)) {
  .msk-form,
  [data-guild-accent],
  .dark [data-guild-accent] {
    --primary-foreground: from color(from hsl(var(--primary)) xyz-d65 calc(0.0053 + 0.9452 * clamp(0, (0.1938 - y) * 1000000, 1)) calc(0.0066 + 0.9934 * clamp(0, (0.1938 - y) * 1000000, 1)) calc(0.0052 + 1.0839 * clamp(0, (0.1938 - y) * 1000000, 1))) h s l;
  }
}
`;
