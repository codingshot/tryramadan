#!/usr/bin/env node
/**
 * Capture screenshots for User Guides.
 *
 * Prerequisites:
 *   1. npm install playwright --save-dev
 *   2. Start the app: npm run dev (in another terminal)
 *   3. Run: node scripts/capture-guide-screenshots.mjs
 *
 * Screenshots are saved to public/guide-assets/
 * Uses mobile viewport (390x844) for consistency.
 */

import { chromium } from "playwright";
import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ASSETS_DIR = join(ROOT, "public", "guide-assets");
const BASE_URL = process.env.BASE_URL || "http://localhost:5173";

/** { path, filename } - path = app route, filename = output PNG name */
const SCREENSHOTS = [
  { path: "/", filename: "getting-started-home.png" },
  { path: "/onboarding/welcome", filename: "onboarding-welcome.png" },
  { path: "/onboarding/mode", filename: "onboarding-mode.png" },
  { path: "/onboarding/knowledge", filename: "onboarding-knowledge.png" },
  { path: "/onboarding/health", filename: "onboarding-health.png" },
  { path: "/onboarding/location", filename: "onboarding-location.png" },
  { path: "/onboarding/schedule", filename: "onboarding-schedule.png" },
  { path: "/onboarding/notifications", filename: "onboarding-notifications.png" },
  { path: "/onboarding/priorities", filename: "onboarding-priorities.png" },
  { path: "/onboarding/goals", filename: "onboarding-goals.png" },
  { path: "/dashboard", filename: "dashboard-overview.png" },
  { path: "/dashboard/today", filename: "today-fast.png" },
  { path: "/dashboard/schedule", filename: "schedule-calendar.png" },
  { path: "/dashboard/prayers", filename: "prayers.png" },
  { path: "/dashboard/meals", filename: "meals.png" },
  { path: "/dashboard/progress", filename: "progress.png" },
  { path: "/dashboard/journal", filename: "journal.png" },
  { path: "/emergency", filename: "emergency.png" },
  { path: "/settings", filename: "settings.png" },
  { path: "/dashboard/learn", filename: "learn.png" },
  { path: "/programs", filename: "programs.png" },
  { path: "/dashboard/goals", filename: "goals.png" },
];

async function main() {
  await mkdir(ASSETS_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const checkPage = await browser.newPage();
  try {
    await checkPage.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 8000 });
  } catch (e) {
    await checkPage.close();
    await browser.close();
    console.error(`\nCould not reach the app at ${BASE_URL}. Start it first:\n  npm run dev\n`);
    process.exit(1);
  }
  await checkPage.close();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });

  // Seed preferences so dashboard/schedule etc. render (skip onboarding redirect)
  const seedPage = await context.newPage();
  await seedPage.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await seedPage.evaluate(() => {
    const prefs = JSON.parse(localStorage.getItem("tryramadan-preferences") || "{}");
    localStorage.setItem(
      "tryramadan-preferences",
      JSON.stringify({
        ...prefs,
        onboardingComplete: true,
        locationCoords: prefs.locationCoords || { lat: 51.5074, lng: -0.1278 },
      })
    );
  });
  await seedPage.close();

  console.log("Capturing guide screenshots (mobile viewport 390x844)...\n");

  for (const { path, filename } of SCREENSHOTS) {
    const url = `${BASE_URL}${path}`;
    try {
      const page = await context.newPage();
      await page.goto(url, { waitUntil: "load", timeout: 20000 });
      await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1200);

      const outPath = join(ASSETS_DIR, filename);
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`  ✓ ${filename}`);
      await page.close();
    } catch (err) {
      console.error(`  ✗ ${filename}: ${err.message}`);
    }
  }

  await browser.close();
  console.log("\nDone. Screenshots saved to public/guide-assets/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
