import { test, expect } from '@playwright/test';
import { env, hasTestUser } from '../../src/config/env';
import { apiPaths } from '../../src/config/routes';
import { readAuthToken } from '../../src/api/auth-token';
import { creditsFrom, errorBodySchema, profileSchema, publicSettingsSchema } from '../../src/api/schemas';

/**
 * Só endpoints de leitura ou que devem ser recusados. A consulta de placa real
 * (/api/placa/consultar) não é chamada aqui porque gera custo no fornecedor.
 */
test.use({ baseURL: env.apiUrl });

test.describe('API pública', () => {
  test('API-01 configurações públicas respondem 200 com contrato válido', async ({ request }) => {
    const started = Date.now();
    const response = await request.get(apiPaths.publicSettings);
    const elapsed = Date.now() - started;

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const parsed = publicSettingsSchema.safeParse(await response.json());
    expect(parsed.success, JSON.stringify(parsed.error?.issues)).toBe(true);
    expect.soft(elapsed, 'tempo de resposta (ms)').toBeLessThan(2_000);
  });
});

test.describe('Controle de acesso', () => {
  test('API-02 perfil sem token é recusado', async ({ request }) => {
    const response = await request.get(apiPaths.profile);

    expect(response.status()).toBe(401);
    expect(errorBodySchema.safeParse(await response.json().catch(() => ({}))).success).toBe(true);
  });

  test('API-03 perfil com token adulterado é recusado', async ({ request }) => {
    const response = await request.get(apiPaths.profile, {
      headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.assinatura-invalida' },
    });

    expect(response.status()).toBe(401);
  });

  test('API-04 histórico de consultas sem token é recusado', async ({ request }) => {
    const response = await request.get(apiPaths.userLookups);

    expect([401, 403]).toContain(response.status());
  });

  for (const { label, headers } of [
    { label: 'sem chave', headers: {} },
    { label: 'com chave inválida', headers: { 'X-Controller-Api-Key': 'chave-invalida-qa' } },
  ]) {
    test(`API-05 resumo financeiro do Controller ${label} é recusado`, async ({ request }) => {
      const response = await request.get(apiPaths.controllerSummary, {
        params: { from: '2026-01-01', to: '2026-01-31', site: 'placaveicular' },
        headers,
      });

      expect([401, 403]).toContain(response.status());
      const body = await response.text();
      expect(body, 'resposta recusada não pode vazar números financeiros').not.toMatch(/receitaBruta|lucro/);
    });
  }
});

test.describe('API autenticada', () => {
  test.skip(!hasTestUser, 'conta de teste não configurada');

  test('API-06 perfil da conta de teste respeita o contrato e tem saldo zero', async ({ request }) => {
    const token = readAuthToken();
    test.skip(!token, 'token não encontrado no estado salvo pelo setup');

    const response = await request.get(apiPaths.profile, { headers: { Authorization: `Bearer ${token}` } });

    expect(response.status()).toBe(200);
    const parsed = profileSchema.safeParse(await response.json());
    expect(parsed.success, JSON.stringify(parsed.error?.issues)).toBe(true);
    expect(creditsFrom(parsed.data!)).toBe(0);
  });
});
