import type { MetadataRoute } from "next";

/**
 * robots.txt. Without this file `/robots.txt` reached the `[handle]` route
 * and answered 404. Public forms and guild hubs stay crawlable. Blocked are
 * the API, the dashboard behind the login, and `/s/`, the applicant's status
 * page with their own answers and data.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard", "/s/", "/offline"] }],
  };
}
