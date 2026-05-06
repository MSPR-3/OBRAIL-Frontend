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
    const chart = page.getByRole('img', { name: 'Graphique top 10 des lignes' });
    await expect(chart).toBeVisible();
    await expect(
      chart.locator('svg text').filter({ hasText: 'ThalysParis-Bruxelles' }),
    ).toBeVisible({ timeout: 10000 });
  });

  test('affiche le comparatif jour/nuit', async ({ page }) => {
    const section = page.getByRole('region', { name: 'Comparatif jour et nuit' });
    await expect(section).toBeVisible();
    await expect(section.getByRole('cell', { name: 'Nombre de trajets' })).toBeVisible();
    await expect(section.getByRole('cell', { name: 'Durée moyenne' })).toBeVisible();
  });
});
