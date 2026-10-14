# ADR 0002 — Testar em produção com uma trava de segurança

**Status:** aceita

## Contexto

O site não tem ambiente de homologação. A consulta de placa custa dinheiro por chamada, a compra de créditos
gera PIX real, e o tráfego alimenta campanhas pagas (Google Ads, Meta, Bing) e o painel de métricas do admin.

## Decisão

1. Toda execução passa por uma trava aplicada automaticamente
   ([`production-guard.ts`](../../src/safety/production-guard.ts)) que:
   - bloqueia os domínios de rastreamento e anúncios;
   - bloqueia `/api/analytics/*` (KPI de visitantes do admin);
   - aborta qualquer `POST/PUT/PATCH/DELETE` na API, exceto login e logout.
2. Respostas de endpoints com custo são **simuladas** no teste (`page.route`), e a rota do teste tem
   prioridade sobre a trava.
3. O consentimento de cookies começa como "recusado" (exceto nos testes do banner).
4. A execução no CI é **manual** (`workflow_dispatch`), nunca em push ou agendada.
5. Execução padrão só com Chromium (desktop) + Pixel 7. Firefox e WebKit rodam apenas os testes `@smoke`,
   sob demanda (`npm run test:cross-browser`).

## Consequências

- Zero custo e zero impacto em métricas por execução. Cada teste anexa ao relatório o que foi bloqueado.
- O CT-32 prova a trava: clica num pacote real e verifica que a criação do pagamento foi abortada.
- Um endpoint novo que altere dados nasce bloqueado. Liberar exige uma decisão explícita em
  `ALLOWED_MUTATIONS`.
- O caminho de pagamento ponta a ponta fica como teste manual documentado.
