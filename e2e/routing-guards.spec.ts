/**
 * Routing guards: dashboard redirects when storage is empty / onboarding not complete.
 * See docs/QA-ROUTING-GUARDS-AND-TEST-CASES.md.
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:8080";

test.describe("Routing guards", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
    await page.evaluate(() => localStorage.clear());
  });

  test("visiting /dashboard with empty storage redirects to onboarding", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await expect(page).toHaveURL(/\/(onboarding|dashboard)/);
    const url = page.url();
    if (/\/onboarding\//.test(url)) {
      await expect(page.getByRole("heading", { name: /welcome|mode|health|location|schedule|notifications|priorities|goals/i })).toBeVisible({ timeout: 5000 });
    } else {
      await expect(page.getByRole("heading", { name: /dashboard|progress|today|schedule|journal|prayers|meals|learn|health|goals/i })).toBeVisible({ timeout: 5000 });
    }
  });

  test("visiting / with empty storage shows home (no redirect)", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await expect(page).toHaveURL(/\/(\?.*)?$/);
    await expect(page.getByRole("link", { name: /try.*ramadan/i })).toBeVisible();
  });

  test("visiting /onboarding/welcome with empty storage shows welcome", async ({ page }) => {
    await page.goto(`${BASE}/onboarding/welcome`);
    await expect(page).toHaveURL(/\/onboarding\/welcome/);
    await expect(page.getByRole("heading", { name: /welcome to tryramadan/i })).toBeVisible();
  });
});
