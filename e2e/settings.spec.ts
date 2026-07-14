import { expect, test } from '@playwright/test';

test('opening settings and toggling high contrast updates the document', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Configurações' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  const highContrastToggle = page.getByRole('switch', { name: 'Modo de alto contraste' });
  await highContrastToggle.click();

  await expect(page.locator('html')).toHaveAttribute('data-high-contrast', 'true');

  await page.getByRole('button', { name: 'Fechar' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('adjusting the recognition tolerance slider persists the value', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Configurações' }).click();

  const slider = page.getByRole('slider', { name: 'Tolerância do reconhecimento' });
  await slider.fill('0.5');

  await expect(slider).toHaveValue('0.5');
});
