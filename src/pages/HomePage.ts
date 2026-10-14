import type { Locator, Page } from '@playwright/test';
import { routes } from '../config/routes';

export class HomePage {
  readonly heading: Locator;
  readonly plateInput: Locator;
  readonly searchButton: Locator;
  readonly searchError: Locator;
  readonly buyCreditsButton: Locator;
  readonly mainNav: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 });
    this.plateInput = page.getByRole('textbox', { name: 'Digite a placa' });
    this.searchButton = page.getByRole('button', { name: 'Consultar Placa' });
    this.searchError = page.locator('#plate-search-error');
    this.buyCreditsButton = page.locator('#plate-buy-credits-btn');
    this.mainNav = page.getByRole('navigation', { name: 'Navegação principal' });
  }

  async goto() {
    await this.page.goto(routes.home);
  }

  async searchPlate(plate: string) {
    await this.plateInput.fill(plate);
    await this.searchButton.click();
  }
}
