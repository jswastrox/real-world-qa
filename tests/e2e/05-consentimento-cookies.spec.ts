import { test, expect, CONSENT_STORAGE_KEY } from '../../src/fixtures/test';

test.describe('Consentimento de cookies (LGPD)', () => {
  test.use({ cookieConsent: 'unset' });

  const banner = '#cookie-consent-banner';

  test('CT-22 primeiro acesso exibe o banner com link para a Política de Cookies', async ({ page, homePage }) => {
    await homePage.goto();

    await expect(page.locator(banner)).toBeVisible();
    await expect(page.locator(banner).getByRole('link', { name: 'Política de Cookies' })).toBeVisible();
  });

  for (const { button, stored } of [
    { button: 'Recusar', stored: 'denied' },
    { button: 'Aceitar', stored: 'granted' },
  ]) {
    test(`CT-23 "${button}" grava a escolha e o banner não volta após recarregar`, async ({ page, homePage }) => {
      await homePage.goto();

      await page.locator(banner).getByRole('button', { name: button }).click();

      await expect(page.locator(banner)).toBeHidden();
      expect(await page.evaluate((key) => localStorage.getItem(key), CONSENT_STORAGE_KEY)).toBe(stored);

      await page.reload();
      await expect(homePage.heading).toBeVisible();
      await expect(page.locator(banner)).toBeHidden();
    });
  }
});
