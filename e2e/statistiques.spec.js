import { test, expect } from '@playwright/test';
import { setupApiMocks } from './mocks.js';

test.describe('Statistiques', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto('/statistiques');
  });

  test('affiche les métriques KPI', async ({ page }) => {
    await expect(page.getByText('CO₂ total émis')).toBeVisible();
    await expect(page.getByText('Durée moyenne')).toBeVisible();
    await expect(page.getByText('Lignes actives')).toBeVisible();
  });

  test('affiche le graphique Jour vs Nuit', async ({ page }) => {
    await expect(page.getByText('Jour vs Nuit')).toBeVisible();
    await expect(page.getByText('820')).toBeVisible();
    await expect(page.getByText('430')).toBeVisible();
  });

  test('affiche le graphique Top 10 lignes', async ({ page }) => {
    await expect(page.getByText('Top 10 lignes')).toBeVisible();
    await expect(page.getByText('Thalys Paris-Bruxelles')).toBeVisible();
  });

  test('affiche le comparatif jour/nuit', async ({ page }) => {
    await expect(page.getByText('Comparatif Jour vs Nuit')).toBeVisible();
    await expect(page.getByText('Nombre de trajets')).toBeVisible();
    await expect(page.getByText('Durée moyenne')).toBeVisible();
  });
});
