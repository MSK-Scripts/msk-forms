/**
 * Which areas of a guild's dashboard a member sees in the sidebar. Pure, so
 * the rule is pinned by a test (dashboard-nav.test.ts) without a database.
 *
 * This is the visibility of the navigation only. Every page and API route
 * checks again on the server (requireGuildMembership, canManageForms,
 * canReviewSubmissions and friends); hiding an entry here is a courtesy, the
 * page behind it is the gate.
 *
 * The rule, as it was in the tab row before the redesign:
 * - Forms: managers (owner, admin) and everyone who reviews at least one form.
 * - Submissions and Board: everyone who reviews at least one form, guild-wide
 *   (owner, admin, reviewer) or through a per-form grant.
 * - Everything else: managers only.
 * - Neither managing nor reviewing (a viewer without grants): no area, the
 *   page says the access is pending.
 */
import { isManagerRole, type ReviewScope } from "./access";

/** Every area of a guild, in the order of the sidebar. */
export const GUILD_AREAS = [
  "forms",
  "submissions",
  "board",
  "statuses",
  "messages",
  "categories",
  "branding",
  "domain",
  "bot",
  "members",
  "webhooks",
  "api",
  // Not "logs": the root .gitignore ignores every logs/ directory, so a page
  // there silently never gets committed (that happened once).
  "audit-log",
] as const;

export type GuildArea = (typeof GUILD_AREAS)[number];

export interface DashboardAccess {
  /** Owner or admin: manages the guild's forms and settings. */
  canManage: boolean;
  /** Reviews at least one form, guild-wide or through a per-form grant. */
  canReview: boolean;
}

/** The access the navigation follows, from the member's role and review scope (getReviewScope). */
export function dashboardAccess(role: string | null, reviewScope: ReviewScope): DashboardAccess {
  return {
    canManage: isManagerRole(role),
    canReview: reviewScope.all || reviewScope.formIds.length > 0,
  };
}

const REVIEW_AREAS: readonly GuildArea[] = ["submissions", "board"];

/** The areas the sidebar lists for this access, in sidebar order. */
export function visibleGuildAreas({ canManage, canReview }: DashboardAccess): GuildArea[] {
  return GUILD_AREAS.filter((area) => {
    if (area === "forms") return canManage || canReview;
    if (REVIEW_AREAS.includes(area)) return canReview;
    return canManage;
  });
}

/** Address of an area of a guild. */
export function guildAreaHref(guildId: string, area: GuildArea): string {
  return `/dashboard/${guildId}/${area}`;
}
