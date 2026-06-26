# Contributing to MSK Forms

Thanks for your interest in MSK Forms! This document explains how to contribute
to the project.

> **License note:** MSK Forms is proprietary ([LICENSE](./LICENSE)).
> Contributions are assigned to the author (MSK Scripts) under the license terms.
> Please discuss larger contributions up front via an issue or email.

## Requirements

- **Node.js ≥ 22** and **pnpm ≥ 11** (`corepack enable`)
- **Docker** (for local infrastructure: Postgres, Redis, MinIO)

## Local setup

```bash
pnpm install
cp .env.example .env        # fill in values
docker compose up -d        # Postgres, Redis, MinIO
pnpm prisma migrate dev     # or prisma db push in early phases
pnpm dev                    # web + bot + realtime
```

## Branching model

- `main` → production (protected, merge via PR only)
- `develop` → integration
- Feature/fix branches: `feat/…`, `fix/…`, `chore/…`, `docs/…` → PR against `develop` or `main`

## Commit conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>
```

Common types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `perf`.

## Pull requests

Before opening a PR, make sure everything passes locally:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

See the [pull request template](./.github/pull_request_template.md) for the full
checklist. Every PR runs **CI** (lint, typecheck, build, test, Prisma validate)
and **CodeQL**.

## Internationalization (i18n)

The app ships in **7 languages**: EN, DE, HU, FR, ES, PT, PL.

- **Web UI strings** live in `apps/web/src/i18n/dictionaries.ts`. The type
  `Dictionary = typeof en` makes TypeScript **enforce completeness** — when you
  add or change a key, update **all** language objects or the build fails.
- **Bot DM strings** (applicant status notifications) live in
  `apps/bot/src/i18n.ts`. Built-in status labels mirror the web's `statusLabels`.
- Add a new language by extending the `Locale` union + `locales` array in
  `apps/web/src/i18n/index.ts` and the `LanguageSwitcher`. Use double-quoted
  strings with **typographic** inner quotes (`“ ”`, `« »`, `„ ”`) — straight
  `"` inside a value breaks the TypeScript parse.

## Security

Do **not** report security vulnerabilities as public issues — see
[SECURITY.md](./SECURITY.md).

## Code of conduct

By participating you agree to our [Code of Conduct](./CODE_OF_CONDUCT.md).
