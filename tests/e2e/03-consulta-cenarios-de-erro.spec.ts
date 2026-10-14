import { test, expect } from '../../src/fixtures/test';
import { mockPlateLookup, mockPlateLookupHanging, plateApiResponses } from '../../src/mocks/plate-api';

/**
 * A consulta real custa dinheiro no fornecedor, então todas as respostas da API
 * de placa aqui são simuladas. O que está sob teste é como o site reage a cada uma.
 */
test.describe('Consulta de placa: respostas da API', () => {
  const VALID_PLATE = 'QAT1E23';

  test('CT-11 placa não encontrada exibe a mensagem da API', async ({ page, homePage }) => {
    await mockPlateLookup(page, plateApiResponses.notFound());
    await homePage.goto();

    await homePage.searchPlate(VALID_PLATE);

    await expect(homePage.searchError).toHaveText('A placa não foi encontrada na base consultada.');
    await expect(page).toHaveURL(/\/$/);
    await expect(homePage.searchButton).toBeEnabled();
  });

  test('CT-12 sem créditos (HTTP 402) exibe o botão de comprar créditos', async ({ page, homePage }) => {
    await mockPlateLookup(page, plateApiResponses.insufficientCredits());
    await homePage.goto();
    await expect(homePage.buyCreditsButton).toBeHidden();

    await homePage.searchPlate(VALID_PLATE);

    await expect(homePage.searchError).toHaveText('Você não possui créditos suficientes.');
    await expect(homePage.buyCreditsButton).toBeVisible();
  });

  test('CT-13 fornecedor fora do ar (HTTP 503) exibe mensagem de indisponibilidade', async ({
    page,
    homePage,
  }) => {
    await mockPlateLookup(page, plateApiResponses.providerDown());
    await homePage.goto();

    await homePage.searchPlate(VALID_PLATE);

    await expect(homePage.searchError).toHaveText(/temporariamente indisponível/);
  });

  test('CT-14 erro inesperado (HTTP 500) exibe mensagem genérica e libera o formulário', async ({
    page,
    homePage,
  }) => {
    await mockPlateLookup(page, plateApiResponses.unexpected());
    await homePage.goto();

    await homePage.searchPlate(VALID_PLATE);

    await expect(homePage.searchError).toHaveText('Não foi possível consultar a placa.');
    await expect(homePage.plateInput).toBeEnabled();
    await expect(homePage.searchButton).toBeEnabled();
  });

  test('CT-15 durante a consulta o formulário fica bloqueado contra envio duplo', async ({ page, homePage }) => {
    const lookup = await mockPlateLookupHanging(page);
    await homePage.goto();

    await homePage.searchPlate(VALID_PLATE);

    await expect(homePage.searchButton).toBeDisabled();
    await expect(homePage.plateInput).toBeDisabled();
    await expect(page.locator('#plate-search-form')).toHaveAttribute('aria-busy', 'true');
    expect(lookup.requests).toHaveLength(1);
  });

  test('CT-16 consulta sem resposta é cancelada após 35 segundos', async ({ page, homePage }) => {
    // Relógio falso: o teste avança 35s em milissegundos em vez de esperar de verdade.
    await page.clock.install();
    await mockPlateLookupHanging(page);
    await homePage.goto();

    await homePage.searchPlate(VALID_PLATE);
    await expect(homePage.searchButton).toBeDisabled();

    await page.clock.runFor(35_000);

    await expect(homePage.searchError).toHaveText('A consulta demorou demais. Tente novamente em instantes.');
    await expect(homePage.searchButton).toBeEnabled();
  });
});
