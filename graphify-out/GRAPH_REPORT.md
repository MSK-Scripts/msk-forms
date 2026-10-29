# Graph Report - msk-forms  (2026-10-29)

## Corpus Check
- 451 files · ~230,400 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2553 nodes · 6737 edges · 173 communities (117 shown, 25 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 56 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ec324f09`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- src/forms.ts
- getDict
- getCurrentUser
- scripts
- pnpm + Turborepo Monorepo
- experiment/page.tsx
- header-bar.tsx
- submissions/page.tsx
- shared/src/webhooks.ts
- ui/src/index.ts
- db/package.json
- tasks
- realtime/package.json
- form-builder.tsx
- custom-domain.ts
- forms-table.tsx
- bot/package.json
- compilerOptions
- compilerOptions
- ui/package.json
- [slug]/page.tsx
- form-renderer.tsx
- branding/logo/route.ts
- forms/page.tsx
- FieldEditor
- field-input.tsx
- form-settings.ts
- dependencies
- submit/route.ts
- index.tsx
- form-spec.ts
- devDependencies
- rateLimit
- guild.ts
- submissions/[id]/page.tsx
- shared/package.json
- src/branding.ts
- i18n/package.json
- getSession
- db/src/index.ts
- isLayoutField
- tokens.ts
- validation-messages.ts
- StatusDefsForm
- forms-hub.tsx
- compilerOptions
- DomainForm
- compilerOptions
- formula.ts
- audit-log/[hookId]/route.ts
- shared/src/index.ts
- status-defs.ts
- mirror job (Push to Codeberg)
- scripts
- generate-pwa-icons.mjs
- [handle]/page.tsx
- FormBuilder
- date-field.tsx
- db/tsconfig.json
- i18n/tsconfig.json
- shared/tsconfig.json
- .prettierrc.json
- bot/tsconfig.json
- webhook/route.ts
- dashboard-kit/index.ts
- createServer
- MSK Logo (green M mark)
- copy-standalone-assets.mjs
- WebhooksManager
- audit-log.ts
- Security overrides for transitive dependencies
- sync-custom-domains.sh
- i18n/src/index.ts
- proxy.ts
- cn
- Dependabot Config
- next.config.ts
- exceljs
- site-header.tsx
- @msk-forms/shared
- site-footer.tsx
- next
- next-themes
- qrcode
- color-dot.ts
- sharp
- stripe
- lib/branding.ts
- 20260619142218_init/migration.sql
- health/route.ts
- app/page.tsx
- ecosystem.config.cjs
- md-message.sh
- Funding Config (GitHub Sponsors)
- Workspace package globs (apps/*, packages/*)
- bot/src/index.ts
- bot/src/notifications.ts
- ui/button.tsx
- guild-i18n.ts
- Design System: MSK Forms
- review-actions.ts
- MSK Forms Platform
- CI Workflow
- AuditLogManager
- css-preview.tsx
- CategoryListForm
- error.tsx
- AutomationsEditor
- MembersManager
- branding-contract.test.ts
- dashboard-shell.tsx
- [guildId]/layout.tsx
- SignatureField
- Colour
- The dashboard
- [formId]/export/route.ts
- BrandingForm
- sort-rows.test.ts
- turnstile-widget.tsx
- Components
- Development
- Issue Template Config
- Features
- requireUser
- @aws-sdk/client-s3
- iron-session
- @msk-forms/db
- nodemailer
- @phosphor-icons/react
- @radix-ui/react-slot
- zod
- (account)/page.tsx
- kanban-board.tsx
- domain/route.ts
- category-rows.ts
- SubmissionsTable
- formScheduleStatus
- forms/archived/page.tsx
- ExperimentEditor
- StatusMessagesForm
- experiment-page-access.test.ts
- guild-submissions.test.ts

## God Nodes (most connected - your core abstractions)
1. `getDict()` - 110 edges
2. `getCurrentUser()` - 91 edges
3. `cn()` - 90 edges
4. `canManageForms()` - 89 edges
5. `prisma` - 88 edges
6. `logGuildActivitySafe()` - 71 edges
7. `actor()` - 65 edges
8. `requireUser()` - 54 edges
9. `Button` - 51 edges
10. `getLocale()` - 44 edges

## Surprising Connections (you probably didn't know these)
- `CI Postgres 16 Service` --semantically_similar_to--> `Postgres 16 Service`  [INFERRED] [semantically similar]
  .github/workflows/ci.yml → docker-compose.yml
- `CI Redis 7 Service` --semantically_similar_to--> `Redis 7 Service`  [INFERRED] [semantically similar]
  .github/workflows/ci.yml → docker-compose.yml
- `PATCH()` --indirect_call--> `auditActionFromEvent()`  [INFERRED]
  apps/web/src/app/api/guilds/[guildId]/audit-log/[hookId]/route.ts → packages/shared/src/audit-log.ts
- `AuditLogPage()` --indirect_call--> `auditActionFromEvent()`  [INFERRED]
  apps/web/src/app/dashboard/[guildId]/audit-log/page.tsx → packages/shared/src/audit-log.ts
- `markAllRequired()` --calls--> `isLayoutField()`  [EXTRACTED]
  apps/web/src/components/builder/form-builder.tsx → packages/shared/src/form-spec.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **CI/CD & Quality Pipeline** — _github_workflows_ci, _github_workflows_deploy, _github_workflows_codeql, readme_branch_workflow [EXTRACTED 0.90]
- **Local Dev Infrastructure Services** — docker_compose_postgres, docker_compose_redis, docker_compose_minio, docker_compose_infra [EXTRACTED 0.90]
- **Monorepo Apps & Packages** — readme_app_web, readme_app_bot, readme_app_realtime, readme_package_db, readme_package_shared, readme_package_ui, readme_package_i18n [EXTRACTED 0.90]
- **Codeberg mirroring flow (trigger, guards, exact push)** — _github_workflows_mirror_mirror_to_codeberg, _github_workflows_mirror_main_and_tags_trigger, _github_workflows_mirror_fork_guard, _github_workflows_mirror_mirror_job, _github_workflows_mirror_exact_mirror_semantics, _github_workflows_mirror_codeberg_secrets [EXTRACTED 1.00]
- **pnpm supply-chain hardening (allowlist plus advisory overrides)** — pnpm_workspace_allowbuilds, pnpm_workspace_security_overrides, pnpm_workspace_minimatch_lift, pnpm_workspace_sharp_override, pnpm_workspace_find_my_way_override [EXTRACTED 1.00]

## Communities (173 total, 25 thin omitted)

### Community 0 - "src/forms.ts"
Cohesion: 0.24
Nodes (16): handleFormsAutocomplete(), handleFormsCommand(), liveForms(), LOCALE_NAMES, resolveGuild(), fmt(), deliverReview(), accentColorInt() (+8 more)

### Community 1 - "getDict"
Cohesion: 0.09
Nodes (33): RootLayout(), metadata, OfflinePage(), Cell, metadata, PricingPage(), metadata, revalidate (+25 more)

### Community 2 - "getCurrentUser"
Cohesion: 0.09
Nodes (58): DELETE(), dynamic, runtime, dynamic, GET(), POST(), runtime, dynamic (+50 more)

### Community 3 - "scripts"
Cohesion: 0.04
Nodes (48): dotenv, eslint, @eslint/js, author, description, devDependencies, dotenv, eslint (+40 more)

### Community 4 - "pnpm + Turborepo Monorepo"
Cohesion: 0.14
Nodes (15): PWA Assets (service worker + icons), public/ Static Assets Doc, Event-Driven Domain Sync (systemd .path), Apache mod_md Auto-TLS, Custom Domains Runbook (Apache mod_md), sync-custom-domains.sh, apps/bot (discord.js), apps/realtime (WebSocket, Postgres LISTEN/NOTIFY) (+7 more)

### Community 5 - "experiment/page.tsx"
Cohesion: 0.15
Nodes (15): dynamic, EditFormPage(), runtime, dynamic, ExperimentResultsPage(), runtime, dynamic, runtime (+7 more)

### Community 6 - "header-bar.tsx"
Cohesion: 0.06
Nodes (42): AppShell(), AppShellProps, navItemClass, ShellAccount, LanguageSelect(), currentNavId(), ShellNavGroup, ShellNavItem (+34 more)

### Community 7 - "submissions/page.tsx"
Cohesion: 0.16
Nodes (22): POST(), BoardPage(), dynamic, runtime, ArchivedSubmissionsPage(), dynamic, runtime, SubmissionDetailPage() (+14 more)

### Community 8 - "shared/src/webhooks.ts"
Cohesion: 0.07
Nodes (35): backoffMs(), buildAuditBody(), deliverOne(), deliverPendingWebhooks(), DeliveryResult, DeliveryRow, DISCORD_WEBHOOK_GONE, hydratePayload() (+27 more)

### Community 9 - "ui/src/index.ts"
Cohesion: 0.10
Nodes (29): Button(), ButtonProps, styles, Variant, Card(), CardProps, Checkbox(), CheckboxProps (+21 more)

### Community 10 - "db/package.json"
Cohesion: 0.06
Nodes (31): dependencies, @prisma/adapter-pg, @prisma/client, devDependencies, pg, prisma, tsx, @types/pg (+23 more)

### Community 11 - "tasks"
Cohesion: 0.07
Nodes (29): ^build, coverage/**, .env, !.next/cache/**, NODE_ENV, dependsOn, outputs, cache (+21 more)

### Community 12 - "realtime/package.json"
Cohesion: 0.07
Nodes (28): dependencies, pg, ws, devDependencies, tsx, @types/pg, @types/ws, typescript (+20 more)

### Community 13 - "form-builder.tsx"
Cohesion: 0.07
Nodes (64): AuditDict, GROUPS, BotDict, ID_FIELD, LOCALE_OPTIONS, Values, BrandingDict, CSS_SNIPPETS (+56 more)

### Community 14 - "custom-domain.ts"
Cohesion: 0.15
Nodes (22): dynamic, GET(), runtime, dynamic, GET(), runtime, DomainGuild, hostname() (+14 more)

### Community 15 - "forms-table.tsx"
Cohesion: 0.09
Nodes (27): ArchivedFormRow, FormActionCopy, FormActionDialog(), FormActionRequest, importDefinition(), ImportFormButton(), onFile(), useReplaceFromJson() (+19 more)

### Community 16 - "bot/package.json"
Cohesion: 0.07
Nodes (26): dependencies, discord.js, @msk-forms/db, @msk-forms/shared, devDependencies, tsx, typescript, vitest (+18 more)

### Community 17 - "compilerOptions"
Cohesion: 0.07
Nodes (26): .turbo, compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules (+18 more)

### Community 18 - "compilerOptions"
Cohesion: 0.08
Nodes (25): compilerOptions, allowJs, declaration, declarationMap, incremental, jsx, lib, module (+17 more)

### Community 19 - "ui/package.json"
Cohesion: 0.08
Nodes (25): devDependencies, react, @types/react, @types/react-dom, typescript, vitest, exports, react (+17 more)

### Community 20 - "[slug]/page.tsx"
Cohesion: 0.08
Nodes (28): dynamic, FormPreviewPage(), runtime, dynamic, runtime, dynamic, runtime, TERMINAL (+20 more)

### Community 21 - "form-renderer.tsx"
Cohesion: 0.16
Nodes (23): FieldValue, isGroupField(), Answers, FormLabels, FormRenderer(), collectErrors(), focusFirstError(), focusStep() (+15 more)

### Community 22 - "branding/logo/route.ts"
Cohesion: 0.13
Nodes (24): dynamic, GET(), runtime, dynamic, POST(), runtime, DELETE(), dynamic (+16 more)

### Community 23 - "forms/page.tsx"
Cohesion: 0.07
Nodes (39): ApiPage(), dynamic, runtime, DomainPage(), dynamic, runtime, dynamic, NewFormPage() (+31 more)

### Community 24 - "FieldEditor"
Cohesion: 0.12
Nodes (25): FieldEditor(), addOption(), addRow(), patch(), removeOption(), removeRow(), setOption(), setOptionScore() (+17 more)

### Community 25 - "field-input.tsx"
Cohesion: 0.15
Nodes (16): DateFieldLabels, FieldInputLabels, FieldInputProps, GROUP_TYPES, FileField(), FileFieldLabels, formatSize(), MatrixField() (+8 more)

### Community 26 - "form-settings.ts"
Cohesion: 0.09
Nodes (20): FormInput, AnswerMap, FORM_DEFINITION_VERSION, FormDefinition, formDefinitionSchema, AutomationCondition, automationConditionSchema, automationRuleSchema (+12 more)

### Community 27 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, class-variance-authority, clsx, @fontsource-variable/archivo, @fontsource-variable/source-sans-3, ioredis, @msk-forms/ui, pdf-lib (+13 more)

### Community 28 - "submit/route.ts"
Cohesion: 0.14
Nodes (24): dynamic, POST(), runtime, buildPreview(), dynamic, POST(), PREVIEW_LABELS, runtime (+16 more)

### Community 29 - "index.tsx"
Cohesion: 0.05
Nodes (56): FieldEditorProps, BuilderDict, FIELD_ICONS, fieldIcon(), FieldOutline(), GROUP_ORDER, GROUP_TYPES, grouped (+48 more)

### Community 30 - "form-spec.ts"
Cohesion: 0.08
Nodes (22): BOOLEAN_TYPES, conditionRuleSchema, fieldOptionSchema, fieldTypeSchema, fieldValidationSchema, fileAnswerSchema, formFieldSchema, formPageSchema (+14 more)

### Community 31 - "devDependencies"
Cohesion: 0.11
Nodes (19): devDependencies, postcss, tailwindcss, @tailwindcss/postcss, @types/nodemailer, @types/qrcode, @types/react, @types/react-dom (+11 more)

### Community 32 - "rateLimit"
Cohesion: 0.14
Nodes (19): dynamic, GET(), runtime, DELETE(), dynamic, runtime, dynamic, POST() (+11 more)

### Community 33 - "guild.ts"
Cohesion: 0.09
Nodes (32): dynamic, POST(), runtime, dynamic, POST(), runtime, bodySchema, dynamic (+24 more)

### Community 34 - "submissions/[id]/page.tsx"
Cohesion: 0.11
Nodes (18): dynamic, EVENT_ICON, runtime, MySubmissionRow, MySubmissionsTable(), SubmissionRow, SubmissionRowsTable(), Result (+10 more)

### Community 35 - "shared/package.json"
Cohesion: 0.11
Nodes (18): dependencies, zod, devDependencies, typescript, vitest, exports, typescript, vitest (+10 more)

### Community 36 - "src/branding.ts"
Cohesion: 0.33
Nodes (5): accentColor, brandingColorSchema, brandingSchema, customCss, MAX_CUSTOM_CSS

### Community 37 - "i18n/package.json"
Cohesion: 0.11
Nodes (17): devDependencies, typescript, vitest, exports, ./de, ./en, typescript, vitest (+9 more)

### Community 38 - "getSession"
Cohesion: 0.22
Nodes (10): dynamic, POST(), runtime, dynamic, GET(), runtime, logoutAction(), getSession() (+2 more)

### Community 39 - "db/src/index.ts"
Cohesion: 0.08
Nodes (33): dynamic, GET(), runtime, DELETE(), dynamic, runtime, dynamic, GET() (+25 more)

### Community 40 - "isLayoutField"
Cohesion: 0.13
Nodes (11): ConditionEditor(), FieldInput(), isLayout(), AnswerLabels, AnswerSummary(), formatAnswer(), SubmissionFile, buildFieldSchema() (+3 more)

### Community 41 - "tokens.ts"
Cohesion: 0.11
Nodes (25): LINES_ONLY, Pair, PAIRS, Ref, resolve(), STATUS, tokens, utilities (+17 more)

### Community 42 - "validation-messages.ts"
Cohesion: 0.22
Nodes (8): BOT_LOCALES, botConfigSchema, snowflake, categoriesSchema, categoryInputSchema, MAX_CATEGORIES, BY_MESSAGE, VALIDATION_MESSAGES

### Community 43 - "StatusDefsForm"
Cohesion: 0.33
Nodes (8): payloadOf(), slugifyKey(), StatusDefsForm(), add(), edit(), patch(), remove(), save()

### Community 44 - "forms-hub.tsx"
Cohesion: 0.12
Nodes (17): dynamic, runtime, Clock, HourglassMedium, Tray, confettiColours(), Countdown(), tick() (+9 more)

### Community 45 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, jsx, lib, outDir, rootDir, extends, include, DOM (+5 more)

### Community 46 - "DomainForm"
Cohesion: 0.27
Nodes (6): DomainForm(), CustomDomainInput, customDomainSchema, isValidDomain(), verificationRecordName(), verificationRecordValue()

### Community 47 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, lib, module, moduleResolution, outDir, rootDir, extends, include (+3 more)

### Community 48 - "formula.ts"
Cohesion: 0.27
Nodes (10): evaluateFormula(), parse(), expr(), factor(), term(), referencedFieldIds(), referenceValue(), roundTo() (+2 more)

### Community 49 - "audit-log/[hookId]/route.ts"
Cohesion: 0.15
Nodes (22): authorize(), DELETE(), dynamic, Params, PATCH(), runtime, dynamic, POST() (+14 more)

### Community 50 - "shared/src/index.ts"
Cohesion: 0.07
Nodes (40): bodySchema, dynamic, POST(), runtime, dynamic, GET(), runtime, DELETE() (+32 more)

### Community 51 - "status-defs.ts"
Cohesion: 0.24
Nodes (7): DEFAULT_LOCALE, Locale, SUPPORTED_LOCALES, isTerminalStatus(), StatusDefInput, statusDefInputSchema, statusDefsSchema

### Community 52 - "mirror job (Push to Codeberg)"
Cohesion: 0.29
Nodes (8): CODEBERG_TOKEN / CODEBERG_USER / CODEBERG_REPO secrets, Exact mirror semantics (force + prune), Fork guard (repository_owner == MSK-Scripts), Trigger restricted to main, tags, delete and manual dispatch, mirror job (Push to Codeberg), Mirror to Codeberg workflow, Delete refs/remotes/origin/HEAD before pushing, Serial mirror concurrency group

### Community 53 - "scripts"
Cohesion: 0.15
Nodes (12): name, private, scripts, build, clean, dev, lint, start (+4 more)

### Community 54 - "generate-pwa-icons.mjs"
Cohesion: 0.22
Nodes (6): BG, here, iconsDir, publicDir, source, TRANSPARENT

### Community 55 - "[handle]/page.tsx"
Cohesion: 0.22
Nodes (9): dynamic, HandleHubPage(), runtime, getGuildByHandle(), APP_DIR, handleSchema, isReservedHandle(), normalizeHandle() (+1 more)

### Community 56 - "FormBuilder"
Cohesion: 0.11
Nodes (26): BotConfigForm(), save(), botConfigBody(), BotConfigValues, botConfigValuesOf(), empty, FormBuilder(), addField() (+18 more)

### Community 57 - "date-field.tsx"
Cohesion: 0.11
Nodes (25): isoToLocalInput(), useDismiss(), DateField(), emit(), pickDay(), setTime(), DateFieldMode, pad() (+17 more)

### Community 58 - "db/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, outDir, rootDir, extends, include, src/**/*.ts, ../../tsconfig.base.json

### Community 59 - "i18n/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, outDir, rootDir, extends, include, src/**/*.ts, ../../tsconfig.base.json

### Community 60 - "shared/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, outDir, rootDir, extends, include, src/**/*.ts, ../../tsconfig.base.json

### Community 61 - ".prettierrc.json"
Cohesion: 0.22
Nodes (8): plugins, printWidth, semi, singleQuote, tabWidth, tailwindStylesheet, trailingComma, prettier-plugin-tailwindcss

### Community 62 - "bot/tsconfig.json"
Cohesion: 0.29
Nodes (6): compilerOptions, noEmit, extends, include, src/**/*.ts, ../../tsconfig.base.json

### Community 63 - "webhook/route.ts"
Cohesion: 0.13
Nodes (24): ACTIVE, customerId(), dynamic, logPlanChange(), POST(), resolveGuildId(), runtime, sendOrderConfirmation() (+16 more)

### Community 64 - "dashboard-kit/index.ts"
Cohesion: 0.15
Nodes (14): ExperimentResultRow, ExperimentResultsCopy, GuildIcon(), GuildRow, DataColumn, DataTable(), FieldControlProps, Breadcrumb (+6 more)

### Community 65 - "createServer"
Cohesion: 0.31
Nodes (6): ClientState, createServer(), fanout(), listenForChanges(), PORT, verifyGuildToken()

### Community 66 - "MSK Logo (green M mark)"
Cohesion: 0.47
Nodes (6): Apple Touch Icon, PWA Icon 192, PWA Icon 512, PWA Maskable Icon 512, MSK Brand Identity (green M), MSK Logo (green M mark)

### Community 67 - "copy-standalone-assets.mjs"
Cohesion: 0.33
Nodes (4): copySharp(), standaloneWeb, walkImgScope(), webRoot

### Community 68 - "WebhooksManager"
Cohesion: 0.28
Nodes (7): deliveryState(), eventLabel(), sourceLabel(), WebhooksManager(), add(), toggleEvent(), toggleReveal()

### Community 69 - "audit-log.ts"
Cohesion: 0.10
Nodes (23): AuditHookRow, AUDIT_EVENT_PREFIX, auditActionFromEvent(), AuditWebhookInput, auditWebhookInputSchema, AuditWebhookUpdate, auditWebhookUpdateSchema, EVENT_WEBHOOK_KIND (+15 more)

### Community 70 - "Security overrides for transitive dependencies"
Cohesion: 0.60
Nodes (5): allowBuilds allowlist for dependency build scripts, find-my-way override for pinned prisma dev dependency, minimatch lifted to 10 to collapse brace-expansion copies, Security overrides for transitive dependencies, sharp override lifting the optional next copy

### Community 71 - "sync-custom-domains.sh"
Cohesion: 0.50
Nodes (3): PGCONNECT_TIMEOUT, PGOPTIONS, sync-custom-domains.sh script

### Community 72 - "i18n/src/index.ts"
Cohesion: 0.40
Nodes (4): defaultLocale, Locale, locales, messages

### Community 74 - "cn"
Cohesion: 0.08
Nodes (32): AccountMenu(), NavDrawer(), close(), RowMenu(), ARROW, MEANING, StatGrid(), StatTile() (+24 more)

### Community 78 - "site-header.tsx"
Cohesion: 0.21
Nodes (13): aboutLink(), productLines(), sectionLinks(), TOOL_URLS, SiteHeader(), decryptSecret(), key(), getGuildCaptchaSecret() (+5 more)

### Community 80 - "site-footer.tsx"
Cohesion: 0.10
Nodes (23): ImprintPage(), metadata, metadata, TermsPage(), metadata, PrivacyPage(), CaretRight, LegalContent() (+15 more)

### Community 84 - "color-dot.ts"
Cohesion: 0.19
Nodes (21): Theme, UI_CONTRAST, channelsToHex(), clamp01(), dotContrast(), readableDot(), COLOURS, THEMES (+13 more)

### Community 87 - "lib/branding.ts"
Cohesion: 0.25
Nodes (16): accentContrast(), AccentSet, accentSets(), GUILD_ACCENT_ATTRIBUTE, hexToHslChannels(), labelFor(), LABELS, MSK_GREEN (+8 more)

### Community 88 - "20260619142218_init/migration.sql"
Cohesion: 0.19
Nodes (16): "api_keys", "files", "form_statuses", "form_versions", "forms", "guild_members", "guilds", "notifications" (+8 more)

### Community 91 - "app/page.tsx"
Cohesion: 0.17
Nodes (18): DEFAULT_METADATA, generateMetadata(), viewport, DEFAULT_ICONS, manifest(), NotFound(), dynamic, HomePage() (+10 more)

### Community 101 - "bot/src/index.ts"
Cohesion: 0.30
Nodes (11): commands, registerCommands(), assertConfig(), config, guildIconUrl(), syncAllGuilds(), syncGuild(), updateGuildMeta() (+3 more)

### Community 102 - "bot/src/notifications.ts"
Cohesion: 0.16
Nodes (20): isExhausted(), isTerminalDmCode(), MAX_DELIVERY_ATTEMPTS, nextAttemptAt(), retryDelayMs(), TERMINAL_DM_CODES, dmStrings, Locale (+12 more)

### Community 103 - "ui/button.tsx"
Cohesion: 0.10
Nodes (19): ApiDict, ApiKeysManager(), fill(), iso(), ConfirmDialog(), SaveBar(), CircleNotch, Key (+11 more)

### Community 104 - "guild-i18n.ts"
Cohesion: 0.15
Nodes (14): de, en, es, fr, hu, pl, pt, STRINGS (+6 more)

### Community 105 - "Design System: MSK Forms"
Cohesion: 0.13
Nodes (15): Accessibility, Adding a colour, Adding an icon, Craft from the shop, colour from the customer, Customer branding, Design System: MSK Forms, Exclusion list, Icons (+7 more)

### Community 106 - "review-actions.ts"
Cohesion: 0.33
Nodes (8): guildStrings, Action, ACTION_STATUS, handleReviewButton(), statusLabel(), updateMessage(), grantAcceptedRole(), grantRoles()

### Community 107 - "MSK Forms Platform"
Cohesion: 0.22
Nodes (11): Pull Request Template, Code of Conduct (Contributor Covenant 2.1), Conventional Commits Convention, Contributing Guide, i18n Dictionary Completeness Enforcement, Node 22 / pnpm 11 Requirements, 7-Language i18n (EN/DE/HU/FR/ES/PT/PL), MSK Forms Platform (+3 more)

### Community 108 - "CI Workflow"
Cohesion: 0.18
Nodes (13): CI Workflow, CI Postgres 16 Service, CI Redis 7 Service, CodeQL Security Workflow, Production Deploy Workflow, SSH Deploy to Debian/PM2, Local Dev Infra (docker-compose), MinIO S3 Service (+5 more)

### Community 109 - "AuditLogManager"
Cohesion: 0.21
Nodes (10): ActionPicker(), setMany(), AuditLogManager(), add(), patch(), saveEdit(), test(), deliveryState() (+2 more)

### Community 110 - "css-preview.tsx"
Cohesion: 0.25
Nodes (10): PREVIEW_BASE_CSS, CssPreview(), CssPreviewLabels, esc(), noSubscription(), useHydrated(), brandVariables(), GUILD_ACCENT_CSS (+2 more)

### Community 111 - "CategoryListForm"
Cohesion: 0.39
Nodes (7): CategoryListForm(), add(), edit(), move(), patch(), remove(), contentOf()

### Community 112 - "error.tsx"
Cohesion: 0.28
Nodes (7): ErrorPage(), ArrowClockwise, Context, ErrorCopy, ErrorCopyProvider(), FALLBACK, useErrorCopy()

### Community 113 - "AutomationsEditor"
Cohesion: 0.31
Nodes (5): AutomationsEditor(), addCondition(), removeCondition(), replaceCondition(), replaceRule()

### Community 114 - "MembersManager"
Cohesion: 0.36
Nodes (9): fill(), MembersManager(), accessCell(), addMember(), call(), remove(), setFormAccess(), setRole() (+1 more)

### Community 115 - "branding-contract.test.ts"
Cohesion: 0.22
Nodes (5): APP_DIR, BRANDABLE, CSS, SRC_DIR, UI_DIR

### Community 116 - "dashboard-shell.tsx"
Cohesion: 0.10
Nodes (21): DashboardShell(), DashboardShellCopy, GROUPS, ICON, MOBILE, ShellCopy, GuildSwitcher(), GuildSwitcherCopy (+13 more)

### Community 117 - "[guildId]/layout.tsx"
Cohesion: 0.17
Nodes (19): dynamic, GuildLayout(), runtime, canDeleteFormsFromRole(), isGlobalReviewerRole(), isManagerRole(), MANAGER_ROLES, manageScopeFromRole() (+11 more)

### Community 118 - "SignatureField"
Cohesion: 0.43
Nodes (6): SignatureField(), end(), move(), pos(), start(), upload()

### Community 119 - "Colour"
Cohesion: 0.33
Nodes (6): Colour, Contrast, Plain colours outside the tokens, Tokens, Two layers, Where green belongs

### Community 120 - "The dashboard"
Cohesion: 0.33
Nodes (6): Colours a guild picks, Moving without dragging (WCAG 2.5.7), Pages, Sidebar, The dashboard, Who sees which area (a rule)

### Community 121 - "[formId]/export/route.ts"
Cohesion: 0.11
Nodes (17): csvCell(), dynamic, ExportFormat, FORMATS, GET(), runtime, bodySchema, dynamic (+9 more)

### Community 122 - "BrandingForm"
Cohesion: 0.50
Nodes (3): BrandingForm(), addSnippet(), update()

### Community 123 - "sort-rows.test.ts"
Cohesion: 0.40
Nodes (3): columns, Row, rows

### Community 124 - "turnstile-widget.tsx"
Cohesion: 0.40
Nodes (3): TurnstileApi, TurnstileWidget(), Window

### Community 125 - "Components"
Cohesion: 0.40
Nodes (5): Base (`apps/web/src/components/ui`), Components, Dashboard kit (`apps/web/src/components/dashboard-kit`), Public form controls (`packages/ui`), Site pages (`apps/web/src/components/site`, `components/page`)

### Community 126 - "Development"
Cohesion: 0.40
Nodes (5): Branches and CI/CD, Development, Local development, Project structure, Tech stack

### Community 127 - "Issue Template Config"
Cohesion: 0.50
Nodes (4): Bug Report Issue Template, Issue Template Config, Feature Request Issue Template, Private Vulnerability Reporting

### Community 128 - "Features"
Cohesion: 0.50
Nodes (3): Discord bot, Features, Languages

### Community 129 - "requireUser"
Cohesion: 0.07
Nodes (37): dynamic, MySubmissionsPage(), runtime, AuditLogPage(), dynamic, runtime, BotConfigPage(), dynamic (+29 more)

### Community 162 - "(account)/page.tsx"
Cohesion: 0.21
Nodes (11): AccountLayout(), dynamic, runtime, dynamic, GuildsPage(), runtime, DashboardFrame(), Member (+3 more)

### Community 163 - "kanban-board.tsx"
Cohesion: 0.24
Nodes (10): BoardColumn, BoardLabels, BoardSubmission, fill(), KanbanBoard(), move(), countForm(), CountForms (+2 more)

### Community 164 - "domain/route.ts"
Cohesion: 0.29
Nodes (7): dynamic, runtime, dynamic, lookupTxt(), POST(), runtime, requestDomainSync()

### Community 165 - "category-rows.ts"
Cohesion: 0.36
Nodes (6): save(), categoryPayload(), CategoryRow, categoryRowsFrom(), NEW_CATEGORY_COLOR, CategoryInput

### Community 166 - "SubmissionsTable"
Cohesion: 0.39
Nodes (5): fill(), SubmissionsTable(), apply(), report(), setArchived()

### Community 167 - "formScheduleStatus"
Cohesion: 0.32
Nodes (5): ENDING_SOON_HOURS, FormScheduleState, formScheduleStatus, now, toMs()

### Community 168 - "forms/archived/page.tsx"
Cohesion: 0.38
Nodes (6): ArchivedFormsPage(), dynamic, runtime, ArchivedFormsTable(), getArchivedForms(), getManageScope()

### Community 171 - "experiment-page-access.test.ts"
Cohesion: 0.40
Nodes (3): canManageForm, canManageForms, getFormForEdit

## Knowledge Gaps
- **830 isolated node(s):** `semi`, `singleQuote`, `trailingComma`, `printWidth`, `tabWidth` (+825 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 970 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `prisma` connect `db/src/index.ts` to `src/forms.ts`, `requireUser`, `getCurrentUser`, `getDict`, `experiment/page.tsx`, `submissions/page.tsx`, `shared/src/webhooks.ts`, `custom-domain.ts`, `[slug]/page.tsx`, `branding/logo/route.ts`, `forms/page.tsx`, `submit/route.ts`, `rateLimit`, `guild.ts`, `submissions/[id]/page.tsx`, `domain/route.ts`, `forms-hub.tsx`, `audit-log/[hookId]/route.ts`, `shared/src/index.ts`, `webhook/route.ts`, `site-header.tsx`, `bot/src/index.ts`, `bot/src/notifications.ts`, `review-actions.ts`, `[formId]/export/route.ts`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `getDict()` connect `getDict` to `requireUser`, `getCurrentUser`, `experiment/page.tsx`, `submissions/page.tsx`, `[slug]/page.tsx`, `forms/page.tsx`, `submit/route.ts`, `guild.ts`, `(account)/page.tsx`, `submissions/[id]/page.tsx`, `forms/archived/page.tsx`, `forms-hub.tsx`, `audit-log/[hookId]/route.ts`, `shared/src/index.ts`, `site-header.tsx`, `site-footer.tsx`, `app/page.tsx`, `[guildId]/layout.tsx`, `[formId]/export/route.ts`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `FormBuilder()` connect `FormBuilder` to `experiment/page.tsx`, `form-builder.tsx`, `forms-table.tsx`, `forms/page.tsx`, `FieldEditor`, `date-field.tsx`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `semi`, `singleQuote`, `trailingComma` to the rest of the system?**
  _830 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `getDict` be split into smaller, more focused modules?**
  _Cohesion score 0.09250693802035152 - nodes in this community are weakly interconnected._
- **Should `getCurrentUser` be split into smaller, more focused modules?**
  _Cohesion score 0.09107737874861163 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._