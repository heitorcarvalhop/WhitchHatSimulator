import { expect, test } from '@playwright/test';

test('creating and saving a custom spell in the Arcane Lab', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Laboratório' }).click();

  await expect(page.getByRole('heading', { name: /Laboratório Arcano/ })).toBeVisible();

  const symbolCanvas = page.locator('.symbol-editor__canvas canvas.drawing-canvas');
  const box = await symbolCanvas.boundingBox();
  if (!box) throw new Error('symbol editor canvas not found');
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  await page.mouse.move(cx - 40, cy - 40);
  await page.mouse.down();
  await page.mouse.move(cx + 40, cy + 40, { steps: 10 });
  await page.mouse.up();

  await page.getByLabel('Nome').fill('Fulgor Teste');

  await page.getByRole('button', { name: /Salvar feitiço/ }).click();

  await expect(page.getByText('Fulgor Teste', { exact: true })).toBeVisible();
  await expect(page.getByText(/foi salvo no seu grimório/)).toBeVisible();
});
