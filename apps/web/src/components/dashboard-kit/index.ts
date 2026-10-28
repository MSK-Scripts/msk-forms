/**
 * The dashboard kit: the shop's dashboard components (msk-shop
 * components/dashboard), adapted to MSK Forms. Cookie-based language instead
 * of /en and /de addresses, guilds instead of servers, copy from the `kit`
 * section of the dictionary in all seven languages, and every colour as a
 * utility of globals.css. Reach for these before writing markup of your own;
 * DESIGN.md says which one is for what.
 *
 * Kept apart from components/dashboard, which holds the MSK Forms features
 * (submissions table, live updates, form import). Two names exist twice on
 * purpose until the pages move over: `StatusBadge` (here for system states,
 * in @msk-forms/ui for a guild's coloured submission statuses) and
 * `ConfirmDialog` (here on the native <dialog>, the older one in
 * components/confirm-dialog.tsx).
 */
export { AppShell, type ShellAccount, type ShellCopy } from "./app-shell";
export { ConfirmDialog } from "./confirm-dialog";
export { CopyField, type CopyFieldCopy } from "./copy-field";
export { DataTable, type DataColumn } from "./data-table";
export { EmptyState, type EmptyKind } from "./empty-state";
export { FormField, FormSection, type FieldControlProps } from "./form-field";
export { GuildSwitcher, type GuildSwitcherCopy, type SwitcherGuild } from "./guild-switcher";
export { LanguageSelect } from "./language-select";
export { currentNavId, type ShellNavGroup, type ShellNavItem } from "./nav";
export { Notice, type NoticeTone } from "./notice";
export { PageHeader, type Breadcrumb } from "./page-header";
export { RowMenu, type RowMenuItem } from "./row-menu";
export { SaveBar, type SaveBarCopy } from "./save-bar";
export { SectionCard } from "./section-card";
export { sortRows, type SortDirection, type SortState } from "./sort-rows";
export { StatGrid, StatTile, type StatTrend } from "./stat-tile";
export { StatusBadge, type StatusTone } from "./status-badge";
export { ThemeSwitch, type ThemeSwitchLabels } from "./theme-switch";
