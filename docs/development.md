# Development

How MSK Forms is built and how to work on it. Requirements, branches, commit
conventions and the pull request checklist are in [CONTRIBUTING.md](../CONTRIBUTING.md).
The full concept document is maintained internally.

## Tech stack

| Area | Technology |
|---|---|
| Frontend/SSR | Next.js 16 (App Router), TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL + Prisma |
| Cache | Redis |
| Bot | Node.js + discord.js v14 |
| Storage | S3-compatible (MinIO) |
| i18n | 7 languages (EN/DE/HU/FR/ES/PT/PL) |
| Monorepo | pnpm Workspaces + Turborepo |
| Hosting | Debian + Apache2 + PM2 |

## Project structure

```
msk-forms/
├── apps/
│   ├── web/         Next.js (dashboard, builder, public forms, status)
│   ├── bot/         discord.js bot (multi-tenant)
│   └── realtime/    WebSocket service (Postgres LISTEN/NOTIFY fan-out)
├── packages/
│   ├── db/          Prisma schema & client
│   ├── shared/      Types, zod schemas, form spec
│   ├── ui/          MSK design system
│   └── i18n/        Unused stub; the translations live in apps/web/src/i18n
└── .github/         CI, deploy, Dependabot, CodeQL
```

## Local development

You need Node.js 24 or newer, pnpm 11 (`corepack enable`) and Docker.

```bash
pnpm install
cp .env.example .env        # fill in values
docker compose up -d        # Postgres, Redis, MinIO
pnpm prisma migrate dev
pnpm dev                    # web on http://localhost:3000, plus bot and realtime
```

## Branches and CI/CD

- `main` → production (auto-deploy via SSH → PM2); direct pushes are blocked.
- Feature branches → PR against `main` → squash-merge once CI is green.

Every PR runs **CI** (lint, typecheck, build, test, Prisma validate) and
**CodeQL**. Merging to `main` deploys automatically to `forms.msk-scripts.de`.
