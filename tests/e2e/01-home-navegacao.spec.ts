import { test, expect } from '../../src/fixtures/test';
import { legalPages } from '../../src/config/routes';
import { defect } from '../../src/config/known-defects';

test.describe('Home e navegação', { tag: '@smoke' }, () => {
  test('CT-01 home carrega com o formulário de consulta e sem erros de JavaScript', async ({
    page,
    homePage,
    consoleErrors,
  }) => {
    await homePage.goto();

    await expect(page).toHaveTitle(/Placa Veicular/);
    await expect(homePage.heading).toHaveText(/Consulte as informações do veículo/);
    await expect(homePage.plateInput).toBeVisible();
    await expect(homePage.plateInput).toHaveAttribute('placeholder', /ABC1D23/);
    await expect(homePage.searchButton).toBeEnabled();
    expect.soft(consoleErrors, 'erros de JavaScript na home').toEqual([]);
  });

  test('CT-02 menu principal leva às páginas de Ajuda e Contato', async ({ page, homePage }) => {
    await homePage.goto();

    for (const name of ['Ajuda', 'Contato']) {
      await test.step(name, async () => {
        const link = homePage.mainNav.getByRole('link', { name });
        const href = await link.getAttribute('href');
        expect(href, `link "${name}" sem href`).toBeTruthy();

        await link.click();
        await expect(page).toHaveURL(new RegExp(`${href}$`));
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

        await homePage.goto();
      });
    }
  });

  for (const legal of legalPages) {
    const knownDefect = legal.path === '/politica-reembolso/' ? defect('DEF-02') : undefined;

    test(`CT-03 página legal "${legal.name}" responde 200 e tem título`, {
      annotation: knownDefect ? [knownDefect] : [],
    }, async ({ page }) => {
      test.fail(Boolean(knownDefect), knownDefect?.description);
      const response = await page.goto(legal.path);

      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page).toHaveTitle(/Placa Veicular/);
    });
  }

  test('CT-04 nenhum link interno da home está quebrado', async ({ page, homePage }) => {
    await homePage.goto();

    const hrefs = await page
      .locator('a[href^="/"]')
      .evaluateAll((links) => [...new Set(links.map((a) => a.getAttribute('href') as string))]);
    expect(hrefs.length).toBeGreaterThan(5);

    const broken: string[] = [];
    for (const href of hrefs) {
      const response = await page.request.get(href, { maxRedirects: 5 });
      if (response.status() >= 400) broken.push(`${href} -> ${response.status()}`);
    }
    expect(broken, 'links internos quebrados').toEqual([]);
  });

  test('CT-05 FAQ abre e fecha a resposta ao clicar na pergunta', async ({ page, homePage }) => {
    await homePage.goto();

    const item = page.locator('details.home-faq__item').filter({ hasText: 'A consulta é grátis?' });
    const answer = item.getByText(/prévia da placa pode ser gratuita/);

    await expect(answer).toBeHidden();
    await item.locator('summary').click();
    await expect(item).toHaveAttribute('open', '');
    await expect(answer).toBeVisible();

    await item.locator('summary').click();
    await expect(answer).toBeHidden();
  });

  test('CT-06 aviso de que o serviço é privado e sem vínculo com o DETRAN está visível', async ({
    page,
    homePage,
  }) => {
    await homePage.goto();

    await expect(page.getByText(/Não somos e não temos qualquer tipo de vínculo com DETRAN/)).toBeVisible();
    await expect(page.getByText(/CNPJ 67\.219\.414\/0001-87/).first()).toBeVisible();
  });

  test('CT-36 política de segurança (CSP) permite os scripts de mídia que o próprio site carrega', {
    annotation: [defect('DEF-01')],
  }, async ({ page, homePage, cspViolations }) => {
    test.fail(true, defect('DEF-01').description);
    await homePage.goto();
    // As tags de mídia são injetadas depois do load; networkidle garante que todas tentaram carregar.
    await page.waitForLoadState('networkidle');

    expect(cspViolations, 'scripts barrados pela CSP do próprio site').toEqual([]);
  });
});
