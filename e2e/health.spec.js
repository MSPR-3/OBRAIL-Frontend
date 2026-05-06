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
    const nav = page.getByRole('button', { name: /trajets/i });
    await nav.first().click();
    await expect(page).toHaveURL(/#\/trajets/);
  });

  test('navigation vers Imports', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('button', { name: /imports/i });
    await nav.first().click();
    await expect(page).toHaveURL(/#\/imports/);
  });

  test('navigation vers Statistiques', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('button', { name: /statistiques/i });
    await nav.first().click();
    await expect(page).toHaveURL(/#\/statistiques/);
  });
});