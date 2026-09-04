import { test, expect } from '@playwright/test';

for (const userType of ['muslim', 'new']) {
  test(`${userType}: journal and fast logging survive reload with services unavailable`, async ({ page }) => {
    await page.route('**/*', request => {
      const url = new URL(request.request().url());
      return ['localhost', '127.0.0.1'].includes(url.hostname) ? request.continue() : request.abort();
    });
    await page.addInitScript((mode) => {
      if (!localStorage.getItem('tryramadan-preferences')) {
        localStorage.setItem('tryramadan-preferences', JSON.stringify({
          onboardingComplete: true, userType: mode, timezone: 'UTC', theme: 'light',
        }));
        localStorage.setItem('tryramadan-walkthrough', JSON.stringify({ completed: true }));
      }
    }, userType);
    await page.goto('/dashboard/journal');
    await page.getByPlaceholder('Write a few lines...').fill('Audit journal: محفوظ <script>not executable</script>');
    await page.getByRole('button', { name: /^(Save|Update) entry$/ }).click();
    await page.reload();
    await expect(page.getByPlaceholder('Write a few lines...')).toHaveValue('Audit journal: محفوظ <script>not executable</script>');
    await page.goto('/dashboard/schedule');
    await expect(page.getByText('Prayer times unavailable')).toBeVisible();
    await page.getByRole('button', { name: "I'm fasting", exact: true }).click();
    await page.reload();
    await expect(page.getByText('Fasting', { exact: true }).last()).toBeVisible();
    const log = await page.evaluate(() => JSON.parse(localStorage.getItem('tryramadan-progress') || '{}').fastingLog);
    expect(log.some((entry: { status: string }) => entry.status === 'in_progress')).toBe(true);
  });
}
