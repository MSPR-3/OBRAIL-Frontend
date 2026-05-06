import { test, expect } from '@playwright/test';
import { setupApiMocks } from './mocks.js';

test.describe('Imports', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto('/#/imports');
  });

  test('affiche le banner du dernier import', async ({ page }) => {
    await expect(page.getByText('Dernier import réussi')).toBeVisible();
  });

  test('affiche les métriques depuis /imports/stats', async ({ page }) => {
    await expect(page.getByText('Total imports')).toBeVisible();
    await expect(page.getByText('Réussis')).toBeVisible();
    await expect(page.getByText('Échoués')).toBeVisible();
  });

  test("affiche l'historique depuis /imports", async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText('#3')).toBeVisible();
    await expect(page.getByText('Import complet')).toBeVisible();
  });

  test('filtre par statut', async ({ page }) => {
    const btn = page.getByRole('button', { name: 'Succès' });
    await btn.click();
    await expect(page.getByText('Import complet')).toBeVisible();
    await expect(page.getByText('Import partiel')).not.toBeVisible();
  });
});