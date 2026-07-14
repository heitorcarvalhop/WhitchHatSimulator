import { expect, test } from '@playwright/test';
import { drawSimpleStroke } from './helpers';

test.describe('Drawing surface', () => {
  test('drawing a stroke enables execute and undo actions', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas.drawing-canvas');
    await expect(canvas).toBeVisible();

    await expect(page.getByRole('button', { name: 'Executar feitiço' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Desfazer último traço' })).toBeDisabled();

    await drawSimpleStroke(page, canvas);

    await expect(page.getByRole('button', { name: 'Executar feitiço' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'Desfazer último traço' })).toBeEnabled();
  });

  test('undo removes the last stroke', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas.drawing-canvas');
    await drawSimpleStroke(page, canvas);

    await page.getByRole('button', { name: 'Desfazer último traço' }).click();

    await expect(page.getByRole('button', { name: 'Executar feitiço' })).toBeDisabled();
  });

  test('clearing the canvas disables execute and undo', async ({ page }) => {
    await page.goto('/');
    const canvas = page.locator('canvas.drawing-canvas');
    await drawSimpleStroke(page, canvas);
    await expect(page.getByRole('button', { name: 'Executar feitiço' })).toBeEnabled();

    await page.getByRole('button', { name: 'Limpar desenho' }).click();

    await expect(page.getByRole('button', { name: 'Executar feitiço' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Desfazer último traço' })).toBeDisabled();
  });
});
