import { test, expect } from '../../src/fixtures/test';

test.describe('Experiência mobile', { tag: '@mobile' }, () => {
  test.skip(({ isMobile }) => !isMobile, 'cenário exclusivo de viewport mobile');

  test('CT-33 menu hambúrguer abre e fecha a navegação', async ({ page, homePage }) => {
    await homePage.goto();
    const toggle = page.locator('#nav-toggle');
    const drawer = page.locator('#main-nav-drawer');

    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(drawer.getByRole('link', { name: 'Contato' })).toBeVisible();

    await page.locator('#nav-drawer-close').click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('CT-34 consulta e validação funcionam no celular', async ({ homePage }) => {
    await homePage.goto();

    await expect(homePage.plateInput).toBeInViewport();
    await homePage.searchPlate('ABCD123');
    await expect(homePage.searchError).toBeVisible();
  });

  test('CT-35 página não tem rolagem horizontal', async ({ page, homePage }) => {
    await homePage.goto();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
