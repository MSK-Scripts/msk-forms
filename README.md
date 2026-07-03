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

The whole experience — dashboard, builder, public forms and bot DMs — is
available in **7 languages** (EN / DE / HU / FR / ES / PT / PL).

> The full concept document is maintained internally.

## Features

- **Powerful builder** — 20+ field types, multi-step pages, conditional logic, quiz scoring, calculated fields, and per-form scheduling with an optional public countdown.
- **Real feedback loop** — every submission gets a live status page; applicants follow along without an account and can withdraw, export, or delete their data (GDPR). One active submission per person by default.
- **Discord-native review** — new submissions post to a review channel with Accept / Reject buttons, status DMs, automatic role grants, and a full activity log, all in your server's language.
- **Make it yours** — accent color, logo, custom CSS with a live preview, form categories, a public form hub, and custom domains with automatic TLS.
- **Team & workflow** — roles with per-form reviewer access, a Kanban board, bulk actions, custom statuses, automations, A/B tests, and CSV / XLSX / JSON / PDF exports.
- **Integrations** — outgoing webhooks, Zapier / Make, and a REST API.
- **Everywhere** — 7 languages, light / dark themes, and an installable PWA.

Full documentation: **[docu.msk-scripts.de/ecosystem/msk-forms](https://docu.msk-scripts.de/ecosystem/msk-forms/)**.

## Invite the Discord bot

Add the MSK Forms bot to your server to list and post forms (`/forms`) and
receive status updates as DMs:

**[➕ Invite MSK Forms to your server](https://discord.com/oauth2/authorize?client_id=1517520313200676994&scope=bot%20applications.commands&permissions=19456)**

The requested permissions (`19456`) cover View Channels, Send Messages and
Embed Links — the minimum needed to post forms into a channel.

## Tech stack

| Area | Technology |
|---|---|
| Frontend/SSR | Next.js 16 (App Router), TypeScript |
| Styling | Tailwind CSS 3 |
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

- `main` → production (auto-deploy via SSH → PM2); direct pushes are blocked.
- Feature branches → PR against `main` → squash-merge once CI is green.

Every PR runs **CI** (lint, typecheck, build, test, Prisma validate) and
**CodeQL**. Merging to `main` deploys automatically to `forms.msk-scripts.de`.

---

© 2026 Moritz Kohm — MSK Scripts. All rights reserved.
