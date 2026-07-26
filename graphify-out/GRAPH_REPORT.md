# Graph Report - .  (2026-07-17)

## Corpus Check
- 337 files · ~148,684 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1507 nodes · 3704 edges · 95 communities (75 shown, 20 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.82)
- Token cost: 290,639 input · 0 output

## Community Hubs (Navigation)
- Billing & Guild API
- Discord Bot Core
- Web UI Pages & Cards
- Project Docs & Meta
- Root Package Dependencies
- i18n Dictionaries & Bot Config UI
- Review UI & Primitives
- Webhooks Delivery
- Guild Settings API Routes
- Export & API Keys
- DB Package Manifest
- Turborepo Config
- Realtime Package Manifest
- Form Builder Conditions
- Bot Package Manifest
- Base TS Config
- Dashboard Manager Components
- Form Spec & Fields
- Form Renderer & Conditions
- Web TS Config
- UI Package Manifest
- Submission Self-Service API
- Submit Pipeline & Captcha
- Forms Data & Edit Pages
- Web App Dependencies
- File Storage & Logo
- Branding & Status Pages
- Form Builder & Automations
- Form Field Inputs
- CSS Build Dependencies
- Custom Domain & OAuth
- Forms CRUD API
- Access Control
- Root Layout & Chrome
- Shared Package Manifest
- i18n Package Manifest
- Session & Language
- Members API
- Form Settings & Definition
- Discord OAuth
- Categories & Statuses UI
- Public Form Page & A/B
- Domain Verification
- Answer Summary Rendering
- Custom CSS Branding
- UI TS Config
- Guild Handle & Hub
- Realtime TS Config
- Public Hub & Countdown
- Plans & Limits
- Formula Engine
- Web Build Scripts
- PWA Icon Generation
- Date Field Component
- Phone & Countries
- DB TS Config
- i18n TS Config
- Status Defs & Locales
- Shared TS Config
- Prettier Config
- Bot TS Config
- Form Scheduling
- Realtime WS Server
- Brand Icons
- Standalone Asset Copy
- Web Package Metadata
- Domain Sync Script
- i18n Package Index
- Next Proxy & CSP
- DB Seed
- Next Config
- ExcelJS Dependency
- ioredis Dependency
- DB Workspace Dep
- Shared Workspace Dep
- UI Workspace Dep
- Next Dependency
- next-themes Dep
- React DOM Dep
- sharp Dependency
- Stripe Dependency
- Tabler Icons Dep
- Zustand Dependency
- Tailwind Config
- PM2 Ecosystem Config
- mod_md Message Script
- Funding Config
- Codeberg Mirror

## God Nodes (most connected - your core abstractions)
1. `getDict()` - 88 edges
2. `canManageForms()` - 77 edges
3. `getCurrentUser()` - 75 edges
4. `requireUser()` - 44 edges
5. `Card()` - 38 edges
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
- `Transitive Security Overrides` --semantically_similar_to--> `Dependabot Config`  [INFERRED] [semantically similar]
  pnpm-workspace.yaml → .github/dependabot.yml
- `FormBuilder()` --indirect_call--> `field()`  [INFERRED]
  apps/web/src/components/builder/form-builder.tsx → packages/shared/src/conditions.test.ts
- `DateField()` --indirect_call--> `h()`  [INFERRED]
  apps/web/src/components/form/date-field.tsx → packages/shared/src/schedule.test.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **CI/CD & Quality Pipeline** — _github_workflows_ci, _github_workflows_deploy, _github_workflows_codeql, readme_branch_workflow [EXTRACTED 0.90]
- **Local Dev Infrastructure Services** — docker_compose_postgres, docker_compose_redis, docker_compose_minio, docker_compose_infra [EXTRACTED 0.90]
- **Monorepo Apps & Packages** — readme_app_web, readme_app_bot, readme_app_realtime, readme_package_db, readme_package_shared, readme_package_ui, readme_package_i18n [EXTRACTED 0.90]

## Communities (95 total, 20 thin omitted)

### Community 0 - "Billing & Guild API"
Cohesion: 0.05
Nodes (76): ACTIVE, customerId(), POST(), resolveGuildId(), POST(), POST(), POST(), ApiPage() (+68 more)

### Community 1 - "Discord Bot Core"
Cohesion: 0.06
Nodes (71): commands, registerCommands(), assertConfig(), config, handleFormsAutocomplete(), handleFormsCommand(), liveForms(), LOCALE_NAMES (+63 more)

### Community 2 - "Web UI Pages & Cards"
Cohesion: 0.05
Nodes (46): metadata, OfflinePage(), Cell, metadata, PricingPage(), metadata, StatsPage(), ImprintPage() (+38 more)

### Community 3 - "Project Docs & Meta"
Cohesion: 0.05
Nodes (48): Dependabot Config, Tailwind v3 Major Pin, Bug Report Issue Template, Issue Template Config, Feature Request Issue Template, Pull Request Template, CI Workflow, CI Postgres 16 Service (+40 more)

### Community 4 - "Root Package Dependencies"
Cohesion: 0.04
Nodes (46): dotenv, eslint, @eslint/js, author, description, devDependencies, dotenv, eslint (+38 more)

### Community 5 - "i18n Dictionaries & Bot Config UI"
Cohesion: 0.10
Nodes (25): BotConfigForm(), BotDict, LOCALE_OPTIONS, BrandingDict, BrandingForm(), CSS_SNIPPETS, BrandingDict, LogoForm() (+17 more)

### Community 6 - "Review UI & Primitives"
Cohesion: 0.10
Nodes (21): ReviewDict, SubmissionAction, submissionActionSchema, ButtonProps, styles, Variant, CardProps, Checkbox() (+13 more)

### Community 7 - "Webhooks Delivery"
Cohesion: 0.08
Nodes (29): backoffMs(), deliverOne(), DeliveryRow, hydratePayload(), ThinPayload, AnswerValueLabels, buildDiscordWebhookBody(), DiscordWebhookBody (+21 more)

### Community 8 - "Guild Settings API Routes"
Cohesion: 0.18
Nodes (20): DELETE(), PATCH(), DELETE(), PATCH(), GET(), PUT(), PATCH(), DELETE() (+12 more)

### Community 9 - "Export & API Keys"
Cohesion: 0.12
Nodes (22): GET(), POST(), csvCell(), ExportFormat, FORMATS, GET(), GET(), DELETE() (+14 more)

### Community 10 - "DB Package Manifest"
Cohesion: 0.06
Nodes (31): dependencies, @prisma/adapter-pg, @prisma/client, devDependencies, pg, prisma, tsx, @types/pg (+23 more)

### Community 11 - "Turborepo Config"
Cohesion: 0.07
Nodes (29): ^build, coverage/**, .env, !.next/cache/**, NODE_ENV, dependsOn, outputs, cache (+21 more)

### Community 12 - "Realtime Package Manifest"
Cohesion: 0.07
Nodes (28): dependencies, pg, ws, devDependencies, tsx, @types/pg, @types/ws, typescript (+20 more)

### Community 13 - "Form Builder Conditions"
Cohesion: 0.15
Nodes (24): ACTIONS, CondDict, ConditionEditor(), NO_VALUE_OPS, BuilderDict, FieldEditor(), FieldEditorProps, BUILDER_FIELDS (+16 more)

### Community 14 - "Bot Package Manifest"
Cohesion: 0.07
Nodes (26): dependencies, discord.js, @msk-forms/db, @msk-forms/shared, devDependencies, tsx, typescript, vitest (+18 more)

### Community 15 - "Base TS Config"
Cohesion: 0.07
Nodes (26): .turbo, compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules (+18 more)

### Community 16 - "Dashboard Manager Components"
Cohesion: 0.13
Nodes (17): ApiDict, ApiKeysManager(), day(), ConfirmDialog(), DomainDict, FormAccess, MemberRow, MembersDict (+9 more)

### Community 17 - "Form Spec & Fields"
Cohesion: 0.10
Nodes (22): FieldInput(), BOOLEAN_TYPES, buildFieldSchema(), conditionRuleSchema, FIELD_TYPES, fieldOptionSchema, fieldTypeSchema, fieldValidationSchema (+14 more)

### Community 18 - "Form Renderer & Conditions"
Cohesion: 0.17
Nodes (21): Answers, FormLabels, FormRenderer(), isLayout(), LayoutBlock(), TurnstileApi, TurnstileWidget(), Window (+13 more)

### Community 19 - "Web TS Config"
Cohesion: 0.08
Nodes (25): compilerOptions, allowJs, declaration, declarationMap, incremental, jsx, lib, module (+17 more)

### Community 20 - "UI Package Manifest"
Cohesion: 0.08
Nodes (25): devDependencies, react, @types/react, @types/react-dom, typescript, vitest, exports, react (+17 more)

### Community 21 - "Submission Self-Service API"
Cohesion: 0.19
Nodes (14): POST(), GET(), DELETE(), POST(), TERMINAL, clientIp(), isIpish(), rateLimit() (+6 more)

### Community 22 - "Submit Pipeline & Captcha"
Cohesion: 0.16
Nodes (17): POST(), PREVIEW_LABELS, captchaEnabled(), captchaSiteKey(), ENV, verifyCaptcha(), recordExperimentConversion(), findActiveSubmissionId() (+9 more)

### Community 23 - "Forms Data & Edit Pages"
Cohesion: 0.22
Nodes (16): GET(), EditFormPage(), ExperimentResultsPage(), FormPreviewPage(), getFormForEdit(), getGuildCategories(), getLiveFormBySlug(), getStatusOptionsForGuild() (+8 more)

### Community 24 - "Web App Dependencies"
Cohesion: 0.10
Nodes (21): dependencies, @aws-sdk/client-s3, class-variance-authority, clsx, iron-session, pdf-lib, qrcode, @radix-ui/react-slot (+13 more)

### Community 25 - "File Storage & Logo"
Cohesion: 0.21
Nodes (15): GET(), DELETE(), loadBranding(), POST(), GET(), RasterImage, sniffRasterImage(), deleteObject() (+7 more)

### Community 26 - "Branding & Status Pages"
Cohesion: 0.21
Nodes (14): BrandingPage(), GuildsPage(), generateMetadata(), SubmissionStatusPage(), TERMINAL, GuildFormsHub(), PoweredBy(), StatusLive() (+6 more)

### Community 27 - "Form Builder & Automations"
Cohesion: 0.14
Nodes (16): AutomationsEditor(), BuilderDict, NO_VALUE_OPS, StatusOption, ExperimentDict, ExperimentEditor(), BuilderDict, FIELD_ICONS (+8 more)

### Community 28 - "Form Field Inputs"
Cohesion: 0.17
Nodes (15): DateFieldLabels, FieldInputProps, FieldValue, FileField(), FileFieldLabels, formatSize(), MatrixField(), MatrixValue (+7 more)

### Community 29 - "CSS Build Dependencies"
Cohesion: 0.11
Nodes (19): devDependencies, autoprefixer, postcss, tailwindcss, tailwindcss-animate, @types/qrcode, @types/react, @types/react-dom (+11 more)

### Community 30 - "Custom Domain & OAuth"
Cohesion: 0.27
Nodes (15): GET(), manifest(), HomePage(), SiteHeader(), DomainGuild, getGuildByDomain(), hostname(), isPrimaryHostname() (+7 more)

### Community 31 - "Forms CRUD API"
Cohesion: 0.23
Nodes (14): PATCH(), PATCH(), DELETE(), PATCH(), importBodySchema, POST(), slugVariant(), POST() (+6 more)

### Community 32 - "Access Control"
Cohesion: 0.22
Nodes (14): bodySchema, POST(), POST(), isGlobalReviewerRole(), isManagerRole(), MANAGER_ROLES, manageScopeFromRole(), REVIEWER_ROLES (+6 more)

### Community 33 - "Root Layout & Chrome"
Cohesion: 0.14
Nodes (14): DEFAULT_METADATA, inter, jetbrainsMono, RootLayout(), viewport, Wordmark(), ServiceWorkerRegister(), Column() (+6 more)

### Community 34 - "Shared Package Manifest"
Cohesion: 0.11
Nodes (18): dependencies, zod, devDependencies, typescript, vitest, exports, typescript, vitest (+10 more)

### Community 35 - "i18n Package Manifest"
Cohesion: 0.11
Nodes (17): devDependencies, typescript, vitest, exports, ./de, ./en, typescript, vitest (+9 more)

### Community 36 - "Session & Language"
Cohesion: 0.21
Nodes (10): POST(), GET(), LanguageSwitcher(), LOCALES, LogoutButton(), HeaderUser, logoutAction(), getSession() (+2 more)

### Community 37 - "Members API"
Cohesion: 0.24
Nodes (13): ASSIGNABLE, AssignableRole, POST(), PUT(), ASSIGNABLE, AssignableRole, PATCH(), MembersPage() (+5 more)

### Community 38 - "Form Settings & Definition"
Cohesion: 0.14
Nodes (14): AnswerMap, FormDefinition, formDefinitionSchema, AutomationCondition, automationConditionSchema, automationRuleSchema, experimentSchema, ExperimentVariant (+6 more)

### Community 39 - "Discord OAuth"
Cohesion: 0.24
Nodes (12): GET(), buildAuthorizeUrl(), discordAvatarUrl(), DiscordTokenResponse, DiscordUser, exchangeCode(), fetchDiscordUser(), mapLocale() (+4 more)

### Community 40 - "Categories & Statuses UI"
Cohesion: 0.19
Nodes (10): CategoriesDict, CategoryListForm(), Row, slugifyKey(), StatusDefsForm(), StatusesDict, categoriesSchema, CategoryInput (+2 more)

### Community 41 - "Public Form Page & A/B"
Cohesion: 0.26
Nodes (9): POST(), PublicFormPage(), ExperimentView(), decryptSecret(), experimentCookieName(), recordExperimentView(), getGuildCaptchaSecret(), getGuildCaptchaSiteKey() (+1 more)

### Community 42 - "Domain Verification"
Cohesion: 0.27
Nodes (10): DELETE(), lookupTxt(), POST(), DomainForm(), requestDomainSync(), CustomDomainInput, customDomainSchema, isValidDomain() (+2 more)

### Community 43 - "Answer Summary Rendering"
Cohesion: 0.21
Nodes (11): buildPreview(), AnswerLabels, AnswerSummary(), formatAnswer(), SubmissionFile, FILE_FIELD_TYPES, formatAnswerValue(), formSpecSchema (+3 more)

### Community 44 - "Custom CSS Branding"
Cohesion: 0.19
Nodes (10): CssPreview(), CssPreviewLabels, esc(), CustomCss(), accentColor, Branding, brandingColorSchema, brandingSchema (+2 more)

### Community 45 - "UI TS Config"
Cohesion: 0.14
Nodes (13): compilerOptions, jsx, lib, outDir, rootDir, extends, include, DOM (+5 more)

### Community 46 - "Guild Handle & Hub"
Cohesion: 0.26
Nodes (8): HandleHubPage(), GuildHub(), getGuildByHandle(), getLiveFormsForGuild(), handleSchema, isReservedHandle(), normalizeHandle(), RESERVED_HANDLES

### Community 47 - "Realtime TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, lib, module, moduleResolution, outDir, rootDir, extends, include (+3 more)

### Community 48 - "Public Hub & Countdown"
Cohesion: 0.24
Nodes (6): Countdown(), HubCategory, HubForm, HubGuild, HubLabels, LocalDateTime()

### Community 49 - "Plans & Limits"
Cohesion: 0.27
Nodes (8): GuildPlan, MEMBER_LIMITS, MONTHLY_SUBMISSION_LIMITS, PAID_TIERS, PaidTier, PlanTier, PRO_FEATURES, ProFeature

### Community 50 - "Formula Engine"
Cohesion: 0.33
Nodes (7): evaluateFormula(), parse(), referencedFieldIds(), referenceValue(), roundTo(), numFields, tokenize()

### Community 51 - "Web Build Scripts"
Cohesion: 0.25
Nodes (8): scripts, build, clean, dev, lint, start, test, typecheck

### Community 52 - "PWA Icon Generation"
Cohesion: 0.25
Nodes (6): BG, here, iconsDir, publicDir, source, TRANSPARENT

### Community 53 - "Date Field Component"
Cohesion: 0.39
Nodes (7): DateField(), DateFieldMode, pad(), Parsed, parseValue(), sameDay(), toISO()

### Community 54 - "Phone & Countries"
Cohesion: 0.50
Nodes (6): PhoneField(), COUNTRIES, Country, flagOf(), formatPhone(), parsePhone()

### Community 55 - "DB TS Config"
Cohesion: 0.25
Nodes (7): compilerOptions, outDir, rootDir, extends, include, src/**/*.ts, ../../tsconfig.base.json

### Community 56 - "i18n TS Config"
Cohesion: 0.25
Nodes (7): compilerOptions, outDir, rootDir, extends, include, src/**/*.ts, ../../tsconfig.base.json

### Community 57 - "Status Defs & Locales"
Cohesion: 0.32
Nodes (5): Locale, SUPPORTED_LOCALES, isTerminalStatus(), statusDefInputSchema, statusDefsSchema

### Community 58 - "Shared TS Config"
Cohesion: 0.25
Nodes (7): compilerOptions, outDir, rootDir, extends, include, src/**/*.ts, ../../tsconfig.base.json

### Community 59 - "Prettier Config"
Cohesion: 0.25
Nodes (7): plugins, printWidth, semi, singleQuote, tabWidth, trailingComma, prettier-plugin-tailwindcss

### Community 60 - "Bot TS Config"
Cohesion: 0.29
Nodes (6): compilerOptions, noEmit, extends, include, src/**/*.ts, ../../tsconfig.base.json

### Community 61 - "Form Scheduling"
Cohesion: 0.38
Nodes (5): FormScheduleState, formScheduleStatus, h(), now, toMs()

### Community 62 - "Realtime WS Server"
Cohesion: 0.47
Nodes (5): ClientState, createServer(), listenForChanges(), PORT, verifyGuildToken()

### Community 63 - "Brand Icons"
Cohesion: 0.47
Nodes (6): Apple Touch Icon, PWA Icon 192, PWA Icon 512, PWA Maskable Icon 512, MSK Brand Identity (green M), MSK Logo (green M mark)

### Community 64 - "Standalone Asset Copy"
Cohesion: 0.40
Nodes (4): copySharp(), standaloneWeb, walkImgScope(), webRoot

### Community 65 - "Web Package Metadata"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 66 - "Domain Sync Script"
Cohesion: 0.50
Nodes (3): PGCONNECT_TIMEOUT, PGOPTIONS, sync-custom-domains.sh script

### Community 67 - "i18n Package Index"
Cohesion: 0.50
Nodes (3): Locale, locales, messages

## Knowledge Gaps
- **498 isolated node(s):** `semi`, `singleQuote`, `trailingComma`, `printWidth`, `tabWidth` (+493 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GuildFormsPage()` connect `Billing & Guild API` to `Access Control`, `Members API`, `Guild Settings API Routes`, `Public Form Page & A/B`, `Forms Data & Edit Pages`, `Web App Dependencies`, `Form Scheduling`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Web App Dependencies` to `Web Package Metadata`, `ExcelJS Dependency`, `ioredis Dependency`, `DB Workspace Dep`, `Shared Workspace Dep`, `UI Workspace Dep`, `Next Dependency`, `next-themes Dep`, `React DOM Dep`, `sharp Dependency`, `Stripe Dependency`, `Tabler Icons Dep`, `Zustand Dependency`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `qrcode` connect `Web App Dependencies` to `Billing & Guild API`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **What connects `semi`, `singleQuote`, `trailingComma` to the rest of the system?**
  _498 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Billing & Guild API` be split into smaller, more focused modules?**
  _Cohesion score 0.050494159928122194 - nodes in this community are weakly interconnected._
- **Should `Discord Bot Core` be split into smaller, more focused modules?**
  _Cohesion score 0.05636114911080711 - nodes in this community are weakly interconnected._
- **Should `Web UI Pages & Cards` be split into smaller, more focused modules?**
  _Cohesion score 0.054385964912280704 - nodes in this community are weakly interconnected._