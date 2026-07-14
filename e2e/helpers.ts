import type { Locator, Page } from '@playwright/test';

export async function canvasCenter(canvas: Locator): Promise<{ cx: number; cy: number }> {
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas bounding box not found');
  return { cx: box.x + box.width / 2, cy: box.y + box.height / 2 };
}

/** Draws Ignis' two-stroke symbol (triangle + vertical line) on the given canvas. */
export async function drawIgnis(page: Page, canvas: Locator): Promise<void> {
  const { cx, cy } = await canvasCenter(canvas);

  await page.mouse.move(cx, cy - 120);
  await page.mouse.down();
  await page.mouse.move(cx + 100, cy + 100, { steps: 12 });
  await page.mouse.move(cx - 100, cy + 100, { steps: 12 });
  await page.mouse.move(cx, cy - 120, { steps: 12 });
  await page.mouse.up();

  await page.mouse.move(cx, cy - 60);
  await page.mouse.down();
  await page.mouse.move(cx, cy + 80, { steps: 10 });
  await page.mouse.up();
}

export async function drawSimpleStroke(page: Page, canvas: Locator): Promise<void> {
  const { cx, cy } = await canvasCenter(canvas);
  await page.mouse.move(cx - 60, cy - 60);
  await page.mouse.down();
  await page.mouse.move(cx + 60, cy + 60, { steps: 10 });
  await page.mouse.up();
}
