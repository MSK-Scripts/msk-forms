# Graph Report - msk-forms  (2026-11-20)

## Corpus Check
- 461 files · ~232,222 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2582 nodes · 6819 edges · 172 communities (145 shown, 27 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 57 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2be85b3d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- src/forms.ts
- getDict
- getCurrentUser
- scripts
- pnpm + Turborepo Monorepo
- submissions/[id]/page.tsx
- app-shell.tsx
- submissions/page.tsx
- shared/src/webhooks.ts
- ui/src/index.ts
- db/package.json
- tasks
- realtime/package.json
- category-list-form.tsx
- callback/route.ts
- form-builder.tsx
- bot/package.json
- compilerOptions
- compilerOptions
- ui/package.json
- i18n/index.ts
- FormRenderer
- branding/logo/route.ts
- forms/page.tsx
- validation-message.ts
- field-input.tsx
- form-settings.ts
- dependencies
- [slug]/page.tsx
- index.tsx
- form-spec.ts
- devDependencies
- rateLimit
- actor
- dashboard-kit/index.ts
- shared/package.json
- css-preview.tsx
- i18n/package.json
- getSession
- db/src/index.ts
- LogoForm
- tokens.ts
- validation-messages.ts
- StatusDefsForm
- forms-hub.tsx
- compilerOptions
- DomainForm
- compilerOptions
- formula.ts
- shared/src/index.ts
- guild.ts
- status-defs.ts
- mirror job (Push to Codeberg)
- scripts
- generate-pwa-icons.mjs
- [handle]/page.tsx
- FormBuilder
- header-bar.tsx
- db/tsconfig.json
- i18n/tsconfig.json
- shared/tsconfig.json
- .prettierrc.json
- bot/tsconfig.json
- webhook/route.ts
- CaptchaForm
- realtime/src/index.ts
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
- s/[id]/page.tsx
- @msk-forms/shared
- site-footer.tsx
- next
- submit/route.ts
- qrcode
- dotColors
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
- bot/src/webhooks.ts
- guild-i18n.ts
- Design System: MSK Forms
- review-actions.ts
- MSK Forms Platform
- CI Workflow
- AuditLogManager
- css-preview-sync.test.ts
- CategoryListForm
- error.tsx
- AutomationsEditor
- MembersManager
- branding-contract.test.ts
- access.ts
- public-frame.tsx
- SignatureField
- Colour
- The dashboard
- Custom Domains Runbook (Apache mod_md)
- BrandingForm
- phone-field.tsx
- submission-status.ts
- Components
- Development
- Issue Template Config
- SubmissionsTable
- requireUser
- @aws-sdk/client-s3
- iron-session
- @msk-forms/db
- nodemailer
- @phosphor-icons/react
- @radix-ui/react-slot
- zod
- (account)/page.tsx
- mail.ts
- ConditionEditor
- ApiKeysManager
- ExperimentEditor
- experiment-page-access.test.ts
- OAuthForm
- class-variance-authority
- dictionaries.ts
- guild-submissions.test.ts

## God Nodes (most connected - your core abstractions)
1. `getDict()` - 110 edges
2. `getCurrentUser()` - 91 edges
3. `cn()` - 91 edges
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

## Communities (172 total, 27 thin omitted)

### Community 0 - "src/forms.ts"
Cohesion: 0.23
Nodes (15): commands, config, handleFormsAutocomplete(), handleFormsCommand(), liveForms(), LOCALE_NAMES, resolveGuild(), fmt() (+7 more)

### Community 1 - "getDict"
Cohesion: 0.10
Nodes (24): metadata, OfflinePage(), metadata, revalidate, runtime, StatsPage(), DiscordMark(), ArrowRight (+16 more)

### Community 2 - "getCurrentUser"
Cohesion: 0.06
Nodes (69): DELETE(), dynamic, runtime, dynamic, PATCH(), runtime, dynamic, PATCH() (+61 more)

### Community 3 - "scripts"
Cohesion: 0.04
Nodes (48): dotenv, eslint, @eslint/js, author, description, devDependencies, dotenv, eslint (+40 more)

### Community 4 - "pnpm + Turborepo Monorepo"
Cohesion: 0.20
Nodes (10): PWA Assets (service worker + icons), public/ Static Assets Doc, apps/bot (discord.js), apps/web (Next.js), Multi-Tenant Discord Bot, Real Feedback Loop, Form Builder (20+ field types), pnpm + Turborepo Monorepo (+2 more)

### Community 5 - "submissions/[id]/page.tsx"
Cohesion: 0.06
Nodes (31): dynamic, EVENT_ICON, runtime, DashboardShell(), DashboardShellCopy, GROUPS, ICON, MOBILE (+23 more)

### Community 6 - "app-shell.tsx"
Cohesion: 0.08
Nodes (29): AccountMenu(), AppShellProps, NavDrawer(), navItemClass, ShellAccount, ShellCopy, close(), EmptyKind (+21 more)

### Community 7 - "submissions/page.tsx"
Cohesion: 0.11
Nodes (30): POST(), BoardPage(), dynamic, runtime, ArchivedFormsPage(), dynamic, runtime, ArchivedSubmissionsPage() (+22 more)

### Community 8 - "shared/src/webhooks.ts"
Cohesion: 0.10
Nodes (22): AnswerValueLabels, buildDiscordWebhookBody(), DiscordWebhookBody, form, schema, submission, truncate(), WEBHOOK_ANSWER_LABELS (+14 more)

### Community 9 - "ui/src/index.ts"
Cohesion: 0.07
Nodes (40): BoardColumn, BoardLabels, BoardSubmission, fill(), KanbanBoard(), move(), countForm(), CountForms (+32 more)

### Community 10 - "db/package.json"
Cohesion: 0.06
Nodes (31): dependencies, @prisma/adapter-pg, @prisma/client, devDependencies, pg, prisma, tsx, @types/pg (+23 more)

### Community 11 - "tasks"
Cohesion: 0.07
Nodes (29): ^build, coverage/**, .env, !.next/cache/**, NODE_ENV, dependsOn, outputs, cache (+21 more)

### Community 12 - "realtime/package.json"
Cohesion: 0.07
Nodes (28): dependencies, pg, ws, devDependencies, tsx, @types/pg, @types/ws, typescript (+20 more)

### Community 13 - "category-list-form.tsx"
Cohesion: 0.09
Nodes (25): BotDict, ID_FIELD, LOCALE_OPTIONS, Values, BrandingDict, CSS_SNIPPETS, Values, CategoriesDict (+17 more)

### Community 14 - "callback/route.ts"
Cohesion: 0.14
Nodes (22): dynamic, GET(), runtime, dynamic, GET(), runtime, buildAuthorizeUrl(), discordAvatarUrl() (+14 more)

### Community 15 - "form-builder.tsx"
Cohesion: 0.08
Nodes (56): ApiDict, AuditDict, GROUPS, BrandingDict, FILE_INPUT, BuilderDict, NO_VALUE_OPS, StatusOption (+48 more)

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

### Community 20 - "i18n/index.ts"
Cohesion: 0.11
Nodes (27): dynamic, EditFormPage(), runtime, dynamic, ExperimentResultsPage(), runtime, dynamic, FormPreviewPage() (+19 more)

### Community 21 - "FormRenderer"
Cohesion: 0.21
Nodes (17): FormRenderer(), collectErrors(), focusFirstError(), focusStep(), goBack(), goNext(), handleSubmit(), isLayout() (+9 more)

### Community 22 - "branding/logo/route.ts"
Cohesion: 0.13
Nodes (24): dynamic, GET(), runtime, dynamic, POST(), runtime, DELETE(), dynamic (+16 more)

### Community 23 - "forms/page.tsx"
Cohesion: 0.10
Nodes (34): ApiPage(), dynamic, runtime, DomainPage(), dynamic, runtime, dynamic, NewFormPage() (+26 more)

### Community 24 - "validation-message.ts"
Cohesion: 0.53
Nodes (3): localizeIssue(), ZOD_LOCALES, validationMessageKey

### Community 25 - "field-input.tsx"
Cohesion: 0.09
Nodes (26): DateFieldLabels, FieldInput(), FieldInputLabels, FieldInputProps, FieldValue, GROUP_TYPES, isGroupField(), FileField() (+18 more)

### Community 26 - "form-settings.ts"
Cohesion: 0.10
Nodes (21): FormInput, AnswerMap, FORM_DEFINITION_VERSION, FormDefinition, formDefinitionSchema, AutomationCondition, automationConditionSchema, automationRuleSchema (+13 more)

### Community 27 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, clsx, @fontsource-variable/archivo, @fontsource-variable/source-sans-3, ioredis, @msk-forms/ui, next-themes, pdf-lib (+13 more)

### Community 28 - "[slug]/page.tsx"
Cohesion: 0.10
Nodes (25): dynamic, POST(), runtime, dynamic, PublicFormPage(), runtime, ExperimentView(), GuildFormsHub() (+17 more)

### Community 29 - "index.tsx"
Cohesion: 0.05
Nodes (59): Cell, metadata, FieldEditorProps, BuilderDict, FIELD_ICONS, fieldIcon(), FieldOutline(), GROUP_ORDER (+51 more)

### Community 30 - "form-spec.ts"
Cohesion: 0.09
Nodes (21): BOOLEAN_TYPES, conditionRuleSchema, fieldOptionSchema, fieldTypeSchema, fieldValidationSchema, fileAnswerSchema, formFieldSchema, formPageSchema (+13 more)

### Community 31 - "devDependencies"
Cohesion: 0.11
Nodes (19): devDependencies, postcss, tailwindcss, @tailwindcss/postcss, @types/nodemailer, @types/qrcode, @types/react, @types/react-dom (+11 more)

### Community 32 - "rateLimit"
Cohesion: 0.06
Nodes (41): csvCell(), dynamic, ExportFormat, FORMATS, GET(), runtime, POST(), dynamic (+33 more)

### Community 33 - "actor"
Cohesion: 0.10
Nodes (29): bodySchema, dynamic, PATCH(), runtime, ASSIGNABLE, AssignableRole, dynamic, POST() (+21 more)

### Community 34 - "dashboard-kit/index.ts"
Cohesion: 0.07
Nodes (40): ArchivedFormRow, FormActionCopy, FormActionDialog(), FormActionRequest, importDefinition(), ImportFormButton(), onFile(), useReplaceFromJson() (+32 more)

### Community 35 - "shared/package.json"
Cohesion: 0.11
Nodes (18): dependencies, zod, devDependencies, typescript, vitest, exports, typescript, vitest (+10 more)

### Community 36 - "css-preview.tsx"
Cohesion: 0.17
Nodes (13): CssPreview(), CssPreviewLabels, esc(), noSubscription(), useHydrated(), CustomCss(), GUILD_ACCENT_ATTRIBUTE, accentColor (+5 more)

### Community 37 - "i18n/package.json"
Cohesion: 0.11
Nodes (17): devDependencies, typescript, vitest, exports, ./de, ./en, typescript, vitest (+9 more)

### Community 38 - "getSession"
Cohesion: 0.22
Nodes (10): dynamic, POST(), runtime, dynamic, GET(), runtime, logoutAction(), getSession() (+2 more)

### Community 39 - "db/src/index.ts"
Cohesion: 0.07
Nodes (37): dynamic, GET(), POST(), runtime, dynamic, GET(), runtime, DELETE() (+29 more)

### Community 40 - "LogoForm"
Cohesion: 1.00
Nodes (3): LogoForm(), call(), onSelect()

### Community 41 - "tokens.ts"
Cohesion: 0.13
Nodes (24): LINES_ONLY, Pair, PAIRS, Ref, resolve(), STATUS, tokens, utilities (+16 more)

### Community 42 - "validation-messages.ts"
Cohesion: 0.18
Nodes (10): BOT_LOCALES, BotConfig, botConfigSchema, BotLocale, snowflake, categoriesSchema, categoryInputSchema, MAX_CATEGORIES (+2 more)

### Community 43 - "StatusDefsForm"
Cohesion: 0.33
Nodes (8): payloadOf(), slugifyKey(), StatusDefsForm(), add(), edit(), patch(), remove(), save()

### Community 44 - "forms-hub.tsx"
Cohesion: 0.20
Nodes (11): HourglassMedium, Tray, confettiColours(), Countdown(), tick(), CountdownUnits, fireConfetti(), HubCategory (+3 more)

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

### Community 49 - "shared/src/index.ts"
Cohesion: 0.12
Nodes (25): authorize(), DELETE(), dynamic, Params, PATCH(), runtime, dynamic, POST() (+17 more)

### Community 50 - "guild.ts"
Cohesion: 0.13
Nodes (21): dynamic, GET(), runtime, DELETE(), dynamic, PATCH(), runtime, dynamic (+13 more)

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
Cohesion: 0.21
Nodes (8): dynamic, HandleHubPage(), runtime, getGuildByHandle(), APP_DIR, handleSchema, isReservedHandle(), RESERVED_HANDLES

### Community 56 - "FormBuilder"
Cohesion: 0.06
Nodes (52): BotConfigForm(), save(), botConfigBody(), BotConfigValues, botConfigValuesOf(), empty, FieldEditor(), addOption() (+44 more)

### Community 57 - "header-bar.tsx"
Cohesion: 0.10
Nodes (29): isoToLocalInput(), useDismiss(), DateField(), emit(), pickDay(), setTime(), DateFieldMode, pad() (+21 more)

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
Cohesion: 0.11
Nodes (28): ACTIVE, customerId(), dynamic, logPlanChange(), POST(), resolveGuildId(), runtime, sendOrderConfirmation() (+20 more)

### Community 65 - "realtime/src/index.ts"
Cohesion: 0.23
Nodes (7): ClientState, createServer(), fanout(), listenForChanges(), PORT, verifyGuildToken(), createSerialQueue()

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

### Community 74 - "cn"
Cohesion: 0.08
Nodes (32): ExperimentResultRow, ExperimentResultsCopy, LanguageSelect(), ARROW, MEANING, StatGrid(), StatTile(), StatTrend (+24 more)

### Community 78 - "s/[id]/page.tsx"
Cohesion: 0.19
Nodes (8): dynamic, runtime, TERMINAL, PublicCard(), PublicHead(), PublicSection(), StatusLive(), SubmissionActions()

### Community 80 - "site-footer.tsx"
Cohesion: 0.10
Nodes (23): ImprintPage(), metadata, metadata, TermsPage(), metadata, PrivacyPage(), GithubMark(), LegalContent() (+15 more)

### Community 82 - "submit/route.ts"
Cohesion: 0.13
Nodes (22): buildPreview(), dynamic, POST(), PREVIEW_LABELS, runtime, AnswerLabels, AnswerSummary(), formatAnswer() (+14 more)

### Community 84 - "dotColors"
Cohesion: 0.15
Nodes (27): SubmissionRow, SubmissionRowsTable(), accentContrast(), Theme, UI_CONTRAST, channelsToHex(), clamp01(), contrastRatio() (+19 more)

### Community 87 - "lib/branding.ts"
Cohesion: 0.25
Nodes (15): AccentSet, accentSets(), brandProps, brandVariables(), hexToHslChannels(), labelFor(), LABELS, MSK_GREEN (+7 more)

### Community 88 - "20260619142218_init/migration.sql"
Cohesion: 0.19
Nodes (16): "api_keys", "files", "form_statuses", "form_versions", "forms", "guild_members", "guilds", "notifications" (+8 more)

### Community 91 - "app/page.tsx"
Cohesion: 0.17
Nodes (20): DEFAULT_METADATA, generateMetadata(), viewport, DEFAULT_ICONS, manifest(), NotFound(), dynamic, HomePage() (+12 more)

### Community 101 - "bot/src/index.ts"
Cohesion: 0.38
Nodes (10): registerCommands(), assertConfig(), guildIconUrl(), syncAllGuilds(), syncGuild(), updateGuildMeta(), createClient(), main() (+2 more)

### Community 102 - "bot/src/notifications.ts"
Cohesion: 0.14
Nodes (21): isChannelInGuild(), isExhausted(), isTerminalDmCode(), MAX_DELIVERY_ATTEMPTS, nextAttemptAt(), retryDelayMs(), TERMINAL_DM_CODES, dmStrings (+13 more)

### Community 103 - "bot/src/webhooks.ts"
Cohesion: 0.17
Nodes (16): backoffMs(), failedAttempt, MAX_ATTEMPTS, NOW, deliverOne(), DeliveryResult, DeliveryRow, DISCORD_WEBHOOK_GONE (+8 more)

### Community 104 - "guild-i18n.ts"
Cohesion: 0.17
Nodes (13): de, en, es, fr, hu, pl, pt, STRINGS (+5 more)

### Community 105 - "Design System: MSK Forms"
Cohesion: 0.13
Nodes (15): Accessibility, Adding a colour, Adding an icon, Craft from the shop, colour from the customer, Customer branding, Design System: MSK Forms, Exclusion list, Icons (+7 more)

### Community 106 - "review-actions.ts"
Cohesion: 0.25
Nodes (12): Action, ACTION_STATUS, handleReviewButton(), statusLabel(), updateMessage(), grantAcceptedRole(), grantRoles(), dashboardSubmissionUrl() (+4 more)

### Community 107 - "MSK Forms Platform"
Cohesion: 0.15
Nodes (14): Pull Request Template, Code of Conduct (Contributor Covenant 2.1), Conventional Commits Convention, Contributing Guide, i18n Dictionary Completeness Enforcement, Node 22 / pnpm 11 Requirements, Discord bot, Features (+6 more)

### Community 108 - "CI Workflow"
Cohesion: 0.29
Nodes (8): CI Workflow, CI Redis 7 Service, CodeQL Security Workflow, Production Deploy Workflow, SSH Deploy to Debian/PM2, Redis 7 Service, Branch & CI/CD Workflow, packages/db (Prisma schema & client)

### Community 109 - "AuditLogManager"
Cohesion: 0.21
Nodes (10): ActionPicker(), setMany(), AuditLogManager(), add(), patch(), saveEdit(), test(), deliveryState() (+2 more)

### Community 110 - "css-preview-sync.test.ts"
Cohesion: 0.29
Nodes (5): PREVIEW_BASE_CSS, GUILD_ACCENT_CSS, live, preview, GLOBALS_CSS

### Community 111 - "CategoryListForm"
Cohesion: 0.19
Nodes (13): CategoryListForm(), add(), edit(), move(), patch(), remove(), save(), contentOf() (+5 more)

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

### Community 116 - "access.ts"
Cohesion: 0.22
Nodes (15): canDeleteFormsFromRole(), isGlobalReviewerRole(), isManagerRole(), MANAGER_ROLES, manageScopeFromRole(), REVIEWER_ROLES, ReviewScope, scopeFromRole() (+7 more)

### Community 117 - "public-frame.tsx"
Cohesion: 0.26
Nodes (12): PoweredBy(), PublicFrame(), PublicGuild, accountCopy(), dashboardLinks(), aboutLink(), productLines(), sectionLinks() (+4 more)

### Community 118 - "SignatureField"
Cohesion: 0.43
Nodes (6): SignatureField(), end(), move(), pos(), start(), upload()

### Community 119 - "Colour"
Cohesion: 0.33
Nodes (6): Colour, Contrast, Plain colours outside the tokens, Tokens, Two layers, Where green belongs

### Community 120 - "The dashboard"
Cohesion: 0.33
Nodes (6): Colours a guild picks, Moving without dragging (WCAG 2.5.7), Pages, Sidebar, The dashboard, Who sees which area (a rule)

### Community 121 - "Custom Domains Runbook (Apache mod_md)"
Cohesion: 0.20
Nodes (10): CI Postgres 16 Service, Local Dev Infra (docker-compose), MinIO S3 Service, Postgres 16 Service, Event-Driven Domain Sync (systemd .path), Apache mod_md Auto-TLS, Custom Domains Runbook (Apache mod_md), sync-custom-domains.sh (+2 more)

### Community 122 - "BrandingForm"
Cohesion: 0.50
Nodes (3): BrandingForm(), addSnippet(), update()

### Community 123 - "phone-field.tsx"
Cohesion: 0.38
Nodes (8): PhoneField(), update(), COUNTRIES, Country, DEFAULT_COUNTRY, flagOf(), formatPhone(), parsePhone()

### Community 124 - "submission-status.ts"
Cohesion: 0.29
Nodes (8): changeSubmissionStatus(), ChangeSubmissionStatusArgs, ChangeSubmissionStatusResult, messageFromMap(), resolveTransitionMessage(), StatusChangeOutboxNotification, Db, enqueueWebhooks()

### Community 125 - "Components"
Cohesion: 0.40
Nodes (5): Base (`apps/web/src/components/ui`), Components, Dashboard kit (`apps/web/src/components/dashboard-kit`), Public form controls (`packages/ui`), Site pages (`apps/web/src/components/site`, `components/page`)

### Community 126 - "Development"
Cohesion: 0.40
Nodes (5): Branches and CI/CD, Development, Local development, Project structure, Tech stack

### Community 127 - "Issue Template Config"
Cohesion: 0.50
Nodes (4): Bug Report Issue Template, Issue Template Config, Feature Request Issue Template, Private Vulnerability Reporting

### Community 128 - "SubmissionsTable"
Cohesion: 0.39
Nodes (5): fill(), SubmissionsTable(), apply(), report(), setArchived()

### Community 129 - "requireUser"
Cohesion: 0.06
Nodes (38): dynamic, MySubmissionsPage(), runtime, AuditLogPage(), dynamic, runtime, BotConfigPage(), dynamic (+30 more)

### Community 162 - "(account)/page.tsx"
Cohesion: 0.21
Nodes (11): AccountLayout(), dynamic, runtime, dynamic, GuildsPage(), runtime, DashboardFrame(), Member (+3 more)

### Community 163 - "mail.ts"
Cohesion: 0.43
Nodes (6): forLog(), getTransporter(), MailConfig, mailConfigFromEnv(), MailMessage, sendMail()

### Community 165 - "ApiKeysManager"
Cohesion: 0.40
Nodes (3): ApiKeysManager(), fill(), iso()

### Community 167 - "experiment-page-access.test.ts"
Cohesion: 0.40
Nodes (3): canManageForm, canManageForms, getFormForEdit

### Community 171 - "dictionaries.ts"
Cohesion: 0.20
Nodes (9): de, dictionaries, en, es, fr, hu, pl, pt (+1 more)

## Knowledge Gaps
- **832 isolated node(s):** `semi`, `singleQuote`, `trailingComma`, `printWidth`, `tabWidth` (+827 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `prisma` connect `db/src/index.ts` to `src/forms.ts`, `requireUser`, `getCurrentUser`, `getDict`, `submissions/[id]/page.tsx`, `submissions/page.tsx`, `callback/route.ts`, `i18n/index.ts`, `branding/logo/route.ts`, `forms/page.tsx`, `[slug]/page.tsx`, `rateLimit`, `actor`, `shared/src/index.ts`, `guild.ts`, `webhook/route.ts`, `submit/route.ts`, `app/page.tsx`, `bot/src/index.ts`, `bot/src/notifications.ts`, `bot/src/webhooks.ts`, `review-actions.ts`, `submission-status.ts`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `getDict()` connect `getDict` to `rateLimit`, `requireUser`, `getCurrentUser`, `(account)/page.tsx`, `actor`, `submissions/[id]/page.tsx`, `submissions/page.tsx`, `s/[id]/page.tsx`, `site-footer.tsx`, `shared/src/index.ts`, `submit/route.ts`, `i18n/index.ts`, `public-frame.tsx`, `forms/page.tsx`, `app/page.tsx`, `[slug]/page.tsx`, `index.tsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `!.next/cache/**` connect `tasks` to `getDict`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `semi`, `singleQuote`, `trailingComma` to the rest of the system?**
  _832 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `getDict` be split into smaller, more focused modules?**
  _Cohesion score 0.10476190476190476 - nodes in this community are weakly interconnected._
- **Should `getCurrentUser` be split into smaller, more focused modules?**
  _Cohesion score 0.06392009987515605 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._