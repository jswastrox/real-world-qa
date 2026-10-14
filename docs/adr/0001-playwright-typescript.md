# ADR 0001 — Playwright com TypeScript

**Status:** aceita

## Contexto

Já usei Cypress, Selenium, Robot Framework e Playwright em projetos anteriores. A suíte precisa cobrir E2E,
API, mobile emulado e acessibilidade, e interceptar requisições de rede para não gerar custo em produção.

## Decisão

Playwright com TypeScript, num único runner para todas as camadas.

## Motivos

- **Interceptação de rede no nível do contexto do navegador** (`context.route`): é a base da trava de
  produção, aplicada uma vez numa fixture e valendo para todas as páginas e abas do teste.
- **API e E2E no mesmo runner** (`request` fixture): um relatório só, a mesma configuração e o mesmo CI.
- **Relógio falso** (`page.clock`): testa o timeout de 35 s em cerca de 1 s.
- **Projetos** para separar desktop, mobile, API e acessibilidade, com dependência explícita do login (`setup`).
- **TypeScript**: os contratos da API (zod) e as fixtures ficam tipados, e erros aparecem no `tsc`, antes da
  execução contra produção.

## Consequências

- Firefox e WebKit ficam configurados, mas fora da execução padrão (ver ADR 0002).
- Quem mantiver a suíte precisa de familiaridade com async/await e fixtures do Playwright.
