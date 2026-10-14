# 03 — Consulta de placa: respostas da API

Spec: [`tests/e2e/03-consulta-cenarios-de-erro.spec.ts`](../../tests/e2e/03-consulta-cenarios-de-erro.spec.ts)

Todas as respostas da API são simuladas, porque a consulta real tem custo por placa. O que está sob teste
é a reação do site a cada resposta.

```gherkin
Funcionalidade: Tratamento das respostas da consulta
  Para entender o que aconteceu e o que fazer em seguida
  Como visitante
  Quero mensagens claras quando a consulta não dá certo

  Contexto:
    Dado que estou na home
    E consulto uma placa em formato válido

  Cenário: CT-11 Placa não encontrada
    Dado que a API responde 404 com o código PLACA_NOT_FOUND
    Então vejo "A placa não foi encontrada na base consultada."
    E continuo na home com o botão de consulta habilitado

  Cenário: CT-12 Sem créditos
    Dado que a API responde 402 com o código INSUFFICIENT_CREDITS
    Então vejo a mensagem da API
    E aparece o botão para comprar créditos

  Cenário: CT-13 Fornecedor indisponível
    Dado que a API responde 503
    Então vejo que o serviço está temporariamente indisponível

  Cenário: CT-14 Erro inesperado
    Dado que a API responde 500 sem corpo
    Então vejo "Não foi possível consultar a placa."
    E o formulário é liberado para uma nova tentativa

  Cenário: CT-15 Proteção contra envio duplo
    Dado que a API ainda não respondeu
    Então o campo e o botão ficam desabilitados
    E o formulário indica que está ocupado (aria-busy)
    E só uma consulta foi enviada

  Cenário: CT-16 Timeout
    Dado que a API não responde
    Quando se passam 35 segundos
    Então vejo "A consulta demorou demais. Tente novamente em instantes."
    E o botão de consulta é liberado
```
