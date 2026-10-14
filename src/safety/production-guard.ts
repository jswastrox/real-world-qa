import type { BrowserContext, Route } from '@playwright/test';
import { env } from '../config/env';
import { apiPaths } from '../config/routes';

/**
 * Os testes rodam contra produção. Esta camada garante que nenhum teste:
 *  - gere custo (consulta de placa no fornecedor, cobrança PIX);
 *  - polua métricas de negócio (Google Analytics/Ads, Meta, Bing, OpenAI Ads,
 *    KPI de visitantes do painel admin).
 *
 * Regra: qualquer requisição que altere estado na API é abortada, exceto as que
 * estão em ALLOWED_MUTATIONS. Testes que precisam de outras respostas devem
 * simulá-las com `page.route` (rotas registradas depois têm prioridade).
 */

const TRACKER_HOSTS = [
  'googletagmanager.com',
  'google-analytics.com',
  'googleadservices.com',
  'googlesyndication.com',
  'doubleclick.net',
  'connect.facebook.net',
  'facebook.com/tr',
  'bat.bing.com',
  'clarity.ms',
  'oaiusercontent.com',
  'openai.com',
];

const ALLOWED_MUTATIONS = [apiPaths.login, apiPaths.logout];

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export type BlockedRequest = { method: string; url: string; reason: string };

export async function installProductionGuard(context: BrowserContext): Promise<BlockedRequest[]> {
  const blocked: BlockedRequest[] = [];

  const block = (route: Route, reason: string) => {
    const request = route.request();
    blocked.push({ method: request.method(), url: request.url(), reason });
    return route.abort('blockedbyclient');
  };

  await context.route(
    (url) => TRACKER_HOSTS.some((host) => url.href.includes(host)),
    (route) => block(route, 'tracker'),
  );

  await context.route(`${env.apiUrl}/**`, (route) => {
    const request = route.request();
    const { pathname } = new URL(request.url());

    if (pathname.startsWith('/api/analytics/')) {
      return block(route, 'analytics');
    }
    if (MUTATING_METHODS.has(request.method()) && !ALLOWED_MUTATIONS.some((p) => pathname === p)) {
      return block(route, 'mutation');
    }
    return route.continue();
  });

  return blocked;
}
