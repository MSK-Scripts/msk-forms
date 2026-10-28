---
name: MSK Forms
description: A dashboard first. The design system of msk-scripts.de, applied to a form and application builder whose public pages wear each customer's colour.
colors:
  ground: "#f6f6f4"
  ground-dark: "#18191b"
  card: "#ffffff"
  card-dark: "#212225"
  tile: "#ededea"
  tile-dark: "#111214"
  text: "#1c1d1f"
  text-dark: "#ececea"
  muted-text: "#5a5d61"
  muted-text-dark: "#a7a9ad"
  hairline: "#dcdcd8"
  hairline-dark: "#313337"
  control-border: "#84878b"
  control-border-dark: "#6d7075"
  msk-green: "#27762e"
  msk-green-dark: "#6dbb3d"
  msk-green-hover: "#1d5e23"
  msk-green-hover-dark: "#84c660"
  soft-green: "#e8ede6"
  soft-green-dark: "#202720"
  band: "#26282b"
  band-text: "#f2f2f0"
  band-green: "#7cc04b"
  warning: "#8f4e08"
  warning-dark: "#e2a457"
  danger: "#b3261e"
  danger-dark: "#f28b80"
  info: "#0b5d94"
  info-dark: "#72b6e6"
typography:
  display:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.2rem + 2.4vw, 5rem)"
    fontWeight: 750
    lineHeight: 1.06
  h3:
    fontFamily: "Archivo Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.05rem + 0.45vw, 1.75rem)"
    fontWeight: 650
  body:
    fontFamily: "Source Sans 3 Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.0625rem, 0.9rem + 0.2vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Source Sans 3 Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(0.8125rem, 0.75rem + 0.08vw, 0.9375rem)"
    fontWeight: 600
    letterSpacing: "0.08em"
    textTransform: uppercase
rounded:
  sm: "calc(var(--radius) - 6px), 4px by default"
  md: "calc(var(--radius) - 4px), 6px by default"
  lg: "var(--radius), 10px by default"
  xl: "calc(var(--radius) + 6px), 16px by default"
---

# Design System: MSK Forms

How forms.msk-scripts.de looks and behaves. MSK Forms uses the design system of the MSK
Scripts shop (msk-scripts.de) and, because it is mostly a dashboard, the shop's dashboard
style in particular. The values live in
[`apps/web/src/app/globals.css`](apps/web/src/app/globals.css); this file says what they
are for and what is particular to MSK Forms: the dashboard comes first, the public pages
wear the customer's colour, and every word exists in seven languages.

## Principles

**"A dashboard first."** Most of the time someone here works through submissions, edits a
form or sets up their server. The app is quiet, dense where the work is tabular and
readable everywhere; the public pages and the marketing pages are the exceptions with
rules of their own (below).

- **Structure before looks.** A good-looking page is forgiven small faults, not large ones.
- **One accent.** Anthracite and white carry the page, MSK green marks the brand and what can
  be acted on. On a customer's public page the customer's colour takes that role.
- **Fewer boxes.** Groups come from spacing and hairlines, not frames. Cards are for things
  that are clicked or hold a task of their own.
- **Fluid, not stepped.** Type, spacing, gutter and column grow with the window through
  `clamp()` up to UWQHD; components follow their container, not the screen.
- **Both themes are equal.** Light is the default ground, dark is a palette of its own, the
  system setting decides (`next-themes`, `defaultTheme="system"`). Every pair is computed,
  not judged by eye.
- **The CSP is a design constraint.** Scripts run under a nonce (`apps/web/src/proxy.ts`).
  Styles may be inline because customers bring custom CSS, but nothing injects a `<style>`
  element or a script at runtime: fonts are local, dialogs and menus are native elements,
  charts are hand-written SVG, and no UI library that styles itself comes in.
- **The customer's page is the customer's.** Public pages take the customer's colour and
  custom CSS. Our craft (type, spacing, controls, contrast) stays; our green does not
  insist.

## Exclusion list

Binding for the whole app (decided for msk-scripts.de on 27.10.2026 and taken over here):

- Inter and JetBrains Mono, not even as a fallback in a token.
- The GitHub dark palette (`#0d1117`, `#161a20`, `#1f242c`, `#e6edf3`, `#8b949e`).
- Terminal mockups, a "release log" in terminal style, `>_` icons.
- Green monospace eyebrows with a leading dash.
- Lucide as the icon set.
- Rows of three or four equal cards with icon, title and two lines of text.
- Countdowns as pressure, artificial scarcity, prompts on entering the page. (A customer's
  own opening countdown on a scheduled form is their content, not ours.)
- Em dashes in visible copy, in any of the seven languages.

## Colour

### Two layers

1. **Source tokens**, in `@layer base` of `globals.css`: shadcn-style names holding bare HSL
   channels, light in `:root`, dark in `.dark`.

   ```css
   --primary: 125.3 50.3% 30.8%;
   ```

   These names and this format are a **public API** (see Customer branding) and stay as
   they are. The values are the shop's hex colours converted to channels with one decimal;
   each converts back to the shop's hex exactly.

2. **Utilities**, in `@theme inline`: `--color-primary: hsl(var(--primary))` and friends.
   `inline` makes every utility carry the expression itself, so `bg-primary` resolves
   `--primary` on the element that uses it and follows any override on a wrapper.

**Rule:** code names the utility (`bg-primary`, `text-muted-foreground`, `border-input`,
`bg-success/8`), and plain CSS writes `hsl(var(--primary))`. Never `var(--color-primary)`:
that variable is computed once on `:root` and ignores a customer's colour. A test fails when
source code reads a `--color-*` variable (`apps/web/src/test/branding-contract.test.ts`).
The shop writes `bg-[var(--color-…)]`; markup ported from there is rewritten to utilities.

### Tokens

| Utility | Source token | Light | Dark | Role |
|---|---|---|---|---|
| `background` | `--background` | `#f6f6f4` | `#18191b` | The ground of every page |
| `card`, `card-foreground` | `--card`, `--card-foreground` | `#ffffff`, `#1c1d1f` | `#212225`, `#ececea` | Cards, dialogs, fields, the top bar, the sidebar |
| `popover`, `popover-foreground` | same names | as card | as card | Dropdowns of the existing pages |
| `muted` | `--muted` | `#ededea` | `#111214` | The tile: table heads, notices, ghost hover |
| `foreground` | `--foreground` | `#1c1d1f` | `#ececea` | Text |
| `muted-foreground` | `--muted-foreground` | `#5a5d61` | `#a7a9ad` | Secondary text, hints, placeholders |
| `accent`, `accent-foreground` | same names | as tile and text | as tile and text | shadcn's hover surface, kept for the existing pages |
| `secondary`, `secondary-foreground` | same names | `#ededea`, `#1c1d1f` | `#2a2b2e`, `#ececea` | Grey secondary button |
| `border` | `--border` | `#dcdcd8` | `#313337` | Hairlines and dividers, never text |
| `input` | `--input` | `#84878b` | `#6d7075` | Border of fields, outline buttons, radio cards (3:1) |
| `ring` | `--ring` | `#27762e` | `#6dbb3d` | The focus outline |
| `primary` | `--primary` | `#27762e` | `#6dbb3d` | MSK green: links, primary fill, current item |
| `primary-foreground` | `--primary-foreground` | `#ffffff` | `#0e150e` | Label on the green fill |
| `primary-hover` | derived | `#1d5e23` | `#84c660` | Hovered fill and hovered link: `--primary` 85 % toward `--primary-hover-toward` (black in light, white in dark) |
| `accent-soft` | derived | `#e8ede6` | `#202720` | Soft green surface: current nav item, chosen radio card, tags. `--primary` at `--accent-soft-amount` (7 % light, 10 % dark) over the ground |
| `success` | `--success` | `#27762e` | `#6dbb3d` | Status: done, live |
| `warning` | `--warning` | `#8f4e08` | `#e2a457` | Status: attention, pending |
| `danger`, `danger-foreground` | `--destructive`, `--destructive-foreground` | `#b3261e`, `#ffffff` | `#f28b80`, `#18191b` | Status: error; fill of the destructive button. `destructive` is the same colour under its shadcn name |
| `info` | `--info` | `#0b5d94` | `#72b6e6` | Status: information |
| `discord` | `--discord` | `#5865f2` | same | Fill of Discord actions, the Discord mark |
| `band`, `band-foreground`, `band-muted`, `band-line` | same names | `#26282b`, `#f2f2f0`, `#adb0b4`, `#3b3e42` | same | Anthracite band of the marketing pages and the footer |
| `band-accent`, `band-accent-foreground` | same names | `#7cc04b`, `#101710` | same | Green on the band and the label on it |
| `brand`, `brand-foreground`, `brand-muted` | same names | `#27762e`, `#ffffff`, `#eaf4e6` | same | The 4 px stripe above the top bar, the green band |
| `brand-button`, `brand-button-foreground` | same names | `#ffffff`, `#1d5e23` | same | The white button in the green band |
| `chart-1` to `chart-5` | same names | green, blue, amber, rose, violet | lighter steps | Chart series; each label reaches 4.5:1 on the tile and a card |

The bands keep their colours in both themes. On the anthracite band the page green measures
about 2.3:1, so the band has its own green and `.surface-band` turns the focus ring and the
kicker to it; `.surface-brand` turns the ring white.

### Where green belongs

In the dashboard and on the marketing pages MSK green is visibly the brand, in fixed places:

- the 4 px stripe above the top bar (`border-t-brand`) and the green band before the footer
  of the marketing pages (`.surface-brand`);
- the kicker above headings (`.kicker`);
- everything that can be clicked: text links, the primary button, the current navigation
  item;
- check marks, tags and anything selected (`accent-soft` with green text).

Status colours appear in the dashboard only, and never alone: a word and a sign always go
with them (`StatusBadge`, `Notice`). Red fills belong to confirmation dialogs.

### Contrast

WCAG 2.2 AA is the floor in both themes: 4.5:1 for text, 3:1 for control borders, focus
rings and signs that carry meaning.
[`apps/web/src/test/contrast.test.ts`](apps/web/src/test/contrast.test.ts) reads the source
tokens and the `@theme inline` expressions from `globals.css`, resolves the derived shades
(oklab mixes) and the opacity tints (`bg-primary/10`), and recomputes every pair that is
rendered, per theme. Coverage tests fail when a colour utility has no pair or a source token
has no utility, so a new colour cannot ship untested. Only `border` and `band-line` are
exempt, they are hairlines.

## Customer branding

Public pages (`/f/[slug]`, `/s/[id]`, `/g/[guildId]`, `/[handle]`, verified custom domains,
the offline page) belong to the customer.

### The contract

These must keep working, whatever the redesign does:

- **Names and format.** The source tokens keep their shadcn names (`--background`,
  `--foreground`, `--card`, `--card-foreground`, `--popover`, `--primary`,
  `--primary-foreground`, `--secondary`, `--muted`, `--muted-foreground`, `--accent`,
  `--destructive`, `--border`, `--input`, `--ring`, `--chart-1` to `--chart-5`, `--radius`)
  and hold bare HSL channels, so custom CSS can write `hsl(var(--primary) / 0.05)`.
- **The wrapper.** `brandStyle` in [`apps/web/src/lib/branding.ts`](apps/web/src/lib/branding.ts)
  sets `--primary`, `--primary-foreground` and `--ring` as channels on the page's wrapper.
  Pro customers write custom CSS against the `.msk-form` wrapper class and these variables
  (the Quick Styles in `components/branding/branding-form.tsx`).
- **Everything accent-coloured follows.** Because the utilities are `@theme inline` and the
  hover fill and soft surface are mixed from `--primary`, a wrapper that sets `--primary`
  recolours fills, text, borders, rings, hover states and soft surfaces inside it. Setting
  `--radius` scales every radius. `branding-contract.test.ts` compiles `globals.css` with
  Tailwind and checks the emitted rules.
- **The label.** The accent is the same in both themes, so its label cannot be the theme's
  (white in light, near black in dark). `brandVariables` picks white or `#0e150e`, whichever
  has the higher contrast with the customer's colour.
- **The preview.** The custom CSS preview renders in a sandboxed iframe with its own copy of
  the base tokens (`components/branding/css-preview-base.ts`) and the same variables as
  `brandStyle`. `css-preview-sync.test.ts` fails when the copy drifts from `globals.css`.

What does **not** follow the customer: status colours, the bands, the brand stripe and the
dashboard itself, which is always MSK.

### Craft from the shop, colour from the customer

The public pages take the shop's type, spacing, controls and focus style, and the customer's
colour; MSK green is only the default for a guild without one. A customer colour that fails
its contrast pairs in a theme (yellow as link text on white, navy on the dark ground) gets a
readable fallback accent for that theme instead of an unreadable page. The fallback is
planned for phase 2 of the redesign; today `brandStyle` only chooses the label.

## Typography

| Role | Size (phone to UWQHD) | Font | Utility |
|---|---|---|---|
| Display (H1 of marketing pages) | `clamp(2.25rem, 1.2rem + 2.4vw, 5rem)`, line height 1.06 | Archivo 750, tracking -0.02em | `text-display` |
| H2 | `clamp(1.75rem, 1.2rem + 1.1vw, 3rem)` | Archivo 700 | `text-h2` |
| H3, section and card heads | `clamp(1.25rem, 1.05rem + 0.45vw, 1.75rem)` | Archivo 650 | `text-h3` |
| Name (a form, a product) | `clamp(1.375rem, 1.1rem + 0.55vw, 2rem)`, width axis 112 % | Archivo 750 | `text-product [font-stretch:112%]` |
| Lead | `clamp(1.1875rem, 1rem + 0.35vw, 1.5rem)` | Source Sans 3 400 | `text-lead` |
| Body | `clamp(1.0625rem, 0.9rem + 0.2vw, 1.25rem)`, line height 1.6 | Source Sans 3 400 | `text-body` (the body default) |
| Small | `clamp(0.9375rem, 0.85rem + 0.12vw, 1.0625rem)` | Source Sans 3 400 | `text-small` |
| Label | `clamp(0.8125rem, 0.75rem + 0.08vw, 0.9375rem)`, uppercase, 0.08em | Source Sans 3 600 | `text-label` |

Dashboard page titles use `clamp(1.625rem, 1.3rem + 0.9vw, 2.5rem)` (`PageHeader`), figures
in stat tiles `clamp(1.5rem, 1.25rem + 0.7vw, 2.25rem)`.

- **Fonts:** Archivo (`font-display`) for headings and names, Source Sans 3 (`font-sans`) for
  everything else, both variable and loaded locally through `@fontsource-variable` in
  `apps/web/src/app/layout.tsx`, like the shop. Nothing is fetched from Google, neither at
  build time nor in the browser; `next/font/google` is not used. Code, keys, ids and the
  custom CSS editor use the system monospace (`font-mono`), no web font. `font-heading` is
  the old name of the display face and goes when its last use goes.
- **Zoom:** every maximum is at most 2.5 times its minimum, so browser zoom reaches 200 %
  (WCAG 1.4.4).
- **Measure:** running text stays under 65 characters per line, also on UWQHD
  (`max-w-[65ch]`). The legal pages are the one exception (82rem at 1.125rem, line height
  1.75, `.legal-content`), as in the shop.
- Headings start with their most telling words and are balanced (`text-wrap: balance`).
- Counts, scores and table figures use `tabular-nums`.
- Monospace marks what a machine reads or writes. It never makes prose look technical.
- `cn` (`apps/web/src/lib/utils.ts`) knows the custom sizes, so `text-lead` does not swallow a
  text colour when classes are merged.

## Layout

| Token | Value | Use |
|---|---|---|
| `--app-topbar` | `clamp(3.5rem, 3.1rem + 0.6vw, 4.25rem)` | Top bar of the app shell, plus its 4 px stripe |
| `--app-sidebar` | `clamp(16.5rem, 14rem + 3vw, 21rem)` | Sidebar width from 1024 px |
| `--app-gutter`, `--app-gutter-y` | `clamp(1rem, …, 3rem)`, `clamp(1.25rem, …, 2.75rem)` | Side and vertical padding of the dashboard content |
| `--app-content` | `130rem` | Content cap of the dashboard, so a table row stays readable on UWQHD |
| `--app-tabbar` | `3.75rem` | Bottom tab bar on a phone |
| `--page-column`, `--page-gutter` | `clamp(72rem, 84vw, 180rem)`, `clamp(1rem, 4vw, 7.5rem)` | Column and gutter of the public and marketing pages (`container-page`) |
| `--header-height` | `clamp(3.75rem, 3rem + 1vw, 5rem)` | Header bar of the public site |
| `--space-section`, `--space-stack` | fluid | Rhythm between and inside sections |
| `--grid-card`, `--grid-card-wide` | `clamp(18rem, …, 30rem)`, `clamp(20.5rem, …, 32.5rem)` | Card minimum of card grids |

- **Dashboard first.** The dashboard runs in the `AppShell`: top bar, sidebar with the guild
  switcher and labelled groups, content capped at `--app-content`. It is denser than the
  public pages: smaller top bar and gutters, `sm` buttons in tables.
- **Card grids** are `grid-cols-[repeat(auto-fill,minmax(min(100%,var(--grid-card)),1fr))]`:
  extra width buys bigger cards first and more columns second.
- **Container queries first.** Components that sit in more than one place are `@container`
  and switch on their own width (`@md:` to `@7xl:`). The shell's content column is a
  container, so a page lays out by the room it has, with or without the sidebar.
- **Viewport breakpoints in use:** `md` (768 px) for spacing steps, `lg` (1024 px) for the
  sidebar (below it a drawer and the bottom tab bar), `xl` (1280 px) for the desktop
  navigation of the public header.
- **No sideways scrolling** down to 320 px (WCAG 1.4.10). Wide tables scroll in their own
  focusable container (`DataTable`).

## Surface and shape

- **Radii follow `--radius`** (10 px): `rounded-sm` 4 px for tags and status badges,
  `rounded-md` 6 px for buttons, fields and radio cards, `rounded-lg` 10 px for cards and
  dialogs, `rounded-xl` 16 px for the few large surfaces. A customer's `--radius` scales all
  of them. Buttons and tags are never pills; round shapes are kept for dots, avatars and bars.
- **Borders:** hairlines are 1 px `border-border`. Controls carry 1.5 px `border-input`, which
  reaches 3:1. Emphasis is a colour change of the border, not a thicker one.
- **Shadow answers a pointer.** At rest a card has a seam (`shadow-[var(--shadow-card)]`); a
  clickable card (`Card hoverLift`) takes `--shadow-card-hover` and a green border on hover
  and does not move. Write the arbitrary form: the `shadow-card` utility carries the light
  value in both themes.
- **Bands:** `.surface-band` (anthracite) for the heads of the marketing pages and the footer,
  `.surface-brand` (green) for a closing band.

## Components

Reach for these before writing markup of your own.

### Base (`apps/web/src/components/ui`)

| Component | Use it for |
|---|---|
| `Button` | Every button and button-styled link (`asChild`). Variants: `primary` (one main action per area), `outline` (second), `link` (third), `ghost` (quiet icon and toolbar actions), `secondary` (beside a primary where both are a real choice), `danger` (confirming a destructive action), `discord`, `band` and `band-outline`. Sizes `sm` (36 px, tables), `md` and `lg` (44 px and up), `icon` (40 px plus the 44 px `tap-target`). Heights are minimums, so a long label wraps. `default` and `destructive` are old names, kept for the existing pages. |
| `Card` | A surface for something clicked or a task of its own; `hoverLift` for clickable ones. |
| `Badge` | A tag: category, plan, feature. Not for states. |
| `Input`, `Select`, `fieldClassName` | Text fields, textareas and native selects: 16 px text or more, 3:1 border, red border once `aria-invalid`. |
| `RadioCard` | A choice between variants: a native radio covering the whole card. |
| `Dialog` | Modal dialog on the native `<dialog>`. |
| `Skeleton` | Placeholder while data loads. |

File names are lowercase (`button.tsx`); never change the casing of an existing file, NTFS
and TypeScript disagree about it (TS1261).

### Dashboard kit (`apps/web/src/components/dashboard-kit`)

The shop's dashboard components, adapted to MSK Forms: paths without a language prefix,
guilds instead of servers, copy from the `kit` section of the dictionary.

| Component | Use it for |
|---|---|
| `AppShell` | The frame of the dashboard: top bar with the green stripe, labelled sidebar groups, drawer below 1024 px, bottom tab bar for up to four areas, theme and language at the foot of the sidebar, sign-out as a form posting the Server Action. Renders the one `<main id="main">`. The current item is the deepest one the address lies below. |
| `GuildSwitcher` | Choosing among the guilds the person is a member of, at the top of the sidebar: Discord icon, else the guild's logo, else its initial. A plain link; the page checks membership again. |
| `PageHeader` | Title, at most one primary action, a status, breadcrumbs below the sidebar level. |
| `SectionCard` | A labelled section of a page with its own actions. |
| `StatTile`, `StatGrid` | One figure per tile, a trend only with arrow, colour and words. |
| `DataTable` | Tables: caption, sortable headers with `aria-sort`, own scroll container, empty row. |
| `RowMenu` | The overflow actions of a table row, on the native popover. |
| `StatusBadge` | The state of a system object (live, draft, pending), always word plus sign. A guild's own submission statuses with their custom colours keep `StatusBadge` from `@msk-forms/ui`. |
| `Notice` | A message inside a page: tone bar, sign and title in the tone colour, body in text colour. |
| `EmptyState` | Never a blank list: first use, no results, error or unavailable, each with one next step. |
| `FormField`, `FormSection` | Label, hint, field and error wired together; groups with the explanation beside the fields where there is room. |
| `SaveBar` | Save and Discard while a settings page holds changes. |
| `ConfirmDialog` | Asking before serious consequences only; buttons name the consequence, irreversible ones ask to type the name. Replaces `components/confirm-dialog.tsx`. |
| `CopyField` | A value to copy (form link, webhook secret, DNS record) that stays selectable text. |
| `ThemeSwitch`, `LanguageSelect` | System, light or dark as three toggle buttons; the language as a native select that writes the `NEXT_LOCALE` cookie. |

`components/dashboard` holds MSK Forms features (submissions table, live updates, form
import), not building blocks.

### Public form controls (`packages/ui`)

`@msk-forms/ui` renders the fields of a public form (`Field`, `Input`, `Textarea`, `Select`,
`Checkbox`, `RadioGroup`, `CheckboxGroup`) and the coloured submission status. It uses the
same utilities, so it follows the tokens and the customer's colour.

**Charts** are hand-written SVG: a chart library would inject styles at runtime. One scale
per chart; the SVG is `aria-hidden`, a sentence says what it shows and a table behind a
native `<details>` holds every value.

## Icons

- **One set:** Phosphor (`@phosphor-icons/react`), regular weight, imported only from
  [`apps/web/src/components/icons`](apps/web/src/components/icons/index.tsx), which uses the
  SSR build so the same import works in server and client components. Status signs use
  `weight="bold"`.
- **Decorative by default:** every icon renders `aria-hidden` and not focusable. Give it an
  `aria-label` or `aria-labelledby` and it is announced instead. An icon-only button carries
  its name on the button.
- **Sizes:** `h-4 w-4` beside small text, `h-5 w-5` beside body text and in notices.
- **Brand marks** (Discord, GitHub) are local SVG in their original shape.
- The module lists only icons something imports. Tabler (`@tabler/icons-react`) is still in
  the existing pages and leaves with the last of them; new code never imports it.

## Motion

- Motion answers an action: colour and border transitions of 150 ms on controls and cards,
  200 ms for fades and the theme colours. Nothing moves on its own.
- The one ambient animation is the pulsing dot of a live indicator (`.pulse-dot`);
  `Skeleton` pulses while data loads.
- `prefers-reduced-motion: reduce` cuts every animation and transition to 0.01 ms and turns
  smooth scrolling off. Switching the theme disables transitions for that moment
  (`disableTransitionOnChange`).

## Accessibility

- **Skip link** as the first element, to the one `<main id="main">` (`.skip-link`, rendered
  once the pages sit in the `AppShell`).
- **Focus** is a 3 px outline in `ring` with 2 px offset on `:focus-visible`, adjusted on
  both bands; on a public page it takes the customer's `--ring`. `scroll-padding-top` keeps a
  focused element clear of a sticky header (WCAG 2.4.11).
- **Targets** are at least 44 px: buttons through their minimum height, small controls
  through `tap-target`, which extends the hit area without growing the box. Inside a dense
  table 36 px is allowed.
- **Native first:** real radio buttons, native `<select>`, `<dialog>` and popover. Fewer
  scripts, nothing the CSP has to allow, and the browser's own keyboard handling.
- **Forms:** labels above the field, never a placeholder as label; hint and error tied to
  the field through `aria-describedby`, `aria-invalid` on error, what was typed is kept.
- **Never colour alone:** states carry a word and a sign, trends an arrow and words, chart
  values their figure.
- **Tables** have a caption and scroll in themselves; sort order is announced through
  `aria-sort`.
- **Language:** `<html lang>` follows the chosen language; guild names carry
  `translate="no"`.
- **System settings:** `prefers-reduced-motion` stops transitions and animations;
  `prefers-contrast: more` raises muted text and lines to full strength; under
  `forced-colors` controls get a system border, focus the system highlight, and `RadioCard`
  keeps its choice visible. Guarded by `apps/web/src/test/system-preferences.test.ts`.

## Seven languages

- English, German, Hungarian, French, Spanish, Portuguese and Polish
  (`apps/web/src/i18n/dictionaries.ts`; `Dictionary = typeof en` makes every language
  complete). Every new visible string, `aria-label` included, goes into all seven.
- Addresses carry no language. The choice is the `NEXT_LOCALE` cookie, read on the server by
  `getLocale()`; switching writes it and refreshes (`i18n/locale-options.ts`). Server
  components read the dictionary with `getDict()` and hand strings to client components as
  props; the kit's copy is the `kit` section.
- Languages differ in length: German, Hungarian and Polish labels run long. Controls have
  minimum heights and wrap rather than cut; sidebar labels truncate with the full text in
  the page title.
- Guild names, form names and slash commands are not translated. No em dashes in any
  language (`kit-copy.test.ts` checks every dictionary). French keeps its space before `?`
  and `:`.

## Redesign status

The move to this system runs in four phases.

| Phase | Scope | State |
|---|---|---|
| 1 | Foundation: tokens, fonts, Phosphor barrel, base components, dashboard kit, contrast and branding tests, this file | Done |
| 2 | Marketing pages (landing, pricing, stats, legal) as part of msk-scripts.de; public form pages with the shop's craft and the customer's colour, including the fallback accent | Planned |
| 3 | The dashboard pages on the `AppShell` and the kit | Planned |
| 4 | Clean-up: Tabler out, legacy utilities and old components out | Planned |

Still in place until their pages are restyled: the `container` utility (1180 px column),
`.eyebrow` (on the exclusion list), `.hero-decor-gradient`, the `font-heading` name,
`components/confirm-dialog.tsx`, per-component focus rings (`focus-visible:ring-2`) instead
of the global outline, the Tabler icons, hard-coded old greens (`#4ea426`,
`#5eb131`) as defaults in the branding form, the category form and the forms list, and an em dash
(U+2014) as the placeholder for an empty value in a few tables and fields.

## Adding a colour

1. Ask first whether an existing token fits; most new needs are a role of `primary`, a
   status colour or `muted-foreground`.
2. Add the source token as HSL channels in `:root` and, if the dark theme needs a different
   value, in `.dark` of `globals.css`. Name it after its role, not its hue. Then add the
   utility to `@theme inline` as `--color-name: hsl(var(--name))`.
3. Choose the value by computing, not by eye: lightness until the pair passes with a little
   margin (about 4.6:1 for text). A green follows the logo ramp of the shop (see the shop's
   DESIGN.md).
4. Add every rendered pair to `PAIRS` in `apps/web/src/test/contrast.test.ts`. The coverage
   tests fail until the utility appears in one.
5. A source token is public from the day it ships: customers may use it in custom CSS, so it
   is never renamed later.
6. Add a row to the token table above.

## Adding an icon

1. Find it in Phosphor (regular weight) and add `Name as NameBase` to the import in
   `apps/web/src/components/icons/index.tsx`, in alphabetical order.
2. Add `export const Name = decorative(NameBase)` to the export list.
3. Import it from `@/components/icons`, never from the package directly.
4. When the last import of an icon goes, remove it from the module too.
