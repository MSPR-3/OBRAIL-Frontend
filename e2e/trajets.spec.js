import { test, expect } from '@playwright/test';
import { setupApiMocks } from './mocks.js';

test.describe('Imports', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto('/imports');
    await expect(page).toHaveURL(/\/imports/);
  });

  test('affiche le banner du dernier import', async ({ page }) => {
    await expect(page.getByText('Dernier import réussi')).toBeVisible();
  });

  test('affiche les métriques depuis /imports/stats', async ({ page }) => {
    await expect(page.getByText('Total imports', { exact: true })).toBeVisible();
    await expect(page.getByText('Réussis', { exact: true })).toBeVisible();
    await expect(page.getByText('Échoués', { exact: true })).toBeVisible();
  });

  test('affiche l\'historique depuis /imports', async ({ page }) => {
    // Attends qu'un identifiant unique de la page soit bien là
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText('#3', { exact: true })).toBeVisible();
    await expect(page.getByText('Import complet', { exact: true })).toBeVisible();
  });

  test('filtre par statut', async ({ page }) => {
    // S'assure que le bouton existe avant de cliquer
    const btn = page.getByRole('button', { name: 'Succès' });
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.getByText('Import complet', { exact: true })).toBeVisible();
    await expect(page.getByText('Import partiel', { exact: true })).not.toBeVisible();
  });
});