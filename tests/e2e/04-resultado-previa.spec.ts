import { test, expect } from '../../src/fixtures/test';
import { buildPlatePreview } from '../../src/mocks/plate-api';
import { routes } from '../../src/config/routes';

test.describe('Página de resultado (prévia gratuita)', () => {
  const preview = buildPlatePreview();

  test('CT-17 prévia mostra os dados públicos do veículo', async ({ plateResultPage }) => {
    await plateResultPage.openWithPreview(preview);

    await expect(plateResultPage.successBanner).toContainText(`Placa ${preview.placa} encontrada`);
    await expect(plateResultPage.field('Marca')).toContainText(preview.marca);
    await expect(plateResultPage.field('Modelo')).toContainText(preview.modelo);
    await expect(plateResultPage.field('Cor')).toContainText(preview.cor);
    await expect(plateResultPage.field('UF')).toContainText(preview.uf);
  });

  test('CT-18 dados pagos não aparecem na tela antes do desbloqueio', { tag: '@smoke' }, async ({
    page,
    plateResultPage,
  }) => {
    await plateResultPage.openWithPreview(preview);
    await expect(plateResultPage.successBanner).toBeVisible();

    const visibleText = await page.locator('#plate-resultado-root').innerText();
    for (const [field, value] of Object.entries({
      chassi: preview.chassi,
      renavam: preview.renavam,
      nome: preview.nome,
      documento: preview.documento,
      telefone: preview.telefone,
    })) {
      expect.soft(visibleText, `${field} visível sem pagamento`).not.toContain(value);
    }
    await expect(plateResultPage.unlockCta).toContainText('Desbloquear Informações');
  });

  test('CT-19 visitante que tenta desbloquear não é levado direto ao pagamento', async ({
    page,
    plateResultPage,
  }) => {
    await plateResultPage.openWithPreview(preview);

    await plateResultPage.unlockCta.click();

    await expect(plateResultPage.successBanner).toBeHidden();
    await expect(page).toHaveURL(new RegExp(`${routes.plateResult}$`));
  });

  test('CT-20 sem consulta em andamento a página orienta uma nova pesquisa', async ({ page }) => {
    await page.goto(routes.plateResult);

    await expect(page.getByRole('heading', { name: 'Resultado não encontrado' })).toBeVisible();
    await page.getByRole('button', { name: 'Nova pesquisa' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('CT-21 "Nova pesquisa" pede confirmação antes de descartar o resultado', async ({
    page,
    plateResultPage,
  }) => {
    await plateResultPage.openWithPreview(preview);

    await plateResultPage.newSearchButton.click();
    await expect(page.getByRole('heading', { name: 'Confirmar saída' })).toBeVisible();

    await page.getByRole('button', { name: 'Permanecer' }).click();
    await expect(plateResultPage.successBanner).toBeVisible();

    await plateResultPage.newSearchButton.click();
    await page.getByRole('button', { name: 'Sair' }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
