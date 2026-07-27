# Graph Report - .  (2026-07-26)

## Corpus Check
- 341 files · ~151,575 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1530 nodes · 3770 edges · 101 communities (80 shown, 21 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 36 edges (avg confidence: 0.82)
- Token cost: 148,290 input · 0 output

## Community Hubs (Navigation)
- Discord Bot Runtime
- Public Marketing Pages
- Guild REST API Routes
- Root Package & Tooling
- GitHub CI & Templates
- Dashboard Settings Pages
- Dashboard Settings Forms
- Board & Bulk Actions
- Webhook Delivery
- Submission Review Panel
- DB Package Manifest
- Turborepo Task Config
- Realtime Package Manifest
- Builder Logic Editors
- Custom Domain & Discord Helpers
- Dashboard Dialogs & API Keys
- Bot Package Manifest
- Shared TypeScript Base Config
- Web TypeScript Config
- UI Package Manifest
- Public Page Widgets
- Form Renderer & Captcha
- Branding & Logo API
- API & Domain Dashboard Pages
- Form Builder Field Editor
- Form Field Widgets
- Form Definition Schemas
- Web App Dependencies
- Public Submit & Captcha
- Forms List & Access Roles
- Form Spec & Validation
- Web Styling Toolchain
- Client IP & Experiments
- Member Role API
- Root Layout & Brand Shell
- Shared Package Manifest
- Custom CSS Preview
- i18n Package Manifest
- Auth & Locale Switching
- Submission Self-Service API
- Answer Formatting
- Public Form & Status Pages
- Status Change & Guild Log
- Categories & Status Editors
- Public Guild Hub & Schedule
- UI TypeScript Config
- Domain Verification
- Realtime TypeScript Config
- Calculated Field Formula
- Submission Exports
- Plan Limits & Tiers
- Locales & Status Definitions
- Codeberg Mirror Workflow
- Web Package Scripts
- PWA Icon Generation
- Guild Handle Routing
- Date & Time Field
- Phone Field & Countries
- DB TypeScript Config
- i18n TypeScript Config
- Shared TypeScript Config
- Prettier Config
- Bot TypeScript Config
- Stripe Billing Webhook
- Dashboard Layout & Tabs
- Realtime WebSocket Server
- Brand & PWA Icons
- Standalone Asset Copy
- Webhooks Manager UI
- Web Package Metadata
- pnpm Security Overrides
- Custom Domain Sync Script
- i18n Package Entry
- Proxy & Security Headers
- Database Seed
- Dependabot & Tailwind Pin
- Next.js Config
- exceljs Dependency
- ioredis Dependency
- Shared Package Link
- UI Package Link
- Next.js Dependency
- next-themes Dependency
- qrcode Dependency
- react-dom Dependency
- sharp Dependency
- stripe Dependency
- Tabler Icons Dependency
- zustand Dependency
- Tailwind Config
- PM2 Ecosystem Config
- mod_md Message Hook
- GitHub Funding Config
- Workspace Package Globs

## God Nodes (most connected - your core abstractions)
1. `getDict()` - 90 edges
2. `canManageForms()` - 81 edges
3. `getCurrentUser()` - 77 edges
4. `requireUser()` - 46 edges
5. `Card()` - 40 edges
6. `isGuildPro()` - 36 edges
7. `logGuildActivitySafe()` - 31 edges
8. `POST()` - 29 edges
9. `parseBranding()` - 26 edges
10. `isPrimaryHostname()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `CI Postgres 16 Service` --semantically_similar_to--> `Postgres 16 Service`  [INFERRED] [semantically similar]
  .github/workflows/ci.yml → docker-compose.yml
- `CI Redis 7 Service` --semantically_similar_to--> `Redis 7 Service`  [INFERRED] [semantically similar]
  .github/workflows/ci.yml → docker-compose.yml
- `FormBuilder()` --indirect_call--> `field()`  [INFERRED]
  apps/web/src/components/builder/form-builder.tsx → packages/shared/src/conditions.test.ts
- `DateField()` --indirect_call--> `h()`  [INFERRED]
  apps/web/src/components/form/date-field.tsx → packages/shared/src/schedule.test.ts
- `FormRenderer()` --indirect_call--> `field()`  [INFERRED]
  apps/web/src/components/form/form-renderer.tsx → packages/shared/src/conditions.test.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **CI/CD & Quality Pipeline** — _github_workflows_ci, _github_workflows_deploy, _github_workflows_codeql, readme_branch_workflow [EXTRACTED 0.90]
- **Monorepo Apps & Packages** — readme_app_web, readme_app_bot, readme_app_realtime, readme_package_db, readme_package_shared, readme_package_ui, readme_package_i18n [EXTRACTED 0.90]
- **Local Dev Infrastructure Services** — docker_compose_postgres, docker_compose_redis, docker_compose_minio, docker_compose_infra [EXTRACTED 0.90]
- **Codeberg mirroring flow (trigger, guards, exact push)** — _github_workflows_mirror_mirror_to_codeberg, _github_workflows_mirror_main_and_tags_trigger, _github_workflows_mirror_fork_guard, _github_workflows_mirror_mirror_job, _github_workflows_mirror_exact_mirror_semantics, _github_workflows_mirror_codeberg_secrets [EXTRACTED 1.00]
- **pnpm supply-chain hardening (allowlist plus advisory overrides)** — pnpm_workspace_allowbuilds, pnpm_workspace_security_overrides, pnpm_workspace_minimatch_lift, pnpm_workspace_sharp_override, pnpm_workspace_find_my_way_override [EXTRACTED 1.00]

## Communities (101 total, 21 thin omitted)

### Community 0 - "Discord Bot Runtime"
Cohesion: 0.06
Nodes (71): commands, registerCommands(), assertConfig(), config, handleFormsAutocomplete(), handleFormsCommand(), liveForms(), LOCALE_NAMES (+63 more)

### Community 1 - "Public Marketing Pages"
Cohesion: 0.06
Nodes (44): metadata, OfflinePage(), Cell, metadata, PricingPage(), metadata, StatsPage(), ImprintPage() (+36 more)

### Community 2 - "Guild REST API Routes"
Cohesion: 0.12
Nodes (38): DELETE(), GET(), POST(), PATCH(), DELETE(), PATCH(), GET(), PUT() (+30 more)

### Community 3 - "Root Package & Tooling"
Cohesion: 0.04
Nodes (46): dotenv, eslint, @eslint/js, author, description, devDependencies, dotenv, eslint (+38 more)

### Community 4 - "GitHub CI & Templates"
Cohesion: 0.05
Nodes (43): Bug Report Issue Template, Issue Template Config, Feature Request Issue Template, Pull Request Template, CI Workflow, CI Postgres 16 Service, CI Redis 7 Service, CodeQL Security Workflow (+35 more)

### Community 5 - "Dashboard Settings Pages"
Cohesion: 0.14
Nodes (30): GET(), BotConfigPage(), BrandingPage(), CategoriesPage(), EditFormPage(), ExperimentResultsPage(), FormPreviewPage(), NewFormPage() (+22 more)

### Community 6 - "Dashboard Settings Forms"
Cohesion: 0.07
Nodes (31): IntegrationsCard(), IntegrationsText, BotDict, LOCALE_OPTIONS, BrandingDict, BrandingForm(), CSS_SNIPPETS, BrandingDict (+23 more)

### Community 7 - "Board & Bulk Actions"
Cohesion: 0.13
Nodes (25): POST(), bodySchema, POST(), POST(), BoardPage(), ArchivedSubmissionsPage(), GuildSubmissionsPage(), BoardColumn (+17 more)

### Community 8 - "Webhook Delivery"
Cohesion: 0.08
Nodes (31): backoffMs(), deliverOne(), deliverPendingWebhooks(), DeliveryRow, hydratePayload(), ThinPayload, AnswerValueLabels, buildDiscordWebhookBody() (+23 more)

### Community 9 - "Submission Review Panel"
Cohesion: 0.10
Nodes (22): ReviewDict, ReviewPanel(), SubmissionAction, submissionActionSchema, ButtonProps, styles, Variant, CardProps (+14 more)

### Community 10 - "DB Package Manifest"
Cohesion: 0.06
Nodes (31): dependencies, @prisma/adapter-pg, @prisma/client, devDependencies, pg, prisma, tsx, @types/pg (+23 more)

### Community 11 - "Turborepo Task Config"
Cohesion: 0.07
Nodes (29): ^build, coverage/**, .env, !.next/cache/**, NODE_ENV, dependsOn, outputs, cache (+21 more)

### Community 12 - "Realtime Package Manifest"
Cohesion: 0.07
Nodes (28): dependencies, pg, ws, devDependencies, tsx, @types/pg, @types/ws, typescript (+20 more)

### Community 13 - "Builder Logic Editors"
Cohesion: 0.10
Nodes (23): AutomationsEditor(), BuilderDict, NO_VALUE_OPS, StatusOption, ACTIONS, CondDict, ConditionEditor(), NO_VALUE_OPS (+15 more)

### Community 14 - "Custom Domain & Discord Helpers"
Cohesion: 0.16
Nodes (21): GET(), GET(), DomainGuild, hostname(), primaryHostname(), buildAuthorizeUrl(), DiscordTokenResponse, DiscordUser (+13 more)

### Community 15 - "Dashboard Dialogs & API Keys"
Cohesion: 0.10
Nodes (17): ApiDict, ApiKeyRow, ApiKeysManager(), day(), ConfirmDialog(), DeleteFormButton(), ImportFormButton(), ReplaceFormButton() (+9 more)

### Community 16 - "Bot Package Manifest"
Cohesion: 0.07
Nodes (26): dependencies, discord.js, @msk-forms/db, @msk-forms/shared, devDependencies, tsx, typescript, vitest (+18 more)

### Community 17 - "Shared TypeScript Base Config"
Cohesion: 0.07
Nodes (26): .turbo, compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules (+18 more)

### Community 18 - "Web TypeScript Config"
Cohesion: 0.08
Nodes (25): compilerOptions, allowJs, declaration, declarationMap, incremental, jsx, lib, module (+17 more)

### Community 19 - "UI Package Manifest"
Cohesion: 0.08
Nodes (25): devDependencies, react, @types/react, @types/react-dom, typescript, vitest, exports, react (+17 more)

### Community 20 - "Public Page Widgets"
Cohesion: 0.13
Nodes (14): TERMINAL, CustomCss(), Countdown(), ExperimentView(), HubCategory, HubForm, HubLabels, LocalDateTime() (+6 more)

### Community 21 - "Form Renderer & Captcha"
Cohesion: 0.16
Nodes (21): FieldValue, Answers, FormLabels, FormRenderer(), isLayout(), TurnstileApi, TurnstileWidget(), Window (+13 more)

### Community 22 - "Branding & Logo API"
Cohesion: 0.20
Nodes (16): GET(), POST(), DELETE(), loadBranding(), POST(), DELETE(), RasterImage, sniffRasterImage() (+8 more)

### Community 23 - "API & Domain Dashboard Pages"
Cohesion: 0.23
Nodes (15): POST(), POST(), ApiPage(), DomainPage(), WebhooksPage(), startCheckout(), UpgradeActions(), ProNotice() (+7 more)

### Community 24 - "Form Builder Field Editor"
Cohesion: 0.20
Nodes (20): BuilderDict, FieldEditor(), FieldEditorProps, BUILDER_FIELDS, BUILDER_LAYOUT_TYPES, CHOICE_TYPES, fieldCarriesTypeData(), fieldTypeLabel() (+12 more)

### Community 25 - "Form Field Widgets"
Cohesion: 0.17
Nodes (16): DateFieldLabels, FieldInputProps, FileField(), FileFieldLabels, formatSize(), LayoutBlock(), MatrixField(), MatrixValue (+8 more)

### Community 26 - "Form Definition Schemas"
Cohesion: 0.12
Nodes (19): FormDefinition, formDefinitionSchema, AutomationCondition, automationConditionSchema, automationRuleSchema, experimentActive(), experimentSchema, ExperimentVariant (+11 more)

### Community 27 - "Web App Dependencies"
Cohesion: 0.10
Nodes (21): dependencies, @aws-sdk/client-s3, class-variance-authority, clsx, iron-session, @msk-forms/db, pdf-lib, @radix-ui/react-slot (+13 more)

### Community 28 - "Public Submit & Captcha"
Cohesion: 0.20
Nodes (15): buildPreview(), POST(), PREVIEW_LABELS, captchaEnabled(), captchaSiteKey(), ENV, verifyCaptcha(), decryptSecret() (+7 more)

### Community 29 - "Forms List & Access Roles"
Cohesion: 0.21
Nodes (15): FORM_STATUS_COLORS, GuildFormsPage(), ManageBillingButton(), isGlobalReviewerRole(), isManagerRole(), MANAGER_ROLES, manageScopeFromRole(), REVIEWER_ROLES (+7 more)

### Community 30 - "Form Spec & Validation"
Cohesion: 0.13
Nodes (19): FieldInput(), BOOLEAN_TYPES, buildFieldSchema(), conditionRuleSchema, FIELD_TYPES, fieldOptionSchema, fieldTypeSchema, fieldValidationSchema (+11 more)

### Community 31 - "Web Styling Toolchain"
Cohesion: 0.11
Nodes (19): devDependencies, autoprefixer, postcss, tailwindcss, tailwindcss-animate, @types/qrcode, @types/react, @types/react-dom (+11 more)

### Community 32 - "Client IP & Experiments"
Cohesion: 0.22
Nodes (11): POST(), GET(), clientIp(), isIpish(), experimentCookieName(), recordExperimentView(), rateLimit(), RateLimitResult (+3 more)

### Community 33 - "Member Role API"
Cohesion: 0.23
Nodes (14): ASSIGNABLE, AssignableRole, POST(), PUT(), ASSIGNABLE, AssignableRole, PATCH(), MembersPage() (+6 more)

### Community 34 - "Root Layout & Brand Shell"
Cohesion: 0.14
Nodes (14): DEFAULT_METADATA, inter, jetbrainsMono, RootLayout(), viewport, Wordmark(), ServiceWorkerRegister(), Column() (+6 more)

### Community 35 - "Shared Package Manifest"
Cohesion: 0.11
Nodes (18): dependencies, zod, devDependencies, typescript, vitest, exports, typescript, vitest (+10 more)

### Community 36 - "Custom CSS Preview"
Cohesion: 0.20
Nodes (12): PATCH(), CssPreview(), CssPreviewLabels, esc(), brandStyle(), hexToHslChannels(), accentColor, Branding (+4 more)

### Community 37 - "i18n Package Manifest"
Cohesion: 0.11
Nodes (17): devDependencies, typescript, vitest, exports, ./de, ./en, typescript, vitest (+9 more)

### Community 38 - "Auth & Locale Switching"
Cohesion: 0.21
Nodes (10): POST(), GET(), LanguageSwitcher(), LOCALES, LogoutButton(), HeaderUser, logoutAction(), getSession() (+2 more)

### Community 39 - "Submission Self-Service API"
Cohesion: 0.22
Nodes (11): GET(), DELETE(), GET(), POST(), GET(), authenticateApiKey(), generateApiKey(), hashApiKey() (+3 more)

### Community 40 - "Answer Formatting"
Cohesion: 0.15
Nodes (11): AnswerLabels, AnswerSummary(), formatAnswer(), SubmissionFile, field(), FILE_FIELD_TYPES, formatAnswerValue(), FormSpec (+3 more)

### Community 41 - "Public Form & Status Pages"
Cohesion: 0.34
Nodes (13): GET(), PublicFormPage(), generateMetadata(), manifest(), HomePage(), SubmissionStatusPage(), SiteHeader(), logoUrl() (+5 more)

### Community 42 - "Status Change & Guild Log"
Cohesion: 0.18
Nodes (11): POST(), TERMINAL, Db, enqueueGuildLog(), ChangeSubmissionStatusArgs, ChangeSubmissionStatusResult, messageFromMap(), notifySubmissionChange() (+3 more)

### Community 43 - "Categories & Status Editors"
Cohesion: 0.20
Nodes (9): CategoriesDict, CategoryListForm(), Row, slugifyKey(), StatusDefsForm(), StatusesDict, categoriesSchema, CategoryInput (+1 more)

### Community 44 - "Public Guild Hub & Schedule"
Cohesion: 0.19
Nodes (9): GuildFormsHub(), HubGuild, GuildHub(), getLiveFormsForGuild(), FormScheduleState, formScheduleStatus, h(), now (+1 more)

### Community 45 - "UI TypeScript Config"
Cohesion: 0.14
Nodes (13): compilerOptions, jsx, lib, outDir, rootDir, extends, include, DOM (+5 more)

### Community 46 - "Domain Verification"
Cohesion: 0.29
Nodes (9): lookupTxt(), POST(), DomainForm(), requestDomainSync(), CustomDomainInput, customDomainSchema, isValidDomain(), verificationRecordName() (+1 more)

### Community 47 - "Realtime TypeScript Config"
Cohesion: 0.17
Nodes (11): compilerOptions, lib, module, moduleResolution, outDir, rootDir, extends, include (+3 more)

### Community 48 - "Calculated Field Formula"
Cohesion: 0.33
Nodes (7): evaluateFormula(), parse(), referencedFieldIds(), referenceValue(), roundTo(), numFields, tokenize()

### Community 49 - "Submission Exports"
Cohesion: 0.33
Nodes (7): csvCell(), ExportFormat, FORMATS, GET(), SubmissionsTable, PAGE, submissionsPdf()

### Community 50 - "Plan Limits & Tiers"
Cohesion: 0.22
Nodes (8): GuildPlan, MEMBER_LIMITS, MONTHLY_SUBMISSION_LIMITS, PAID_TIERS, PaidTier, PlanTier, PRO_FEATURES, ProFeature

### Community 51 - "Locales & Status Definitions"
Cohesion: 0.28
Nodes (6): Locale, SUPPORTED_LOCALES, isTerminalStatus(), StatusDefInput, statusDefInputSchema, statusDefsSchema

### Community 52 - "Codeberg Mirror Workflow"
Cohesion: 0.29
Nodes (8): CODEBERG_TOKEN / CODEBERG_USER / CODEBERG_REPO secrets, Exact mirror semantics (force + prune), Fork guard (repository_owner == MSK-Scripts), Trigger restricted to main, tags, delete and manual dispatch, mirror job (Push to Codeberg), Mirror to Codeberg workflow, Delete refs/remotes/origin/HEAD before pushing, Serial mirror concurrency group

### Community 53 - "Web Package Scripts"
Cohesion: 0.25
Nodes (8): scripts, build, clean, dev, lint, start, test, typecheck

### Community 54 - "PWA Icon Generation"
Cohesion: 0.25
Nodes (6): BG, here, iconsDir, publicDir, source, TRANSPARENT

### Community 55 - "Guild Handle Routing"
Cohesion: 0.43
Nodes (6): HandleHubPage(), getGuildByHandle(), handleSchema, isReservedHandle(), normalizeHandle(), RESERVED_HANDLES

### Community 56 - "Date & Time Field"
Cohesion: 0.39
Nodes (7): DateField(), DateFieldMode, pad(), Parsed, parseValue(), sameDay(), toISO()

### Community 57 - "Phone Field & Countries"
Cohesion: 0.50
Nodes (6): PhoneField(), COUNTRIES, Country, flagOf(), formatPhone(), parsePhone()

### Community 58 - "DB TypeScript Config"
Cohesion: 0.25
Nodes (7): compilerOptions, outDir, rootDir, extends, include, src/**/*.ts, ../../tsconfig.base.json

### Community 59 - "i18n TypeScript Config"
Cohesion: 0.25
Nodes (7): compilerOptions, outDir, rootDir, extends, include, src/**/*.ts, ../../tsconfig.base.json

### Community 60 - "Shared TypeScript Config"
Cohesion: 0.25
Nodes (7): compilerOptions, outDir, rootDir, extends, include, src/**/*.ts, ../../tsconfig.base.json

### Community 61 - "Prettier Config"
Cohesion: 0.25
Nodes (7): plugins, printWidth, semi, singleQuote, tabWidth, trailingComma, prettier-plugin-tailwindcss

### Community 62 - "Bot TypeScript Config"
Cohesion: 0.29
Nodes (6): compilerOptions, noEmit, extends, include, src/**/*.ts, ../../tsconfig.base.json

### Community 63 - "Stripe Billing Webhook"
Cohesion: 0.52
Nodes (6): ACTIVE, customerId(), POST(), resolveGuildId(), tierForPrice(), webhookSecret()

### Community 64 - "Dashboard Layout & Tabs"
Cohesion: 0.48
Nodes (4): GuildLayout(), NavTab, NavTabs(), requireGuildMembership()

### Community 65 - "Realtime WebSocket Server"
Cohesion: 0.47
Nodes (5): ClientState, createServer(), listenForChanges(), PORT, verifyGuildToken()

### Community 66 - "Brand & PWA Icons"
Cohesion: 0.47
Nodes (6): Apple Touch Icon, PWA Icon 192, PWA Icon 512, PWA Maskable Icon 512, MSK Brand Identity (green M), MSK Logo (green M mark)

### Community 67 - "Standalone Asset Copy"
Cohesion: 0.40
Nodes (4): copySharp(), standaloneWeb, walkImgScope(), webRoot

### Community 68 - "Webhooks Manager UI"
Cohesion: 0.47
Nodes (5): eventLabel(), sourceLabel(), WebhookRow, WebhooksDict, WebhooksManager()

### Community 69 - "Web Package Metadata"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 70 - "pnpm Security Overrides"
Cohesion: 0.60
Nodes (5): allowBuilds allowlist for dependency build scripts, find-my-way override for pinned prisma dev dependency, minimatch lifted to 10 to collapse brace-expansion copies, Security overrides for transitive dependencies, sharp override lifting the optional next copy

### Community 71 - "Custom Domain Sync Script"
Cohesion: 0.50
Nodes (3): PGCONNECT_TIMEOUT, PGOPTIONS, sync-custom-domains.sh script

### Community 72 - "i18n Package Entry"
Cohesion: 0.50
Nodes (3): Locale, locales, messages

## Knowledge Gaps
- **501 isolated node(s):** `semi`, `singleQuote`, `trailingComma`, `printWidth`, `tabWidth` (+496 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GuildFormsPage()` connect `Forms List & Access Roles` to `Member Role API`, `Guild REST API Routes`, `Dashboard Settings Pages`, `Board & Bulk Actions`, `Public Guild Hub & Schedule`, `Custom Domain & Discord Helpers`, `qrcode Dependency`, `API & Domain Dashboard Pages`, `Form Definition Schemas`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Web App Dependencies` to `Web Package Metadata`, `exceljs Dependency`, `ioredis Dependency`, `Shared Package Link`, `UI Package Link`, `Next.js Dependency`, `next-themes Dependency`, `qrcode Dependency`, `react-dom Dependency`, `sharp Dependency`, `stripe Dependency`, `Tabler Icons Dependency`, `zustand Dependency`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `qrcode` connect `qrcode Dependency` to `Web App Dependencies`, `Forms List & Access Roles`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **What connects `semi`, `singleQuote`, `trailingComma` to the rest of the system?**
  _501 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Discord Bot Runtime` be split into smaller, more focused modules?**
  _Cohesion score 0.0560875512995896 - nodes in this community are weakly interconnected._
- **Should `Public Marketing Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.05516431924882629 - nodes in this community are weakly interconnected._
- **Should `Guild REST API Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.11688311688311688 - nodes in this community are weakly interconnected._