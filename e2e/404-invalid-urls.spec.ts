/**
 * 404 for invalid URLs. See docs/QA-404-AND-INVALID-URLS.md.
 */
import { test, expect } from "@playwright/test";

const TYPO_ROUTES = ["/dashbord", "/dash/today", "/dashboard/shedule", "/onbording", "/setings"];
const OLD_PATH_REDIRECTS = [
  { from: "/today", to: "/dashboard/today" },
  { from: "/schedule", to: "/dashboard/schedule" },
  { from: "/journal", to: "/dashboard/journal" },
  { from: "/prayers", to: "/dashboard/prayers" },
];

test.describe("Invalid URLs show 404", () => {
  for (const route of TYPO_ROUTES) {
    test(`${route} shows 404 with recovery links`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole("heading", { name: /^404$/ })).toBeVisible();
      await expect(page.getByText(/page not found/i)).toBeVisible();
      await expect(page.getByRole("link", { name: /return to home/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /go to dashboard/i })).toBeVisible();
    });
  }

  for (const { from, to } of OLD_PATH_REDIRECTS) {
    test(`${from} redirects to ${to}`, async ({ page }) => {
      await page.goto(from);
      await expect(page).toHaveURL(new RegExp(to.replace(/\//g, "\\/")));
      await expect(page.getByText(/page not found/i)).not.toBeVisible();
    });
  }

  test("Return to Home navigates to /", async ({ page }) => {
    await page.goto("/dashbord");
    await page.getByRole("link", { name: /return to home/i }).click();
    await expect(page).toHaveURL(/\/(\?.*)?$/);
    await expect(page.getByRole("link", { name: /try.*ramadan/i })).toBeVisible();
  });

  test("Go to Dashboard navigates to /dashboard", async ({ page }) => {
    await page.goto("/invalid-xyz");
    await page.getByRole("link", { name: /go to dashboard/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/page not found/i)).not.toBeVisible();
  });
});
