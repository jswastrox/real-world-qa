import type { Locator, Page } from '@playwright/test';
import { routes } from '../config/routes';
import type { PlatePreview } from '../mocks/plate-api';

export class PlateResultPage {
  readonly successBanner: Locator;
  readonly vehicleCard: Locator;
  readonly unlockCta: Locator;
  readonly notFoundHeading: Locator;
  readonly newSearchButton: Locator;

  constructor(private readonly page: Page) {
    this.successBanner = page.locator('.plate-result-success');
    this.vehicleCard = page.locator('.plate-card').filter({ hasText: 'Dados do veículo' });
    this.unlockCta = page.locator('.plate-unlock-cta-block .plate-unlock-cta');
    this.notFoundHeading = page.getByRole('heading', { name: 'Resultado não encontrado' });
    this.newSearchButton = page.locator('#plate-nova-pesquisa-btn');
  }

  /** Abre a página de resultado com uma prévia já gravada, como o front faz após a consulta. */
  async openWithPreview(preview: PlatePreview, consultaId = 'qa-mock-001') {
    await this.page.addInitScript(
      ([resultado, id]) => {
        sessionStorage.setItem('placaConsultaResultado', JSON.stringify(resultado));
        sessionStorage.setItem('placaConsultaId', id);
      },
      [preview, consultaId] as const,
    );
    await this.page.goto(routes.plateResult);
  }

  field(label: string): Locator {
    return this.page
      .locator('.plate-field')
      .filter({ has: this.page.locator('dt', { hasText: new RegExp(`^\\s*${label}\\s*$`) }) });
  }
}
