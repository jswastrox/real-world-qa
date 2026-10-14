# Real World QA — placaveicular.online

Estratégia de qualidade e automação de testes de um **SaaS de consulta veicular em produção**: E2E, API,
mobile e acessibilidade, com Playwright e TypeScript.

[![Playwright](https://img.shields.io/badge/Playwright-1.64-2EAD33?logo=playwright)](https://playwright.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](tsconfig.json)
[![Relatório](https://img.shields.io/badge/relatório-última%20execução-blue)](https://jswastrox.github.io/real-world-qa/)

## Por que este projeto é diferente

A maioria dos portfólios de QA testa sites de demonstração. Este testa um **produto real, em produção**,
com login, créditos, pagamento PIX e uma API que custa dinheiro a cada chamada. Isso obrigou a suíte a
resolver problemas que aparecem no dia a dia de um time de QA:

- **Como testar em produção sem gerar custo nem sujar métricas?** Uma trava de segurança aplicada a todos
  os testes aborta qualquer escrita na API e bloqueia trackers de anúncios
  ([ADR 0002](docs/adr/0002-testar-em-producao-com-trava.md)). O próprio CT-32 prova que ela funciona,
  clicando num pacote real de créditos.
- **Como testar erros que não dá para provocar em produção?** Fornecedor fora do ar, falta de créditos e
  timeout de 35 s são simulados na camada de rede. O timeout roda em cerca de 1 s com o relógio falso do
  Playwright.
- **O que fazer com os defeitos encontrados?** A suíte encontrou [2 defeitos, 2 problemas de
  acessibilidade e 1 de UX](docs/defeitos-encontrados.md) no site. Eles ficam registrados e marcados com `test.fail()`, e os
  testes avisam sozinhos quando os defeitos forem corrigidos
  ([ADR 0003](docs/adr/0003-defeitos-conhecidos-com-test-fail.md)).

## Números

| | |
| --- | --- |
| Cenários E2E | 37 (desktop Chromium + Pixel 7) |
| Testes de API | 7 (contrato com zod e controle de acesso) |
| Acessibilidade | 5 páginas (axe-core, WCAG 2.1 AA) |
| Testes manuais documentados | 2 (fluxos que geram cobrança ou e-mail real) |
| Execução completa | menos de 1 minuto (61 testes, 4 workers) |

📊 **[Relatório HTML da última execução](https://jswastrox.github.io/real-world-qa/)**

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [Estratégia de testes](docs/estrategia-de-testes.md) | Análise de risco, camadas, o que não é automatizado e por quê, critérios de aprovação, política para testes instáveis |
| [Cenários em Gherkin](docs/cenarios/) | Um arquivo por spec, no formato Dado/Quando/Então |
| [Defeitos encontrados](docs/defeitos-encontrados.md) | Defeitos reais com passos, impacto e sugestão de correção |
| [Testes manuais](docs/testes-manuais/) | Roteiros para pagamento PIX e recuperação de senha |
| [Decisões técnicas (ADRs)](docs/adr/) | Playwright + TS, teste em produção com trava, defeitos conhecidos |

## Cenários automatizados

| ID | Spec | O que garante |
| --- | --- | --- |
| CT-01 a CT-06, CT-36 | [`01-home-navegacao`](tests/e2e/01-home-navegacao.spec.ts) | Home sem erros de JS, menu, 7 páginas legais, nenhum link quebrado, FAQ, transparência (CNPJ/DETRAN), CSP |
| CT-07 a CT-10, CT-37 | [`02-validacao-placa`](tests/e2e/02-validacao-placa.spec.ts) | Padrões antigo e Mercosul, normalização, placa inválida nunca chega à API |
| CT-11 a CT-16 | [`03-consulta-cenarios-de-erro`](tests/e2e/03-consulta-cenarios-de-erro.spec.ts) | Respostas 404, 402, 500 e 503, envio duplo, timeout |
| CT-17 a CT-21 | [`04-resultado-previa`](tests/e2e/04-resultado-previa.spec.ts) | Prévia gratuita, **dados pagos não vazam antes do pagamento**, fluxo de desbloqueio |
| CT-22 a CT-23 | [`05-consentimento-cookies`](tests/e2e/05-consentimento-cookies.spec.ts) | Banner LGPD, escolha gravada e respeitada |
| CT-24 a CT-29 | [`06-autenticacao`](tests/e2e/06-autenticacao.spec.ts) | Login inválido, sessão expirada, rota protegida, aceite de termos, sessão logada, logout |
| CT-30 a CT-32 | [`07-conta-e-creditos`](tests/e2e/07-conta-e-creditos.spec.ts) | Histórico, pacotes de créditos, trava contra PIX real |
| CT-33 a CT-35 | [`08-mobile`](tests/e2e/08-mobile.spec.ts) | Menu hambúrguer, consulta no celular, sem rolagem horizontal |
| API-01 a API-06 | [`apiveicular`](tests/api/apiveicular.spec.ts) | Contrato, tokens ausentes ou adulterados, endpoint financeiro protegido |
| A11Y | [`acessibilidade`](tests/a11y/acessibilidade.spec.ts) | Nenhuma violação crítica de WCAG 2.1 AA |

## Arquitetura

```
.
├── .github/workflows/qa.yml        # CI manual (workflow_dispatch): completa, smoke ou cross-browser
├── playwright.config.ts            # projetos: setup, desktop, mobile, api, a11y, firefox, webkit
├── src/
│   ├── safety/production-guard.ts  # trava: bloqueia escrita na API, analytics e trackers
│   ├── fixtures/test.ts            # fixture base: trava automática, consentimento, erros de console, page objects
│   ├── pages/                      # page objects (Home, Login, Resultado)
│   ├── mocks/plate-api.ts          # respostas simuladas da consulta de placa
│   ├── api/                        # schemas zod e leitura do token do setup
│   └── config/                     # ambiente, rotas, defeitos conhecidos
├── tests/
│   ├── auth.setup.ts               # login único, sessão reaproveitada pelos testes logados
│   ├── e2e/                        # 8 specs numeradas
│   ├── api/
│   └── a11y/
└── docs/                           # estratégia, cenários, defeitos, testes manuais, ADRs
```

Princípios aplicados:
- Seletores por papel acessível (`getByRole`), depois IDs estáveis do site. Classes CSS só em último caso.
- Sem `waitForTimeout`: toda espera é baseada em estado.
- `retries: 0`: contra produção, uma nova tentativa automática esconderia instabilidade real.
- Cada teste é independente e cria o próprio estado.
- Evidências em toda falha: screenshot, vídeo e trace.

## Como rodar

Requisitos: Node.js 20+.

```bash
npm ci
npx playwright install chromium
cp .env.example .env   # preencha TEST_USER_EMAIL e TEST_USER_PASSWORD (opcional)
```

```bash
npm test                    # suíte completa: E2E desktop + mobile, API, acessibilidade
npm run test:e2e            # só E2E
npm run test:api            # só API
npm run test:a11y           # só acessibilidade
npm run test:cross-browser  # testes @smoke no Firefox e no WebKit
npm run test:ui             # modo interativo
npm run report              # abre o último relatório HTML
npm run typecheck           # checagem de tipos, sem acessar o site
```

Sem credenciais no `.env`, os cenários logados são pulados automaticamente.

> ⚠️ Os testes rodam contra o site em produção. A trava de segurança impede custo e impacto em métricas,
> mas a execução foi pensada para ser **pontual**, não contínua.

## CI

[`qa.yml`](.github/workflows/qa.yml) roda **apenas manualmente** (Actions → "QA — execução sob demanda" →
Run workflow), com três opções: suíte completa, só `@smoke`, ou cross-browser. As credenciais vêm de GitHub
Secrets (`TEST_USER_EMAIL`, `TEST_USER_PASSWORD`). O relatório HTML fica como artefato por 30 dias.

## Uso de IA

Usei IA (Cursor + Claude) como par de programação neste projeto, como faço no trabalho: para acelerar a
leitura do JavaScript do site, gerar a primeira versão dos page objects e dos cenários e escrever a
documentação. As decisões de estratégia, a análise de risco, a trava de produção e a análise de cada falha
da primeira execução foram revisadas e validadas por mim. Exemplo concreto: na primeira execução, 10 testes
falharam. A investigação separou **2 defeitos reais do site** de **8 problemas da própria suíte** (um setup
de login com verificação fraca demais, um seletor ambíguo e premissas erradas sobre a validação nativa do
navegador), e cada um foi tratado de forma diferente.

## Sobre mim

**Jonathan dos Santos**, Engenheiro de QA Sênior. São mais de 9 anos em qualidade de software, com
liderança de QA (CESAR e Projetus TI), automação com Playwright, Cypress, Selenium e Robot Framework, CI/CD
no GitLab e no Jenkins, time internacional (WEX) e, mais recentemente, testes com apoio de IA.

[LinkedIn](https://linkedin.com/in/jonathan-dos-santos-72a7b512a)
