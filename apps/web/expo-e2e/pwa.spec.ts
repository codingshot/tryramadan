import { expect, test } from '@playwright/test';

test('check-in and journal survive reload and an offline session', async ({ page, context }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Record completed fast' }).click();
  await expect(page.getByRole('heading', { name: 'Fast recorded' })).toBeVisible();
  await page.getByRole('tab', { name: 'Journal' }).click();
  await page.getByRole('textbox', { name: 'Today’s reflection' }).fill('A grateful moment.');
  await page.getByRole('button', { name: 'Save reflection' }).click();
  await expect(page.getByText('Saved on this device.')).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Fast recorded' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('tab', { name: 'Journal' }).click();
  await expect(page.getByRole('textbox', { name: 'Today’s reflection' })).toHaveValue('A grateful moment.');
  await page.getByRole('textbox', { name: 'Today’s reflection' }).fill('Saved while offline.');
  await page.getByRole('button', { name: 'Save reflection' }).click();
  await expect(page.getByText('Saved on this device.')).toBeVisible();
  await page.reload();
  await page.getByRole('tab', { name: 'Journal' }).click();
  await expect(page.getByRole('textbox', { name: 'Today’s reflection' })).toHaveValue('Saved while offline.');
  expect(errors).toEqual([]);
});

test('corrupt storage is not silently overwritten', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('tryramadan-native-days-v1', 'corrupt'));
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('No saved data has been overwritten');
  await expect(page.getByRole('button', { name: 'Record completed fast' })).toBeDisabled();
  expect(await page.evaluate(() => localStorage.getItem('tryramadan-native-days-v1'))).toBe('corrupt');
});

test('mobile layout, source links and unsaved drafts remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('tab', { name: 'Journal' }).click();
  await page.getByRole('textbox', { name: 'Today’s reflection' }).fill('Keep this draft.');
  await page.getByRole('tab', { name: 'Today' }).click();
  await page.getByRole('button', { name: 'Not fasting today' }).click();
  await expect(page.getByText('Saved on this device.')).toBeVisible();
  await page.getByRole('tab', { name: 'Journal' }).click();
  await expect(page.getByRole('textbox', { name: 'Today’s reflection' })).toHaveValue('Keep this draft.');
  await page.getByRole('tab', { name: 'Learn' }).click();
  await expect(page.getByText(/Educational Sunni overview/)).toBeVisible();
  await expect(page.getByRole('link')).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
