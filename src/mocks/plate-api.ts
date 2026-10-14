import type { Page, Route } from '@playwright/test';
import { env } from '../config/env';
import { apiPaths } from '../config/routes';

/** Formato observado em /api/placa/consultar (prévia, sem desbloqueio). */
export type PlatePreview = {
  placa: string;
  marca: string;
  modelo: string;
  cor: string;
  anoFabricacao: string;
  anoModelo: string;
  cidade: string;
  uf: string;
  tabelaFipe: string;
  chassi: string;
  renavam: string;
  nome: string;
  documento: string;
  telefone: string;
  unlockTier: string | null;
};

export function buildPlatePreview(overrides: Partial<PlatePreview> = {}): PlatePreview {
  return {
    placa: 'QAT1E23',
    marca: 'VOLKSWAGEN',
    modelo: 'GOL 1.6',
    cor: 'PRATA',
    anoFabricacao: '2018',
    anoModelo: '2019',
    cidade: 'JUIZ DE FORA',
    uf: 'MG',
    tabelaFipe: 'R$ 48.900,00',
    chassi: '9BWZZZ377VT004251',
    renavam: '01234567890',
    nome: 'FULANO DE TAL',
    documento: '123.456.789-00',
    telefone: '(32) 99999-0000',
    unlockTier: null,
    ...overrides,
  };
}

type MockResponse = { status: number; body: Record<string, unknown> };

export const plateApiResponses = {
  success: (preview = buildPlatePreview()): MockResponse => ({
    status: 200,
    body: { resultado: preview, consultaId: 'qa-mock-001' },
  }),
  notFound: (): MockResponse => ({
    status: 404,
    body: { code: 'PLACA_NOT_FOUND', message: 'A placa não foi encontrada na base consultada.' },
  }),
  insufficientCredits: (): MockResponse => ({
    status: 402,
    body: { code: 'INSUFFICIENT_CREDITS', message: 'Você não possui créditos suficientes.' },
  }),
  providerDown: (): MockResponse => ({
    status: 503,
    body: {},
  }),
  unexpected: (): MockResponse => ({
    status: 500,
    body: {},
  }),
};

export type PlateLookupMock = {
  /** Corpos JSON enviados ao endpoint, na ordem em que chegaram. */
  requests: Array<{ placa?: string }>;
};

/** Intercepta a consulta de placa e responde sem chegar ao fornecedor. */
export async function mockPlateLookup(page: Page, response: MockResponse): Promise<PlateLookupMock> {
  const mock: PlateLookupMock = { requests: [] };
  await page.route(`${env.apiUrl}${apiPaths.plateLookup}`, async (route: Route) => {
    mock.requests.push(route.request().postDataJSON() ?? {});
    await route.fulfill({
      status: response.status,
      contentType: 'application/json',
      body: JSON.stringify(response.body),
    });
  });
  return mock;
}

/** Segura a requisição sem responder, para exercitar o timeout do front. */
export async function mockPlateLookupHanging(page: Page): Promise<PlateLookupMock> {
  const mock: PlateLookupMock = { requests: [] };
  await page.route(`${env.apiUrl}${apiPaths.plateLookup}`, (route) => {
    mock.requests.push(route.request().postDataJSON() ?? {});
    return new Promise<void>(() => {});
  });
  return mock;
}
