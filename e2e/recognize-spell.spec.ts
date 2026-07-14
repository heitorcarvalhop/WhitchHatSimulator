import { expect, test } from '@playwright/test';
import { drawIgnis } from './helpers';

test('casting a well-drawn symbol recognizes the matching spell', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas.drawing-canvas');
  await drawIgnis(page, canvas);

  await page.getByRole('button', { name: 'Executar feitiço' }).click();

  await expect(page.getByText('Ignis', { exact: true }).first()).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(/descoberto/i).first()).toBeVisible();
});
