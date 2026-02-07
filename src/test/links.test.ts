import { describe, it, expect } from "vitest";
import { ROUTES } from "./routes.test";

/**
 * All internal paths used in the app (Link to= or href= to same origin).
 * Must be a subset of or equal to ROUTES so every link has a target.
 */
const INTERNAL_PATHS_USED = new Set([
  "/",
  "/programs",
  "/culture",
  "/recipes",
  "/terms",
  "/legal",
  "/privacy",
  "/faq",
  "/health",
  "/health-safety",
  "/emergency",
  "/settings",
  "/learn/glossary",
  "/learn/hadith",
  "/guides",
  "/dashboard",
  "/dashboard/today",
  "/dashboard/schedule",
  "/dashboard/prayers",
  "/dashboard/meals",
  "/dashboard/learn",
  "/dashboard/progress",
  "/dashboard/culture",
  "/dashboard/health",
  "/dashboard/journal",
  "/dashboard/goals",
  "/dashboard/achievements",
  "/onboarding/welcome",
  "/onboarding/mode",
  "/onboarding/knowledge",
  "/onboarding/health",
  "/onboarding/location",
  "/onboarding/schedule",
  "/onboarding/notifications",
  "/onboarding/goals",
]);

function pathWithoutHash(path: string): string {
  const i = path.indexOf("#");
  return i === -1 ? path : path.slice(0, i);
}

describe("Broken links check", () => {
  it("every internal path used in the app has a matching route (or is hash anchor)", () => {
    const routeSet = new Set(ROUTES);
    const invalid: string[] = [];
    for (const path of INTERNAL_PATHS_USED) {
      const base = pathWithoutHash(path);
      if (base === "" || base === "/") continue;
      if (!routeSet.has(base as (typeof ROUTES)[number])) {
        invalid.push(path);
      }
    }
    expect(invalid).toEqual([]);
  });

  it("routes list includes all key pages", () => {
    const required = [
      "/",
      "/terms",
      "/legal",
      "/privacy",
      "/faq",
      "/health-safety",
      "/emergency",
      "/settings",
      "/programs",
      "/culture",
      "/recipes",
      "/learn/glossary",
      "/learn/hadith",
      "/dashboard",
      "/dashboard/prayers",
      "/dashboard/learn",
    ];
    const routeSet = new Set([...ROUTES] as string[]);
    for (const path of required) {
      expect(routeSet.has(path), `Missing route: ${path}`).toBe(true);
    }
  });
});
