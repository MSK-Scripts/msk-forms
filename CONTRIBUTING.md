# Beitragen zu MSK Forms

Danke für dein Interesse an MSK Forms! Dieses Dokument beschreibt, wie du zum
Projekt beiträgst.

> **Hinweis zur Lizenz:** MSK Forms ist proprietär ([LICENSE](./LICENSE)).
> Beiträge werden gemäß den Lizenzbedingungen dem Autor (MSK Scripts) übertragen.
> Bitte kläre größere Beiträge vorab per Issue oder E-Mail ab.

## Voraussetzungen

- **Node.js ≥ 22** und **pnpm ≥ 9** (`corepack enable`)
- **Docker** (für lokale Infrastruktur: Postgres, Redis, MinIO)

## Lokales Setup

```bash
pnpm install
cp .env.example .env        # Werte eintragen
docker compose up -d        # Postgres, Redis, MinIO
pnpm prisma migrate dev     # bzw. prisma db push in Phase 0
pnpm dev                    # web + bot + realtime
```

## Branch-Modell

- `main` → Production (geschützt, Merge nur via PR)
- `develop` → Integration
- Feature-/Fix-Branches: `feat/…`, `fix/…`, `chore/…`, `docs/…` → PR gegen `develop` bzw. `main`

## Commit-Konventionen

Wir nutzen [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <kurze Beschreibung>
```

Gängige Typen: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `perf`.

## Pull Requests

Vor dem Öffnen eines PR bitte sicherstellen, dass lokal grün:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Weitere Checkliste siehe [Pull-Request-Template](./.github/pull_request_template.md).
Jeder PR durchläuft **CI** (Lint, Typecheck, Build, Test, Prisma-Validate) und
**CodeQL**.

## Sicherheit

Sicherheitslücken **nicht** als öffentliches Issue melden — siehe
[SECURITY.md](./SECURITY.md).

## Verhaltenskodex

Mit deiner Teilnahme akzeptierst du unseren
[Verhaltenskodex](./CODE_OF_CONDUCT.md).
