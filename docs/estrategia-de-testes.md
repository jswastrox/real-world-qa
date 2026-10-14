# Estratégia de testes

## Produto sob teste

[placaveicular.online](https://placaveicular.online) é um SaaS de consulta veicular por placa. O usuário
informa a placa, vê uma **prévia gratuita** e desbloqueia o relatório completo com **créditos comprados
via PIX**. O front é um site estático (HTML + JavaScript puro) que consome a API
`api.apiveicular.online`, compartilhada por outros sites da mesma operação.

## Restrição que molda tudo: os testes rodam em produção

Não existe ambiente de homologação. Isso traz três riscos que a suíte precisa neutralizar:

| Risco | Consequência | Como a suíte evita |
| --- | --- | --- |
| Consulta de placa real | Custo por placa no fornecedor de dados | Toda chamada a `/api/placa/consultar` é simulada (`page.route`) |
| Clique em "Pagar com PIX" | Cobrança real gerada | Trava de produção aborta qualquer `POST/PUT/PATCH/DELETE` não liberado (CT-32 prova que funciona) |
| Tráfego de teste nas métricas | Google Ads, Meta, Bing e o KPI de visitantes do admin distorcidos | Trackers e `/api/analytics/*` bloqueados em todos os testes; consentimento de cookies pré-definido como "recusado" |

A trava fica em [`src/safety/production-guard.ts`](../src/safety/production-guard.ts) e é aplicada
automaticamente por uma fixture — nenhum teste precisa lembrar de ligá-la. Cada teste anexa ao relatório a
lista de requisições bloqueadas, o que torna a proteção auditável.

Também por isso a execução é **manual e pontual** (`workflow_dispatch`), não em cada push ou agendada.

## Análise de risco

Prioridade = impacto no negócio × probabilidade de falha.

| Área | Impacto | Prob. | Prioridade | Cobertura |
| --- | --- | --- | --- | --- |
| Consulta de placa (prévia) | Alto — é a porta de entrada da receita | Média | **Alta** | E2E com respostas simuladas: sucesso, 404, 402, 500, 503, timeout, envio duplo |
| Dados pagos expostos sem pagamento | Alto — perda de receita e exposição de dados pessoais (LGPD) | Baixa | **Alta** | CT-18 verifica que chassi, RENAVAM, nome, documento e telefone não aparecem na prévia |
| Validação de placa | Médio — consulta desperdiçada ou usuário travado | Média | **Alta** | Padrões antigo e Mercosul, normalização, casos inválidos |
| Autenticação e controle de acesso | Alto | Baixa | **Alta** | E2E de login/logout/rotas protegidas + API recusando tokens ausentes ou adulterados |
| Endpoint financeiro do Controller | Alto — vazamento de receita e lucro | Baixa | **Alta** | API-05: sem chave ou com chave inválida, recusa sem vazar números |
| Compra de créditos | Alto | Média | Média | Listagem de pacotes; o fluxo PIX completo é teste manual (gera cobrança) |
| Consentimento de cookies (LGPD) | Médio — risco regulatório | Baixa | Média | Banner, gravação da escolha, persistência |
| Páginas legais e links | Médio — exigência de Google Ads e do CDC | Baixa | Média | Status 200, título, nenhum link interno quebrado |
| Acessibilidade | Médio | Média | Média | axe-core (WCAG 2.1 AA) em 5 páginas |
| Mobile | Alto — maior parte do tráfego vem de anúncios no celular | Média | Média | Menu, consulta e ausência de rolagem horizontal em Pixel 7 |

## Camadas

```
            ┌───────────────────────────┐
            │  Manual / exploratório    │  fluxo PIX completo, recuperação de senha
            ├───────────────────────────┤
            │  E2E (Playwright)         │  37 cenários, desktop + mobile
            ├───────────────────────────┤
            │  API (Playwright request) │  contrato (zod), controle de acesso
            ├───────────────────────────┤
            │  Acessibilidade (axe)     │  WCAG 2.1 A/AA
            └───────────────────────────┘
```

Não há testes unitários: o código do site não faz parte deste repositório. A suíte é **caixa-preta**,
como seria para um time de QA externo.

## Por que respostas simuladas e não dados reais

O que está sob teste na consulta é **o comportamento do front diante de cada resposta possível** da API.
Simular as respostas dá controle total sobre cenários difíceis de reproduzir em produção (fornecedor fora
do ar, timeout de 35 s, falta de créditos) e elimina o custo. O contrato real da API é coberto
separadamente, nos testes de API, apenas com endpoints de leitura.

O timeout de 35 s é testado com o relógio falso do Playwright (`page.clock`): o teste leva cerca de 1 s.

## O que fica fora da automação, e por quê

| Fluxo | Motivo | Onde está |
| --- | --- | --- |
| Pagamento PIX de ponta a ponta | Gera cobrança real; não há sandbox do gateway | [Teste manual](testes-manuais/compra-de-creditos-pix.md) |
| Desbloqueio de relatório | Depende de créditos pagos | [Teste manual](testes-manuais/compra-de-creditos-pix.md) |
| Cadastro de conta | Criaria uma conta nova a cada execução | CT-27 cobre a regra do formulário sem enviar |
| Recuperação de senha | Envia e-mail real | [Teste manual](testes-manuais/recuperacao-de-senha.md) |
| Carga e estresse | Produção, sem ambiente isolado | Próximo passo, se houver homologação |

## Critérios de aprovação

- Todos os testes E2E e de API passam.
- Nenhuma violação de acessibilidade com impacto **critical**. Violações "serious" ou menores ficam anexadas
  ao relatório para priorização, sem bloquear.
- Defeitos conhecidos ficam registrados em [defeitos-encontrados.md](defeitos-encontrados.md) e marcados com
  `test.fail()`. Quando o defeito é corrigido, o teste passa a reprovar ("unexpected pass"), avisando que a
  marcação deve ser removida.

## Testes instáveis (flaky)

- `retries: 0`. Contra produção, uma nova tentativa automática esconderia instabilidade real do site.
- Nenhum `waitForTimeout`. Toda espera é baseada em estado (`expect` com nova tentativa automática,
  `waitForResponse`, `expect.poll`).
- Seletores por papel acessível (`getByRole`) primeiro, IDs estáveis do site depois. Classes CSS só quando
  não há alternativa.
- Testes independentes: cada um cria seu próprio estado (`sessionStorage` injetado, rotas simuladas) e pode
  rodar sozinho ou em paralelo.
- A sessão logada é criada **uma vez**, no projeto `setup`, e reaproveitada (`storageState`). O logout é
  simulado para não derrubar a sessão compartilhada pelos testes em paralelo.
