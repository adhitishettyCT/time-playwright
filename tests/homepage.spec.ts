import { test, expect } from '@playwright/test';

test('People section is visible on homepage', async ({ page }) => {
  await page.goto('/');
  const peopleSection = page.locator('section:has-text("People")');
  await expect(peopleSection).toBeVisible();
});