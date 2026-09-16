// Refuse to run `next build` with a non-production NODE_ENV.
//
// The local .env sets NODE_ENV=development for `pnpm dev`. When that leaks into
// a build (for example by sourcing .env to get DATABASE_URL), React loads its
// development bundle and the prerender of /_global-error dies with
// "Cannot read properties of null (reading 'useContext')". That message points
// at a duplicate React or at Windows, and neither is the cause. CI and the
// deploy never set NODE_ENV, so this only ever fires where it saves time.
const env = process.env.NODE_ENV;

if (env && env !== "production") {
  console.error(
    [
      "",
      `✖ NODE_ENV is "${env}", but a production build needs it unset or "production".`,
      "",
      "  Probably the local .env was sourced into this shell. Set only what the",
      "  build needs instead, e.g.:",
      "",
      "    unset NODE_ENV",
      "    CI=true DATABASE_URL=postgresql://... pnpm build",
      "",
    ].join("\n"),
  );
  process.exit(1);
}
