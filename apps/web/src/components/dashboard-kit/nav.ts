import type { IconComponent } from "@/components/icons";

export interface ShellNavItem {
  /** Stable id; the current item is matched on it or on the address. */
  id: string;
  /** Path inside the app, e.g. `/dashboard/123/forms`. */
  href: string;
  label: string;
  icon: IconComponent;
  /** Also in the bar at the bottom of a phone. At most four per dashboard. */
  mobile?: boolean;
  /**
   * Why the area is closed to this person ("Needs the Manager role"). The
   * entry stays in the list as text with a lock and the reason below it, and
   * is no link: locked areas stay visible and say what they need, in words.
   */
  locked?: string;
  /**
   * Current only on its own address, never for the pages below it: the list
   * of all servers at `/dashboard` must not light up inside every guild.
   */
  exact?: boolean;
}

export interface ShellNavGroup {
  id: string;
  /** Groups without a label come first and need none (Overview). */
  label?: string;
  items: ShellNavItem[];
}

/**
 * The item a path belongs to: the one whose address is the path, otherwise
 * the one with the longest address the path lies below, so
 * `/dashboard/1/forms/9/edit` still marks "Forms". Locked items never match,
 * and an `exact` item matches its own address only.
 */
export function currentNavId(nav: readonly ShellNavGroup[], pathname: string): string | undefined {
  const items = nav.flatMap((group) => group.items).filter((item) => !item.locked);
  const exact = items.find((item) => item.href === pathname);
  if (exact) return exact.id;
  return items
    .filter((item) => !item.exact && pathname.startsWith(item.href.endsWith("/") ? item.href : `${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.id;
}
