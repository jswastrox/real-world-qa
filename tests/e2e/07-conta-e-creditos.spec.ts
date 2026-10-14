import { test, expect } from '../../src/fixtures/test';
import { AUTH_STATE } from '../../src/config/auth';
import { hasTestUser } from '../../src/config/env';
import { routes } from '../../src/config/routes';

test.describe('Conta e compra de créditos', () => {
  test.skip(!hasTestUser, 'conta de teste não configurada');
  test.use({ storageState: AUTH_STATE });

  test('CT-30 conta nova não tem consultas no histórico', async ({ page }) => {
    await page.goto(routes.myLookups);

    await expect(page.getByRole('heading', { name: 'Minhas consultas', level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Você ainda não tem consultas' })).toBeVisible();
  });

  test('CT-31 página de créditos lista pacotes com pagamento via PIX', async ({ page }) => {
    await page.goto(routes.buyCredits);

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Compre créditos');
    const packs = page.locator('.credit-pack-pricing-card');
    await expect(packs.first()).toBeVisible();
    expect(await packs.count()).toBeGreaterThan(0);
    await expect(packs.first()).toContainText('R$');
    await expect(packs.first()).toContainText('Pagar com PIX');
  });

  test('CT-32 trava de produção impede que um PIX real seja gerado', async ({ page, blockedRequests }) => {
    await page.goto(routes.buyCredits);
    const firstPack = page.locator('.credit-pack-pricing-card').first();
    await expect(firstPack).toBeVisible();

    await firstPack.click();

    await expect
      .poll(() => blockedRequests.filter((r) => r.reason === 'mutation').length, {
        message: 'a tentativa de criar o pagamento deveria ter sido abortada',
      })
      .toBeGreaterThan(0);
    await expect(page).toHaveURL(new RegExp(`${routes.buyCredits}$`));
  });
});
