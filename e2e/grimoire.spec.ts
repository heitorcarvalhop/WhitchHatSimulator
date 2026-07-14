import { expect, test } from '@playwright/test';

test('opening the grimoire shows a spell detail page', async ({ page }) => {
  await page.goto('/');

  await page
    .getByRole('button', { name: /Abrir página de/ })
    .first()
    .click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { level: 2 })).toBeVisible();

  await page.getByRole('button', { name: 'Fechar' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('searching the grimoire filters the spell list', async ({ page }) => {
  await page.goto('/');

  const searchInput = page.getByPlaceholder('Buscar feitiço...');
  await searchInput.fill('Ignis');

  await expect(page.getByText('Ignis', { exact: true })).toBeVisible();
  await expect(page.getByText('Aqua', { exact: true })).toHaveCount(0);
});

test('filtering by element shows only matching spells', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Água' }).click();

  await expect(page.getByText('Aqua', { exact: true })).toBeVisible();
  await expect(page.getByText('Ignis', { exact: true })).toHaveCount(0);
});
