/**
 * Happy path E2E test: new user completes onboarding and visits all major dashboard pages.
 * Fails if any page fails to render or crashes. Minimal assertions per page.
 */
import { test, expect } from "@playwright/test";

const BASE = "http://localhost:8080";

test.describe("Happy path: onboarding → dashboard pages", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
    await page.evaluate(() => localStorage.clear());
  });

  test("new user completes onboarding and visits all major pages", async ({ page }) => {
    await page.goto(BASE);

    // --- Onboarding: Muslim path (fastest) ---
    await page.goto(`${BASE}/onboarding/welcome`);
    await expect(page.getByRole("heading", { name: /welcome to tryramadan/i })).toBeVisible();
    await page.getByRole("link", { name: /get started/i }).click();

    await expect(page).toHaveURL(/\/onboarding\/mode/);
    await expect(page.getByRole("heading", { name: /choose your mode/i })).toBeVisible();
    await page.getByRole("button", { name: /muslim mode/i }).click();

    await expect(page).toHaveURL(/\/onboarding\/health/);
    await expect(page.getByRole("heading", { name: /health screening/i })).toBeVisible();
    await page.getByRole("button", { name: /^continue$/i }).first().click();

    await expect(page).toHaveURL(/\/onboarding\/gender/);
    await expect(page.getByRole("heading", { name: /^gender$/i })).toBeVisible();
    await page.getByRole("button", { name: /^continue$/i }).first().click();

    await expect(page).toHaveURL(/\/onboarding\/location/);
    await expect(page.getByRole("heading", { name: /^location$/i })).toBeVisible();
    // Skip for now (avoids location API); if auto-detect succeeded, Continue may be enabled
    const skipBtn = page.getByRole("button", { name: /skip for now/i });
    const continueBtn = page.getByRole("button", { name: /^continue$/i }).first();
    if (await skipBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
      await skipBtn.click();
    } else {
      await continueBtn.click();
    }

    await expect(page).toHaveURL(/\/onboarding\/schedule/);
    await expect(page.getByRole("heading", { name: /fasting schedule/i })).toBeVisible();
    await page.getByRole("button", { name: /^continue$/i }).first().click();

    await expect(page).toHaveURL(/\/onboarding\/notifications/);
    await expect(page.getByRole("heading", { name: /notifications/i })).toBeVisible();
    await page.getByRole("button", { name: /^continue$/i }).first().click();

    await expect(page).toHaveURL(/\/onboarding\/priorities/);
    await expect(page.getByRole("heading", { name: /your priorities/i })).toBeVisible();
    await page.getByRole("button", { name: /^continue$/i }).first().click();

    await expect(page).toHaveURL(/\/onboarding\/goals/);
    await expect(page.getByRole("heading", { name: /goals.*intentions/i })).toBeVisible();
    await page.getByRole("button", { name: /go to dashboard/i }).first().click();

    await expect(page).toHaveURL(/\/dashboard/);

    // --- Dashboard pages: minimal assertions (heading + main content) ---

    const pages: { path: string; heading: RegExp | string; extra?: RegExp | string }[] = [
      { path: "/dashboard", heading: /ramadan|fasting journey|looking forward/i, extra: /today|schedule|meals/i },
      { path: "/dashboard/today", heading: /today's fast/i },
      { path: "/dashboard/schedule", heading: /fasting schedule/i },
      { path: "/dashboard/prayers", heading: /prayer times/i },
      { path: "/dashboard/meals", heading: /meal planning/i },
      { path: "/dashboard/journal", heading: /reflection journal/i },
      { path: "/dashboard/progress", heading: /your progress/i, extra: /days completed|streak/i },
      { path: "/dashboard/learn", heading: /learn.*explore/i },
    ];

    for (const { path, heading, extra } of pages) {
      await page.goto(`${BASE}${path}`);
      await expect(page).toHaveURL(new RegExp(path.replace(/\//g, "\\/")));

      await expect(page.getByRole("heading", { name: heading })).toBeVisible({ timeout: 10000 });
      if (extra) {
        await expect(page.getByText(extra)).toBeVisible({ timeout: 5000 });
      }

      // Main layout: nav and main content present
      await expect(page.locator("main, [role=main]").first()).toBeVisible();
      await expect(page.locator("nav").first()).toBeVisible();
    }
  });
});
