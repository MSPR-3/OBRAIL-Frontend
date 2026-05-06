import { test, expect } from '@playwright/test';

import { setupApiMocks } from './mocks.js';

test.describe('Statistiques', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto('/#/statistiques');
    // Wait for KPI cards to be rendered before each test
    await expect(page.getByText('CO₂ total émis')).toBeVisible({ timeout: 10000 });
  });

  test('affiche les métriques KPI', async ({ page }) => {
    await expect(page.getByText('CO₂ total émis')).toBeVisible();
    await expect(page.locator('span').filter({ hasText: 'Durée moyenne' })).toBeVisible();
    await expect(page.getByText('Lignes actives')).toBeVisible();
  });

  test('affiche le graphique Jour vs Nuit', async ({ page }) => {
    const chartCard = page
      .locator('.chart-card')
      .filter({ has: page.locator('.chart-card-title', { hasText: 'Jour vs Nuit' }) });
    await expect(chartCard).toBeVisible();
    await expect(chartCard.getByText('820')).toBeVisible();
    await expect(chartCard.getByText('430')).toBeVisible();
  });

  test('affiche le graphique Top 10 lignes', async ({ page }) => {
    await expect(page.getByText('Top 10 lignes')).toBeVisible();
    await expect(page.locator('svg text').filter({ hasText: 'ThalysParis-Bruxelles' })).toBeVisible(
      { timeout: 10000 },
    );
  });

  test('affiche le comparatif jour/nuit', async ({ page }) => {
    await expect(page.getByText('Comparatif Jour vs Nuit')).toBeVisible();
    // These values come from the <table> rendered from cmp.indicateurs
    await expect(page.getByRole('cell', { name: 'Nombre de trajets' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Durée moyenne' })).toBeVisible();
  });
});
