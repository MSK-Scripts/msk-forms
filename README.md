<div align="center">

# MSK Forms

**A modern form & application platform with real status feedback and native Discord integration.**

[![CI](https://github.com/MSK-Scripts/msk-forms/actions/workflows/ci.yml/badge.svg)](https://github.com/MSK-Scripts/msk-forms/actions/workflows/ci.yml)
[![Deploy](https://github.com/MSK-Scripts/msk-forms/actions/workflows/deploy.yml/badge.svg)](https://github.com/MSK-Scripts/msk-forms/actions/workflows/deploy.yml)
[![CodeQL](https://github.com/MSK-Scripts/msk-forms/actions/workflows/codeql.yml/badge.svg)](https://github.com/MSK-Scripts/msk-forms/actions/workflows/codeql.yml)
[![License: Proprietary](https://img.shields.io/badge/license-proprietary-red.svg)](./LICENSE)

</div>

> ⚠️ **Proprietary & confidential.** This repository is owned by MSK Scripts (Moritz Kohm). See [LICENSE](./LICENSE).

## What is MSK Forms?

Google and Microsoft Forms, rethought: a modern interface, more features and a real
**feedback loop**. Applicants see the status of their submission (accepted, rejected,
in review) on the very page where they filled out the form. Communities invite the
**Discord bot** to their server and review submissions right there.

MSK Forms runs at [forms.msk-scripts.de](https://forms.msk-scripts.de). Dashboard,
builder, public forms and bot DMs are available in 7 languages.

## Getting started

**Use it:** sign in at [forms.msk-scripts.de/dashboard](https://forms.msk-scripts.de/dashboard)
with Discord, then **[➕ invite the bot to your server](https://discord.com/oauth2/authorize?client_id=1517520313200676994&scope=bot%20applications.commands&permissions=19456)**.
What the bot can do and which permissions it asks for: [docs/features.md](docs/features.md#discord-bot).

**Run it locally:** you need Node.js 24 or newer, pnpm 11 (`corepack enable`) and Docker.

```bash
pnpm install
cp .env.example .env        # fill in values
docker compose up -d        # Postgres, Redis, MinIO
pnpm prisma migrate dev
pnpm dev                    # web on http://localhost:3000, plus bot and realtime
```

## Documentation

| What | Where |
|---|---|
| User guide | [docu.msk-scripts.de/ecosystem/msk-forms](https://docu.msk-scripts.de/ecosystem/msk-forms/) |
| Features, languages and the Discord bot | [docs/features.md](docs/features.md) |
| Tech stack, project structure, local development, CI/CD | [docs/development.md](docs/development.md) |
| Design system: colours, type, layout, components, accessibility | [DESIGN.md](DESIGN.md) |
| Custom domains on the server | [infra/custom-domains/README.md](infra/custom-domains/README.md) |
| Setup, branches, commits and pull requests | [CONTRIBUTING.md](CONTRIBUTING.md) |

## Help and contributing

- **Questions and support:** the [MSK Scripts Discord](https://discord.gg/5hHSBRHvJE).
- **Bugs and ideas:** [GitHub issues](https://github.com/MSK-Scripts/msk-forms/issues).
- **Security vulnerabilities:** never in a public issue, please follow [SECURITY.md](SECURITY.md).
- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

Proprietary, see [LICENSE](./LICENSE).

© 2026 Moritz Kohm, MSK Scripts. All rights reserved.
