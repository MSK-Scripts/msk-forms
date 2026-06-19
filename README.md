<div align="center">

# MSK Forms

**A modern form & application platform with real status feedback and native Discord integration.**

[![CI](https://github.com/MSK-Scripts/msk-forms/actions/workflows/ci.yml/badge.svg)](https://github.com/MSK-Scripts/msk-forms/actions/workflows/ci.yml)
[![Deploy](https://github.com/MSK-Scripts/msk-forms/actions/workflows/deploy.yml/badge.svg)](https://github.com/MSK-Scripts/msk-forms/actions/workflows/deploy.yml)
[![CodeQL](https://github.com/MSK-Scripts/msk-forms/actions/workflows/codeql.yml/badge.svg)](https://github.com/MSK-Scripts/msk-forms/actions/workflows/codeql.yml)
[![License: Proprietary](https://img.shields.io/badge/license-proprietary-red.svg)](./LICENSE)

</div>

> ⚠️ **Proprietary & confidential.** This repository is owned by MSK Scripts (Moritz Kohm). See [LICENSE](./LICENSE).

---

## What is MSK Forms?

Google/Microsoft Forms, rethought — a modern UI, more features and a real
**feedback loop**: applicants see the status of their submission (accepted /
rejected / in review) on the very page where they filled out the form.
Communities simply invite the **Discord bot** to their server.

> The full concept document is maintained internally.

## Tech stack

| Area | Technology |
|---|---|
| Frontend/SSR | Next.js 16 (App Router), TypeScript |
| Styling | Tailwind CSS 3 |
| Database | PostgreSQL + Prisma |
| Cache/Queue | Redis + BullMQ |
| Bot | Node.js + discord.js v14 |
| Storage | S3-compatible (MinIO) |
| Monorepo | pnpm Workspaces + Turborepo |
| Hosting | Debian + Apache2 + PM2 |

## Project structure (planned)

```
msk-forms/
├── apps/
│   ├── web/         Next.js (dashboard, builder, public forms, status)
│   ├── bot/         discord.js bot (multi-tenant, sharding)
│   └── realtime/    WS/SSE service
├── packages/
│   ├── db/          Prisma schema & client
│   ├── shared/      Types, zod schemas, form spec
│   ├── ui/          MSK design system
│   └── i18n/        Translations
└── .github/         CI, deploy, Dependabot, CodeQL
```

## Local development

```bash
pnpm install
cp .env.example .env        # fill in values
docker compose up -d        # Postgres, Redis, MinIO
pnpm prisma migrate dev
pnpm dev
```

## Branches & CI/CD

- `main` → production (auto-deploy via SSH → PM2)
- `develop` → integration
- Feature branches → PR against `develop`

Every PR runs **CI** (lint, typecheck, build, test, Prisma validate) and
**CodeQL**. `main` deploys automatically to `forms.msk-scripts.de`.

---

© 2026 Moritz Kohm — MSK Scripts. All rights reserved.
