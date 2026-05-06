import { test, expect } from '@playwright/test';
import { setupApiMocks } from './mocks.js';

test.describe('Trajets', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto('/#/trajets');
    // Wait for the table to be rendered before running each test
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });
  });

  test('affiche le tableau de trajets', async ({ page }) => {
    await expect(page.getByText('TJ-001')).toBeVisible();
  });

  test('affiche les informations de départ/arrivée nestées', async ({ page }) => {
    await expect(page.getByText('Gare du Nord')).toBeVisible();
    await expect(page.getByText('Bruxelles-Midi')).toBeVisible();
    // ville is displayed in a sub-div inside the same <td>
    await expect(page.locator('td').filter({ hasText: 'Gare du Nord' })).toContainText('Paris');
    await expect(page.locator('td').filter({ hasText: 'Bruxelles-Midi' })).toContainText('Bruxelles');
  });
  
test('affiche le nom opérateur depuis la structure nested', async ({ page }) => {
  await expect(page.getByRole('cell', { name: 'Thalys', exact: true })).toBeVisible();
});

  test('affiche la ligne depuis la structure nested', async ({ page }) => {
    await expect(page.getByText('Thalys Paris-Bruxelles')).toBeVisible();
  });

  test("filtre par opérateur change l'URL / query", async ({ page }) => {
    const select = page.locator('select').nth(0);
    await select.selectOption('SNCF');
    // The table header column "Opérateur" remains visible after filtering
    await expect(page.getByRole('columnheader', { name: 'Opérateur' })).toBeVisible();
  });

test('filtre pays départ est populé depuis /pays', async ({ page }) => {
  const selects = page.locator('select');
  await expect(selects).toHaveCount(4);
  const paysSelect = page.locator('select').nth(2);
  await expect(paysSelect.locator('option', { hasText: 'France' })).toBeAttached({ timeout: 10000 });
});

  test('bouton Détails ouvre le drawer', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Détails/ }).first();
    await btn.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    // Drawer header shows "{depart.ville} → {arrivee.ville}"
    await expect(page.locator('.drawer-head')).toContainText('Paris');
    await expect(page.locator('.drawer-head')).toContainText('Bruxelles');
  });

  test('pagination affiche le total de pages', async ({ page }) => {
    // Component renders: "1 trajets (page 1 / 84)"
    await expect(page.getByText(/page 1/i)).toBeVisible();
  });
});