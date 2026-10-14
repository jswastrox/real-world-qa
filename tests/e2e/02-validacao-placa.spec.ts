import { test, expect } from '../../src/fixtures/test';
import { mockPlateLookup, plateApiResponses } from '../../src/mocks/plate-api';

const INVALID_PLATE_MESSAGE = 'Informe uma placa válida, no padrão ABC1D23 ou ABC1234.';

test.describe('Validação do campo de placa', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test('CT-07 campo converte para maiúsculas, remove símbolos e limita a 7 caracteres', async ({ homePage }) => {
    await homePage.plateInput.pressSequentially('abc-1d23');
    await expect(homePage.plateInput).toHaveValue('ABC1D23');

    await homePage.plateInput.fill('');
    await homePage.plateInput.pressSequentially('XYZ 9876 543');
    await expect(homePage.plateInput).toHaveValue('XYZ9876');
  });

  // Todas com 7 caracteres: placas mais curtas são barradas antes, pelo atributo pattern (CT-37).
  const invalidPlates = [
    { plate: '', why: 'campo vazio' },
    { plate: '1234ABC', why: 'números antes das letras' },
    { plate: 'ABC12D3', why: 'letra na posição errada do padrão Mercosul' },
    { plate: 'ABCD123', why: 'quatro letras' },
  ];

  for (const { plate, why } of invalidPlates) {
    test(`CT-08 placa inválida (${why}) mostra erro e não chama a API`, { tag: '@smoke' }, async ({
      page,
      homePage,
    }) => {
      const lookup = await mockPlateLookup(page, plateApiResponses.success());

      await homePage.searchPlate(plate);

      await expect(homePage.searchError).toHaveText(INVALID_PLATE_MESSAGE);
      await expect(homePage.searchError).toHaveAttribute('role', 'alert');
      expect(lookup.requests, 'nenhuma consulta deveria ter sido enviada').toHaveLength(0);
    });
  }

  test('CT-37 placa com menos de 7 caracteres é barrada pela validação nativa do navegador', async ({
    page,
    homePage,
  }) => {
    const lookup = await mockPlateLookup(page, plateApiResponses.success());

    await homePage.searchPlate('AB12');

    const validity = await homePage.plateInput.evaluate((input: HTMLInputElement) => ({
      valid: input.validity.valid,
      patternMismatch: input.validity.patternMismatch,
    }));
    expect(validity).toEqual({ valid: false, patternMismatch: true });
    // Achado de UX: aqui o usuário vê o balão do navegador, não a mensagem do site.
    await expect(homePage.searchError).toBeHidden();
    expect(lookup.requests).toHaveLength(0);
  });

  test('CT-09 erro de validação some quando o usuário volta a digitar', async ({ homePage }) => {
    await homePage.searchPlate('ABCD123');
    await expect(homePage.searchError).toBeVisible();

    await homePage.plateInput.press('End');
    await homePage.plateInput.press('Backspace');
    await expect(homePage.plateInput).toHaveValue('ABCD12');
    await expect(homePage.searchError).toBeHidden();
  });

  const validPlates = [
    { plate: 'ABC1234', pattern: 'antigo' },
    { plate: 'ABC1D23', pattern: 'Mercosul' },
  ];

  for (const { plate, pattern } of validPlates) {
    test(`CT-10 placa no padrão ${pattern} é enviada e abre o resultado`, async ({ page, homePage }) => {
      const lookup = await mockPlateLookup(page, plateApiResponses.success());

      await homePage.searchPlate(plate.toLowerCase());

      await expect(page).toHaveURL(/\/consulta\/placa\/resultado\/$/);
      expect(lookup.requests).toEqual([{ placa: plate }]);
    });
  }
});
