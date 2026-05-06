import { test, expect } from '@playwright/test';

import { setupApiMocks } from './mocks.js';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto('/');
  });

  test('affiche les indicateurs KPI', async ({ page }) => {
    await expect(page.getByText('1 250', { exact: true })).toBeVisible();
    await expect(page.getByText('Total trajets')).toBeVisible();
    await expect(page.getByText('5', { exact: true })).toBeVisible();
    await expect(page.getByText('Opérateurs')).toBeVisible();
  });

  test('affiche le CO₂ total depuis /stats/kpi', async ({ page }) => {
    await expect(page.getByText(/CO₂ total/)).toBeVisible();
    // fr-FR locale uses narrow no-break space (\u202f) as thousands separator
    await expect(page.getByText(/3.?145/)).toBeVisible();
  });

  test('affiche la liste des 3 derniers imports', async ({ page }) => {
    await expect(page.getByText('#3')).toBeVisible();
    await expect(page.getByText('succès').first()).toBeVisible();
  });

  test('affiche le graphique par opérateur', async ({ page }) => {
    await expect(page.getByText('Volume de trajets par opérateur')).toBeVisible();
  });
});
