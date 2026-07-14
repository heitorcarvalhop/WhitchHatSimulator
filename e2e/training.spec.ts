import { expect, test } from '@playwright/test';

test('training mode shows a banner with the target spell and a guide overlay', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Treinar Ignis' }).click();

  await expect(page.getByText('Treinando: Ignis')).toBeVisible();
  await expect(page.locator('.guide-overlay')).toBeVisible();

  await page.getByRole('button', { name: 'Sair do treino' }).click();
  await expect(page.getByText('Treinando: Ignis')).toBeHidden();
});

test('changing the help level updates the guide overlay style', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Treinar Ignis' }).click();

  await page.getByRole('button', { name: 'Sem ajuda' }).click();

  await expect(page.locator('.guide-overlay')).toHaveCount(0);
});
