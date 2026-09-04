import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Derive the inventory from the router so new static screens cannot silently
// fall out of the audit. Dynamic detail records need separate fixture coverage.
const router = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const routes = [...new Set([...router.matchAll(/path="(\/[^"]*)"/g)]
  .map((match) => match[1]).filter((route) => !route.includes(':')))];
routes.push(...[...router.matchAll(/<Route path="([a-z]+)"/g)].map(match => `/onboarding/${match[1]}`));

for (const persona of [
  { name: 'Muslim desktop', userType: 'muslim', width: 1440 },
  { name: 'Newcomer mobile', userType: 'new', width: 360 },
  { name: 'Muslim mobile', userType: 'muslim', width: 360 },
  { name: 'Newcomer desktop', userType: 'new', width: 1440 },
] as const) {
  test.describe(persona.name, () => {
    test.use({ viewport: { width: persona.width, height: 900 }, reducedMotion: 'reduce' });
    for (const route of routes) {
      test(`${route} renders without crashes or page overflow`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.route('**/*', (request) => {
          const url = new URL(request.request().url());
          return ['localhost', '127.0.0.1'].includes(url.hostname)
            ? request.continue() : request.abort();
        });
        await page.addInitScript(({ userType, onboarding }) => {
          localStorage.setItem('tryramadan-preferences', JSON.stringify({
            onboardingComplete: !onboarding, userType, theme: 'light',
            location: null, locationCoords: null, timezone: 'UTC',
          }));
          localStorage.setItem('tryramadan-walkthrough', JSON.stringify({ completed: true }));
          if (onboarding) localStorage.setItem('tryramadan-onboarding-draft', JSON.stringify({ mode: userType }));
          localStorage.setItem('tryramadan-ask-fasting-dismissed', new Date().toISOString().slice(0, 10));
        }, { ...persona, onboarding: route.startsWith('/onboarding') });
        await page.goto(route);
        await expect(page.locator('main')).toBeVisible();
        await expect(page.locator('main')).not.toHaveText('');
        await expect(page.locator('vite-error-overlay')).toHaveCount(0);
        await expect.poll(() => page.evaluate(() =>
          document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
        expect(errors).toEqual([]);
      });
    }
  });
}
