import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../src/fixtures/test';
import { routes } from '../../src/config/routes';

/**
 * Critério de bloqueio: nenhuma violação "critical" das regras WCAG 2.1 A/AA.
 * Violações "serious" e menores entram no relatório para priorização, sem
 * reprovar a execução.
 */
const pages = [
  { name: 'Home', path: routes.home },
  { name: 'Login', path: routes.login },
  { name: 'Cadastro', path: routes.signup },
  { name: 'Contato', path: routes.contact },
  { name: 'Política de Privacidade', path: '/politica-privacidade/' },
];

for (const target of pages) {
  test(`A11Y ${target.name} não tem violações críticas de WCAG 2.1 AA`, async ({ page }, testInfo) => {
    await page.goto(target.path);
    await expect(page.getByRole('heading').first()).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const summary = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.length,
    }));
    await testInfo.attach('axe-violacoes.json', {
      body: JSON.stringify(summary, null, 2),
      contentType: 'application/json',
    });

    const critical = summary.filter((v) => v.impact === 'critical');
    expect(critical, 'violações críticas de acessibilidade').toEqual([]);
  });
}
