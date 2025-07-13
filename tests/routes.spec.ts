import { test, expect } from '@playwright/test';
import { getRoutes } from '../src/lib/routes';

test.describe('routes', () => {
  for (const r of getRoutes()) {
    test(`/${r.slug_en} loads`, async ({ page }) => {
      await page.goto(`/ar/${r.slug_en}`);
      await expect(page.locator('h1')).toHaveText(r.label_ar);
    });
  }
});
