import { test, expect } from '@playwright/test';

test('Header and Footer are rendered', async ({ page }) => {
  await page.goto('/');

  const header = page.locator('header');
  const footer = page.locator('footer');

  await expect(header).toBeVisible();
  await expect(footer).toBeVisible();
});
