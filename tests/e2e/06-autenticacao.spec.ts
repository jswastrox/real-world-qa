import { test, expect } from '../../src/fixtures/test';
import { AUTH_STATE } from '../../src/config/auth';
import { hasTestUser, env } from '../../src/config/env';
import { apiPaths, routes } from '../../src/config/routes';

test.describe('Autenticação: visitante', () => {
  test('CT-24 login com credenciais inválidas mostra erro e não cria sessão', { tag: '@smoke' }, async ({
    page,
    loginPage,
  }) => {
    await loginPage.goto();

    // E-mail inexistente: não arrisca bloquear a conta de teste por tentativas erradas.
    await loginPage.login(`qa-inexistente-${Date.now()}@example.com`, 'SenhaErrada!123');

    await expect(loginPage.error).toBeVisible();
    await expect(loginPage.error).not.toBeEmpty();
    await expect(page).toHaveURL(new RegExp(`${routes.login}$`));
    const token = await page.evaluate(() => localStorage.getItem('authToken') ?? sessionStorage.getItem('authToken'));
    expect(token).toBeNull();
  });

  test('CT-25 sessão expirada é comunicada na tela de login', async ({ loginPage }) => {
    await loginPage.goto('?reason=session_expired');

    await expect(loginPage.error).toHaveText('Sua sessão expirou por segurança, faça login novamente.');
  });

  test('CT-26 área do usuário exige login', async ({ page }) => {
    await page.goto(routes.userArea);

    await expect(page).toHaveURL(/\/login\//);
  });

  test('CT-27 cadastro só habilita o envio após aceitar os Termos de Uso', async ({ page }) => {
    await page.goto(routes.signup);
    const submit = page.getByRole('button', { name: 'Cadastrar-se' });
    const terms = page.getByRole('checkbox', { name: /Li e concordo com os Termos de Uso/ });

    await page.getByRole('textbox', { name: 'Usuario' }).fill('qa_nao_enviar');
    await page.getByRole('textbox', { name: 'E-mail' }).fill('qa-nao-enviar@example.com');
    await page.getByRole('textbox', { name: 'Senha' }).fill('NaoEnviar!123');
    await expect(submit).toBeDisabled();

    await terms.check();
    await expect(submit).toBeEnabled();

    await terms.uncheck();
    await expect(submit).toBeDisabled();
  });
});

test.describe('Autenticação: usuário logado', () => {
  test.skip(!hasTestUser, 'conta de teste não configurada');
  test.use({ storageState: AUTH_STATE });

  test('CT-28 cabeçalho mostra saudação e saldo zerado da conta de teste', { tag: '@smoke' }, async ({
    page,
    homePage,
  }) => {
    await homePage.goto();

    await expect(page.locator('#user-menu-trigger')).toContainText('Olá');
    await expect(page.locator('#user-credits-value')).toHaveText(/R\$\s?0,00/);
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeHidden();
  });

  test('CT-29 logout limpa a sessão e volta para a home', async ({ page, homePage }) => {
    // O logout real invalidaria a sessão compartilhada pelos outros testes em paralelo.
    let logoutCalled = false;
    await page.route(`${env.apiUrl}${apiPaths.logout}`, (route) => {
      logoutCalled = true;
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await homePage.goto();

    await page.locator('#user-menu-trigger').click();
    await page.locator('#user-menu-logout-btn').click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible();
    expect(logoutCalled).toBe(true);
    expect(await page.evaluate(() => localStorage.getItem('authToken'))).toBeNull();
  });
});
