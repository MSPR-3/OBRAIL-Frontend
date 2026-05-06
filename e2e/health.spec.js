import { test, expect } from '@playwright/test';
import { setupApiMocks } from './mocks.js';

test.describe('Navigation et santé app', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test('la page racine charge sans erreur', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).not.toBeEmpty();
  });

  test('navigation vers Trajets', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Trajets');
    const nav = page.getByRole('button', { name: /trajets/i });
    await expect(nav).toBeVisible();
    await nav.click();
    await expect(page).toHaveURL(/trajets/);
  });

  test('navigation vers Imports', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Imports');
    const nav = page.getByRole('button', { name: /imports/i });
    await expect(nav).toBeVisible();
    await nav.click();
    await expect(page).toHaveURL(/imports/);
  });

  test('navigation vers Statistiques', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Statistiques');
    const nav = page.getByRole('button', { name: /statistiques/i });
    await expect(nav).toBeVisible();
    await nav.click();
    await expect(page).toHaveURL(/statistiques/);
  });
});
