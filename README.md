<div align="center">

# MSK Forms

**Moderne Form- & Bewerbungs-Plattform mit echtem Status-Feedback und nativer Discord-Integration.**

[![CI](https://github.com/MSK-Scripts/msk-forms/actions/workflows/ci.yml/badge.svg)](https://github.com/MSK-Scripts/msk-forms/actions/workflows/ci.yml)
[![Deploy](https://github.com/MSK-Scripts/msk-forms/actions/workflows/deploy.yml/badge.svg)](https://github.com/MSK-Scripts/msk-forms/actions/workflows/deploy.yml)
[![CodeQL](https://github.com/MSK-Scripts/msk-forms/actions/workflows/codeql.yml/badge.svg)](https://github.com/MSK-Scripts/msk-forms/actions/workflows/codeql.yml)
[![License: Proprietary](https://img.shields.io/badge/license-proprietary-red.svg)](./LICENSE)

</div>

> ⚠️ **Proprietär & vertraulich.** Dieses Repository ist Eigentum von MSK Scripts (Moritz Kohm). Siehe [LICENSE](./LICENSE).

---

## Was ist MSK Forms?

Google/Microsoft Forms, neu gedacht — modernes UI, mehr Features und ein echter
**Feedback-Loop**: Bewerber sehen den Status ihrer Einreichung (angenommen /
abgelehnt / in Prüfung) auf derselben Seite, auf der sie das Formular ausgefüllt
haben. Communities laden einfach den **Discord-Bot** auf ihren Server ein.

> Das vollständige Konzept wird projektintern gepflegt.

## Tech-Stack

| Bereich | Technologie |
|---|---|
| Frontend/SSR | Next.js 16 (App Router), TypeScript |
| Styling | Tailwind CSS 3 |
| Datenbank | PostgreSQL + Prisma |
| Cache/Queue | Redis + BullMQ |
| Bot | Node.js + discord.js v14 |
| Storage | S3-kompatibel (MinIO) |
| Monorepo | pnpm Workspaces + Turborepo |
| Hosting | Debian + Apache2 + PM2 |

## Projektstruktur (geplant)

```
msk-forms/
├── apps/
│   ├── web/         Next.js (Dashboard, Builder, Public Forms, Status)
│   ├── bot/         discord.js Bot (Multi-Tenant, Sharding)
│   └── realtime/    WS/SSE-Service
├── packages/
│   ├── db/          Prisma Schema & Client
│   ├── shared/      Typen, zod-Schemas, Form-Spec
│   ├── ui/          MSK Design-System
│   └── i18n/        Übersetzungen
└── .github/         CI, Deploy, Dependabot, CodeQL
```

## Lokale Entwicklung

```bash
pnpm install
cp .env.example .env        # Werte eintragen
docker compose up -d        # Postgres, Redis, MinIO
pnpm prisma migrate dev
pnpm dev
```

## Branches & CI/CD

- `main` → Production (Auto-Deploy via SSH → PM2)
- `develop` → Integration
- Feature-Branches → PR gegen `develop`

Jeder PR durchläuft **CI** (Lint, Typecheck, Build, Test, Prisma-Validate) und
**CodeQL**. `main` deployt automatisch nach `forms.msk-scripts.de`.

---

© 2026 Moritz Kohm — MSK Scripts. Alle Rechte vorbehalten.
