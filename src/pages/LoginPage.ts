import type { Locator, Page } from '@playwright/test';
import { routes } from '../config/routes';

export class LoginPage {
  readonly heading: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly keepSession: Locator;
  readonly submit: Locator;
  readonly error: Locator;
  readonly signupLink: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Acesse sua conta' });
    this.email = page.getByRole('textbox', { name: 'E-mail' });
    this.password = page.getByRole('textbox', { name: 'Senha' });
    this.keepSession = page.getByRole('checkbox', { name: 'Manter sessão' });
    this.submit = page.getByRole('button', { name: 'Entrar na plataforma' });
    this.error = page.locator('.auth-portal-alerts .error');
    this.signupLink = page.getByRole('link', { name: 'Criar conta gratuita' });
  }

  async goto(query = '') {
    await this.page.goto(`${routes.login}${query}`);
  }

  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
