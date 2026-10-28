# Graph Report - msk-forms-redesign  (2026-10-29)

## Corpus Check
- 436 files · ~226,193 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2512 nodes · 6567 edges · 162 communities (109 shown, 22 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 56 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ae543f49`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- src/forms.ts
- getDict
- getCurrentUser
- scripts
- pnpm + Turborepo Monorepo
- getLocale
- cn
- EmptyState
- shared/src/webhooks.ts
- ui/src/index.ts
- db/package.json
- tasks
- realtime/package.json
- form-builder.tsx
- s/[id]/page.tsx
- ui/button.tsx
- bot/package.json
- compilerOptions
- compilerOptions
- ui/package.json
- [slug]/page.tsx
- form-renderer.tsx
- branding/logo/route.ts
- requireUser
- FieldEditor
- field-input.tsx
- form-settings.ts
- dependencies
- submit/route.ts
- index.tsx
- form-spec.ts
- devDependencies
- [formId]/export/route.ts
- guild.ts
- submissions/[id]/page.tsx
- shared/package.json
- src/branding.ts
- i18n/package.json
- dashboard-nav.ts
- submissions/route.ts
- isLayoutField
- tokens.ts
- db/src/index.ts
- StatusDefsForm
- guild-hub.tsx
- compilerOptions
- verify/route.ts
- compilerOptions
- formula.ts
- audit-log/[hookId]/route.ts
- shared/src/index.ts
- statuses/page.tsx
- mirror job (Push to Codeberg)
- scripts
- generate-pwa-icons.mjs
- [handle]/page.tsx
- FormBuilder
- phone-field.tsx
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
- app-shell.tsx
- Dependabot Config
- next.config.ts
- exceljs
- site-header.tsx
- @msk-forms/shared
- legal.ts
- next
- next-themes
- qrcode
- color-dot.ts
- sharp
- stripe
- lib/branding.ts
- 20260619142218_init/migration.sql
- health/route.ts
- bot/src/webhooks.ts
- ecosystem.config.cjs
- md-message.sh
- Funding Config (GitHub Sponsors)
- Workspace package globs (apps/*, packages/*)
- bot/src/index.ts
- bot/src/notifications.ts
- members-manager.tsx
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
- checkbox-group.tsx
- view/route.ts
- SignatureField
- Colour
- The dashboard
- fieldDescribedBy
- BrandingForm
- sort-rows.test.ts
- turnstile-widget.tsx
- Components
- Development
- Issue Template Config
- Features
- LogoForm
- @aws-sdk/client-s3
- iron-session
- @msk-forms/db
- nodemailer
- @phosphor-icons/react
- @radix-ui/react-slot
- zod

## God Nodes (most connected - your core abstractions)
1. `getDict()` - 108 edges
2. `getCurrentUser()` - 91 edges
3. `canManageForms()` - 91 edges
4. `cn()` - 90 edges
5. `prisma` - 88 edges
6. `logGuildActivitySafe()` - 71 edges
7. `actor()` - 65 edges
8. `requireUser()` - 54 edges
9. `Button` - 51 edges
10. `getLocale()` - 38 edges

## Surprising Connections (you probably didn't know these)
- `CI Postgres 16 Service` --semantically_similar_to--> `Postgres 16 Service`  [INFERRED] [semantically similar]
  .github/workflows/ci.yml → docker-compose.yml
- `CI Redis 7 Service` --semantically_similar_to--> `Redis 7 Service`  [INFERRED] [semantically similar]
  .github/workflows/ci.yml → docker-compose.yml
- `save()` --calls--> `parseIdList()`  [EXTRACTED]
  apps/web/src/components/bot/bot-config-form.tsx → packages/shared/src/form-settings.ts
- `OutlineHandlers` --references--> `FieldType`  [EXTRACTED]
  apps/web/src/components/builder/field-outline.tsx → packages/shared/src/form-spec.ts
- `markAllRequired()` --calls--> `isLayoutField()`  [EXTRACTED]
  apps/web/src/components/builder/form-builder.tsx → packages/shared/src/form-spec.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **CI/CD & Quality Pipeline** — _github_workflows_ci, _github_workflows_deploy, _github_workflows_codeql, readme_branch_workflow [EXTRACTED 0.90]
- **Monorepo Apps & Packages** — readme_app_web, readme_app_bot, readme_app_realtime, readme_package_db, readme_package_shared, readme_package_ui, readme_package_i18n [EXTRACTED 0.90]
- **Local Dev Infrastructure Services** — docker_compose_postgres, docker_compose_redis, docker_compose_minio, docker_compose_infra [EXTRACTED 0.90]
- **Codeberg mirroring flow (trigger, guards, exact push)** — _github_workflows_mirror_mirror_to_codeberg, _github_workflows_mirror_main_and_tags_trigger, _github_workflows_mirror_fork_guard, _github_workflows_mirror_mirror_job, _github_workflows_mirror_exact_mirror_semantics, _github_workflows_mirror_codeberg_secrets [EXTRACTED 1.00]
- **pnpm supply-chain hardening (allowlist plus advisory overrides)** — pnpm_workspace_allowbuilds, pnpm_workspace_security_overrides, pnpm_workspace_minimatch_lift, pnpm_workspace_sharp_override, pnpm_workspace_find_my_way_override [EXTRACTED 1.00]

## Communities (162 total, 22 thin omitted)

### Community 0 - "src/forms.ts"
Cohesion: 0.22
Nodes (19): handleFormsAutocomplete(), handleFormsCommand(), liveForms(), LOCALE_NAMES, resolveGuild(), fmt(), deliverLog(), deliverOne() (+11 more)

### Community 1 - "getDict"
Cohesion: 0.07
Nodes (42): MySubmissionsPage(), BotConfigPage(), dynamic, runtime, ArchivedFormsPage(), RootLayout(), metadata, OfflinePage() (+34 more)

### Community 2 - "getCurrentUser"
Cohesion: 0.08
Nodes (62): DELETE(), dynamic, runtime, dynamic, GET(), POST(), runtime, POST() (+54 more)

### Community 3 - "scripts"
Cohesion: 0.04
Nodes (48): dotenv, eslint, @eslint/js, author, description, devDependencies, dotenv, eslint (+40 more)

### Community 4 - "pnpm + Turborepo Monorepo"
Cohesion: 0.14
Nodes (15): PWA Assets (service worker + icons), public/ Static Assets Doc, Event-Driven Domain Sync (systemd .path), Apache mod_md Auto-TLS, Custom Domains Runbook (Apache mod_md), sync-custom-domains.sh, apps/bot (discord.js), apps/realtime (WebSocket, Postgres LISTEN/NOTIFY) (+7 more)

### Community 5 - "getLocale"
Cohesion: 0.15
Nodes (20): dynamic, EditFormPage(), runtime, dynamic, ExperimentResultsPage(), runtime, FormPreviewPage(), dynamic (+12 more)

### Community 6 - "cn"
Cohesion: 0.05
Nodes (53): DashboardShellCopy, GuildIcon(), ShellCopy, Checkbox(), GuildSwitcher(), GuildSwitcherCopy, SwitcherGuild, LanguageSelect() (+45 more)

### Community 7 - "EmptyState"
Cohesion: 0.09
Nodes (34): dynamic, runtime, BoardPage(), dynamic, runtime, dynamic, runtime, dynamic (+26 more)

### Community 8 - "shared/src/webhooks.ts"
Cohesion: 0.09
Nodes (23): AnswerValueLabels, DiscordWebhookBody, SubmissionWebhookPayload, form, schema, submission, truncate(), WEBHOOK_ANSWER_LABELS (+15 more)

### Community 9 - "ui/src/index.ts"
Cohesion: 0.13
Nodes (19): Button(), ButtonProps, styles, Variant, Card(), CardProps, Checkbox(), CheckboxProps (+11 more)

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
Nodes (52): BotDict, ID_FIELD, LOCALE_OPTIONS, Values, BrandingDict, CSS_SNIPPETS, Values, BrandingDict (+44 more)

### Community 14 - "s/[id]/page.tsx"
Cohesion: 0.07
Nodes (52): dynamic, GET(), runtime, dynamic, GET(), runtime, GuildsPage(), DEFAULT_METADATA (+44 more)

### Community 15 - "ui/button.tsx"
Cohesion: 0.05
Nodes (55): dynamic, runtime, dynamic, runtime, AuditDict, GROUPS, ManageBillingButton(), FormActionCopy (+47 more)

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
Nodes (30): dynamic, PublicFormPage(), runtime, HourglassMedium, Tray, confettiColours(), Countdown(), tick() (+22 more)

### Community 21 - "form-renderer.tsx"
Cohesion: 0.16
Nodes (23): isGroupField(), Answers, FormLabels, FormRenderer(), collectErrors(), focusFirstError(), focusStep(), goBack() (+15 more)

### Community 22 - "branding/logo/route.ts"
Cohesion: 0.12
Nodes (25): dynamic, GET(), runtime, dynamic, POST(), runtime, DELETE(), dynamic (+17 more)

### Community 23 - "requireUser"
Cohesion: 0.07
Nodes (41): AccountLayout(), dynamic, runtime, ApiPage(), dynamic, runtime, CategoriesPage(), DomainPage() (+33 more)

### Community 24 - "FieldEditor"
Cohesion: 0.08
Nodes (27): ExperimentEditor(), FieldEditor(), addOption(), addRow(), patch(), removeOption(), removeRow(), setOption() (+19 more)

### Community 25 - "field-input.tsx"
Cohesion: 0.15
Nodes (15): DateFieldLabels, FieldInputLabels, FieldInputProps, FieldValue, GROUP_TYPES, FileField(), FileFieldLabels, formatSize() (+7 more)

### Community 26 - "form-settings.ts"
Cohesion: 0.14
Nodes (15): AnswerMap, AutomationCondition, automationConditionSchema, automationRuleSchema, experimentSchema, ExperimentVariant, experimentVariantSchema, FormSettings (+7 more)

### Community 27 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, class-variance-authority, clsx, @fontsource-variable/archivo, @fontsource-variable/source-sans-3, ioredis, @msk-forms/ui, pdf-lib (+13 more)

### Community 28 - "submit/route.ts"
Cohesion: 0.18
Nodes (16): dynamic, POST(), PREVIEW_LABELS, runtime, captchaEnabled(), captchaSiteKey(), ENV, verifyCaptcha() (+8 more)

### Community 29 - "index.tsx"
Cohesion: 0.04
Nodes (69): BuilderDict, FIELD_ICONS, fieldIcon(), FieldOutline(), GROUP_ORDER, GROUP_TYPES, grouped, OutlineHandlers (+61 more)

### Community 30 - "form-spec.ts"
Cohesion: 0.09
Nodes (21): BOOLEAN_TYPES, conditionRuleSchema, FIELD_TYPES, fieldOptionSchema, fieldTypeSchema, fieldValidationSchema, fileAnswerSchema, formFieldSchema (+13 more)

### Community 31 - "devDependencies"
Cohesion: 0.11
Nodes (19): devDependencies, postcss, tailwindcss, @tailwindcss/postcss, @types/nodemailer, @types/qrcode, @types/react, @types/react-dom (+11 more)

### Community 32 - "[formId]/export/route.ts"
Cohesion: 0.07
Nodes (35): csvCell(), dynamic, ExportFormat, FORMATS, GET(), runtime, dynamic, POST() (+27 more)

### Community 33 - "guild.ts"
Cohesion: 0.09
Nodes (37): bodySchema, dynamic, PATCH(), runtime, ASSIGNABLE, AssignableRole, dynamic, POST() (+29 more)

### Community 34 - "submissions/[id]/page.tsx"
Cohesion: 0.07
Nodes (34): dynamic, EVENT_ICON, runtime, ApiDict, ApiKeysManager(), fill(), iso(), BoardLabels (+26 more)

### Community 35 - "shared/package.json"
Cohesion: 0.11
Nodes (18): dependencies, zod, devDependencies, typescript, vitest, exports, typescript, vitest (+10 more)

### Community 36 - "src/branding.ts"
Cohesion: 0.27
Nodes (7): CustomCss(), accentColor, brandingColorSchema, brandingSchema, customCss, MAX_CUSTOM_CSS, sanitizeCustomCss()

### Community 37 - "i18n/package.json"
Cohesion: 0.11
Nodes (17): devDependencies, typescript, vitest, exports, ./de, ./en, typescript, vitest (+9 more)

### Community 38 - "dashboard-nav.ts"
Cohesion: 0.11
Nodes (22): dynamic, POST(), runtime, dynamic, GET(), runtime, GuildLayout(), DashboardShell() (+14 more)

### Community 39 - "submissions/route.ts"
Cohesion: 0.13
Nodes (20): dynamic, GET(), runtime, DELETE(), dynamic, runtime, dynamic, GET() (+12 more)

### Community 40 - "isLayoutField"
Cohesion: 0.11
Nodes (14): buildPreview(), ConditionEditor(), FieldInput(), AnswerLabels, AnswerSummary(), formatAnswer(), SubmissionFile, buildFieldSchema() (+6 more)

### Community 41 - "tokens.ts"
Cohesion: 0.10
Nodes (27): LINES_ONLY, Pair, PAIRS, Ref, resolve(), STATUS, tokens, utilities (+19 more)

### Community 42 - "db/src/index.ts"
Cohesion: 0.08
Nodes (24): dynamic, runtime, dynamic, POST(), runtime, dynamic, runtime, spec (+16 more)

### Community 43 - "StatusDefsForm"
Cohesion: 0.33
Nodes (8): payloadOf(), slugifyKey(), StatusDefsForm(), add(), edit(), patch(), remove(), save()

### Community 44 - "guild-hub.tsx"
Cohesion: 0.36
Nodes (5): dynamic, runtime, GuildHub(), getGuildCategories(), getLiveFormsForGuild()

### Community 45 - "compilerOptions"
Cohesion: 0.14
Nodes (13): compilerOptions, jsx, lib, outDir, rootDir, extends, include, DOM (+5 more)

### Community 46 - "verify/route.ts"
Cohesion: 0.18
Nodes (11): dynamic, lookupTxt(), POST(), runtime, DomainForm(), requestDomainSync(), CustomDomainInput, customDomainSchema (+3 more)

### Community 47 - "compilerOptions"
Cohesion: 0.17
Nodes (11): compilerOptions, lib, module, moduleResolution, outDir, rootDir, extends, include (+3 more)

### Community 48 - "formula.ts"
Cohesion: 0.27
Nodes (10): evaluateFormula(), parse(), expr(), factor(), term(), referencedFieldIds(), referenceValue(), roundTo() (+2 more)

### Community 49 - "audit-log/[hookId]/route.ts"
Cohesion: 0.12
Nodes (26): authorize(), DELETE(), dynamic, Params, PATCH(), runtime, dynamic, POST() (+18 more)

### Community 50 - "shared/src/index.ts"
Cohesion: 0.07
Nodes (43): bodySchema, dynamic, POST(), runtime, dynamic, GET(), runtime, dynamic (+35 more)

### Community 51 - "statuses/page.tsx"
Cohesion: 0.19
Nodes (10): dynamic, runtime, DEFAULT_LOCALE, DEFAULT_STATUSES, Locale, SUPPORTED_LOCALES, isTerminalStatus(), StatusDefInput (+2 more)

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
Nodes (30): FormBuilder(), addField(), addPage(), announce(), backToList(), focusIn(), focusMoveButton(), markAllRequired() (+22 more)

### Community 57 - "phone-field.tsx"
Cohesion: 0.38
Nodes (8): PhoneField(), update(), COUNTRIES, Country, DEFAULT_COUNTRY, flagOf(), formatPhone(), parsePhone()

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
Cohesion: 0.10
Nodes (31): ACTIVE, customerId(), dynamic, logPlanChange(), POST(), resolveGuildId(), runtime, sendOrderConfirmation() (+23 more)

### Community 64 - "dashboard-kit/index.ts"
Cohesion: 0.11
Nodes (19): dynamic, runtime, GuildRow, GuildTable(), FieldControlProps, Breadcrumb, compare(), SortDirection (+11 more)

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
Nodes (23): AuditHookRow, AUDIT_EVENT_PREFIX, AuditWebhookInput, auditWebhookInputSchema, AuditWebhookUpdate, auditWebhookUpdateSchema, EVENT_WEBHOOK_KIND, LOG_ACTION_GROUPS (+15 more)

### Community 70 - "Security overrides for transitive dependencies"
Cohesion: 0.60
Nodes (5): allowBuilds allowlist for dependency build scripts, find-my-way override for pinned prisma dev dependency, minimatch lifted to 10 to collapse brace-expansion copies, Security overrides for transitive dependencies, sharp override lifting the optional next copy

### Community 71 - "sync-custom-domains.sh"
Cohesion: 0.50
Nodes (3): PGCONNECT_TIMEOUT, PGOPTIONS, sync-custom-domains.sh script

### Community 72 - "i18n/src/index.ts"
Cohesion: 0.40
Nodes (4): defaultLocale, Locale, locales, messages

### Community 74 - "app-shell.tsx"
Cohesion: 0.13
Nodes (19): AccountMenu(), AppShell(), AppShellProps, NavDrawer(), navItemClass, ShellAccount, currentNavId(), ShellNavGroup (+11 more)

### Community 78 - "site-header.tsx"
Cohesion: 0.14
Nodes (16): ThemeSwitch(), GithubMark(), aboutLink(), productLines(), sectionLinks(), TOOL_URLS, SiteChrome(), FooterLink (+8 more)

### Community 80 - "legal.ts"
Cohesion: 0.15
Nodes (15): ImprintPage(), metadata, metadata, TermsPage(), metadata, PrivacyPage(), CaretRight, LegalContent() (+7 more)

### Community 84 - "color-dot.ts"
Cohesion: 0.20
Nodes (20): Theme, channelsToHex(), clamp01(), dotContrast(), readableDot(), COLOURS, THEMES, fromOklab() (+12 more)

### Community 87 - "lib/branding.ts"
Cohesion: 0.21
Nodes (20): accentContrast(), AccentSet, accentSets(), brandProps, brandVariables(), GUILD_ACCENT_ATTRIBUTE, hexToHslChannels(), labelFor() (+12 more)

### Community 88 - "20260619142218_init/migration.sql"
Cohesion: 0.19
Nodes (16): "api_keys", "files", "form_statuses", "form_versions", "forms", "guild_members", "guilds", "notifications" (+8 more)

### Community 91 - "bot/src/webhooks.ts"
Cohesion: 0.18
Nodes (17): guildStrings, buildLogEmbed(), clip(), formatActor(), PRESENTATION, en, backoffMs(), buildAuditBody() (+9 more)

### Community 101 - "bot/src/index.ts"
Cohesion: 0.23
Nodes (13): commands, registerCommands(), assertConfig(), config, guildIconUrl(), syncAllGuilds(), syncGuild(), updateGuildMeta() (+5 more)

### Community 102 - "bot/src/notifications.ts"
Cohesion: 0.19
Nodes (15): isExhausted(), isTerminalDmCode(), MAX_DELIVERY_ATTEMPTS, nextAttemptAt(), retryDelayMs(), TERMINAL_DM_CODES, dmStrings, Locale (+7 more)

### Community 103 - "members-manager.tsx"
Cohesion: 0.16
Nodes (12): ExperimentResultRow, ExperimentResultsCopy, ExperimentResultsTable(), PencilSimple, UserPlus, FormAccess, MemberRow, MembersDict (+4 more)

### Community 104 - "guild-i18n.ts"
Cohesion: 0.13
Nodes (13): de, en, es, fr, hu, pl, pt, STRINGS (+5 more)

### Community 105 - "Design System: MSK Forms"
Cohesion: 0.13
Nodes (15): Accessibility, Adding a colour, Adding an icon, Craft from the shop, colour from the customer, Customer branding, Design System: MSK Forms, Exclusion list, Icons (+7 more)

### Community 106 - "review-actions.ts"
Cohesion: 0.21
Nodes (11): Action, ACTION_STATUS, handleReviewButton(), statusLabel(), updateMessage(), grantAcceptedRole(), grantRoles(), BotConfigForm() (+3 more)

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
Cohesion: 0.31
Nodes (7): PREVIEW_BASE_CSS, CssPreview(), CssPreviewLabels, esc(), noSubscription(), useHydrated(), GUILD_ACCENT_CSS

### Community 111 - "CategoryListForm"
Cohesion: 0.31
Nodes (9): CategoryListForm(), add(), edit(), move(), patch(), remove(), save(), contentOf() (+1 more)

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

### Community 116 - "checkbox-group.tsx"
Cohesion: 0.31
Nodes (6): CheckboxGroup(), CheckboxGroupProps, ChoiceOption, choiceRowClass, RadioGroup(), RadioGroupProps

### Community 117 - "view/route.ts"
Cohesion: 0.43
Nodes (6): dynamic, POST(), runtime, experimentCookieName(), recordExperimentView(), experimentActive()

### Community 118 - "SignatureField"
Cohesion: 0.43
Nodes (6): SignatureField(), end(), move(), pos(), start(), upload()

### Community 119 - "Colour"
Cohesion: 0.33
Nodes (6): Colour, Contrast, Plain colours outside the tokens, Tokens, Two layers, Where green belongs

### Community 120 - "The dashboard"
Cohesion: 0.33
Nodes (6): Colours a guild picks, Moving without dragging (WCAG 2.5.7), Pages, Sidebar, The dashboard, Who sees which area (a rule)

### Community 121 - "fieldDescribedBy"
Cohesion: 0.67
Nodes (5): Field(), fieldDescribedBy(), fieldErrorId(), fieldHintId(), FieldProps

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

### Community 129 - "LogoForm"
Cohesion: 1.00
Nodes (3): LogoForm(), call(), onSelect()

## Knowledge Gaps
- **821 isolated node(s):** `semi`, `singleQuote`, `trailingComma`, `printWidth`, `tabWidth` (+816 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 958 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `prisma` connect `db/src/index.ts` to `src/forms.ts`, `getDict`, `getCurrentUser`, `getLocale`, `EmptyState`, `s/[id]/page.tsx`, `ui/button.tsx`, `branding/logo/route.ts`, `requireUser`, `submit/route.ts`, `[formId]/export/route.ts`, `guild.ts`, `submissions/[id]/page.tsx`, `submissions/route.ts`, `guild-hub.tsx`, `verify/route.ts`, `audit-log/[hookId]/route.ts`, `shared/src/index.ts`, `statuses/page.tsx`, `webhook/route.ts`, `bot/src/webhooks.ts`, `bot/src/index.ts`, `bot/src/notifications.ts`, `review-actions.ts`, `view/route.ts`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `dashboard-kit/index.ts`, `getDict`, `submissions/[id]/page.tsx`, `FormBuilder`, `getLocale`, `EmptyState`, `members-manager.tsx`, `app-shell.tsx`, `form-builder.tsx`, `site-header.tsx`, `ui/button.tsx`, `[slug]/page.tsx`, `FieldEditor`, `field-input.tsx`, `BrandingForm`, `index.tsx`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `getDict()` connect `getDict` to `getLocale`, `EmptyState`, `s/[id]/page.tsx`, `ui/button.tsx`, `[slug]/page.tsx`, `requireUser`, `submit/route.ts`, `[formId]/export/route.ts`, `guild.ts`, `submissions/[id]/page.tsx`, `dashboard-nav.ts`, `db/src/index.ts`, `guild-hub.tsx`, `audit-log/[hookId]/route.ts`, `shared/src/index.ts`, `statuses/page.tsx`, `dashboard-kit/index.ts`, `site-header.tsx`, `legal.ts`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `semi`, `singleQuote`, `trailingComma` to the rest of the system?**
  _821 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `getDict` be split into smaller, more focused modules?**
  _Cohesion score 0.07130333138515488 - nodes in this community are weakly interconnected._
- **Should `getCurrentUser` be split into smaller, more focused modules?**
  _Cohesion score 0.07822135670236936 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._