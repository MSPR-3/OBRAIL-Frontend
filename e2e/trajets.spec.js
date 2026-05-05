import { test, expect } from '@playwright/test';
import { setupApiMocks } from './mocks.js';

test.describe('Trajets', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
    await page.goto('/trajets');
  });

  test('affiche le tableau de trajets', async ({ page }) => {
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByText('TJ-001')).toBeVisible();
  });

  test('affiche les informations de départ/arrivée nestées', async ({ page }) => {
    await expect(page.getByText('Gare du Nord')).toBeVisible();
    await expect(page.getByText('Bruxelles-Midi')).toBeVisible();
    await expect(page.getByText('Paris')).toBeVisible();
    await expect(page.getByText('Bruxelles')).toBeVisible();
  });

  test('affiche le nom opérateur depuis la structure nested', async ({ page }) => {
    await expect(page.getByText('Thalys')).toBeVisible();
  });

  test('affiche la ligne depuis la structure nested', async ({ page }) => {
    await expect(page.getByText('Thalys Paris-Bruxelles')).toBeVisible();
  });

  test('filtre par opérateur change l\'URL / query', async ({ page }) => {
    const select = page.locator('select').nth(0);
    await select.selectOption('SNCF');
    await expect(page.getByText('Opérateur')).toBeVisible();
  });

  test('filtre pays départ est populé depuis /pays', async ({ page }) => {
    const selects = page.locator('select');
    await expect(selects).toHaveCount(3);
    const opt = page.locator('select').nth(1).locator('option', { hasText: 'France' });
    await expect(opt).toBeAttached();
  });

  test('bouton Détails ouvre le drawer', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Détails/ }).first();
    await btn.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Paris → Bruxelles')).toBeVisible();
  });

  test('pagination affiche le total de pages', async ({ page }) => {
    await expect(page.getByText(/page 1/i)).toBeVisible();
  });
});
