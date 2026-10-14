import { test as base, expect } from '@playwright/test';
import { installProductionGuard, type BlockedRequest } from '../safety/production-guard';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { PlateResultPage } from '../pages/PlateResultPage';

export const CONSENT_STORAGE_KEY = 'pap_analytics_consent';

type Options = {
  /** 'denied' esconde o banner e mantém trackers desligados; 'unset' simula o primeiro acesso. */
  cookieConsent: 'denied' | 'unset';
};

type Fixtures = {
  blockedRequests: BlockedRequest[];
  consoleErrors: string[];
  cspViolations: string[];
  homePage: HomePage;
  loginPage: LoginPage;
  plateResultPage: PlateResultPage;
};

export const test = base.extend<Options & Fixtures>({
  cookieConsent: ['denied', { option: true }],

  blockedRequests: [
    async ({ context }, use, testInfo) => {
      const blocked = await installProductionGuard(context);
      await use(blocked);
      if (blocked.length > 0) {
        await testInfo.attach('requisicoes-bloqueadas.json', {
          body: JSON.stringify(blocked, null, 2),
          contentType: 'application/json',
        });
      }
    },
    { auto: true },
  ],

  cspViolations: async ({ page }, use) => {
    const violations: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error' && message.text().includes('Content Security Policy')) {
        violations.push(message.text());
      }
    });
    await use(violations);
  },

  consoleErrors: [
    async ({ page }, use, testInfo) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
      page.on('console', (message) => {
        if (message.type() !== 'error') return;
        const text = message.text();
        // Falhas causadas pelo próprio bloqueio de trackers não são defeitos do site.
        if (/ERR_BLOCKED_BY_CLIENT|net::ERR_FAILED/.test(text)) return;
        // Violações de CSP são verificadas à parte (ver cspViolations / DEF-01).
        if (text.includes('Content Security Policy')) return;
        errors.push(`console: ${text}`);
      });
      await use(errors);
      if (errors.length > 0) {
        await testInfo.attach('erros-de-console.txt', { body: errors.join('\n'), contentType: 'text/plain' });
      }
    },
    { auto: true },
  ],

  page: async ({ page, cookieConsent }, use) => {
    if (cookieConsent === 'denied') {
      await page.addInitScript((key) => {
        if (!localStorage.getItem(key)) localStorage.setItem(key, 'denied');
      }, CONSENT_STORAGE_KEY);
    }
    await use(page);
  },

  homePage: async ({ page }, use) => use(new HomePage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  plateResultPage: async ({ page }, use) => use(new PlateResultPage(page)),
});

export { expect };
