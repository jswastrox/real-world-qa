# ADR 0003 — Defeitos conhecidos marcados com `test.fail()`

**Status:** aceita

## Contexto

A suíte encontrou defeitos reais no site (ver [defeitos-encontrados.md](../defeitos-encontrados.md)).
Deixar esses testes vermelhos esconderia regressões novas no meio de falhas já conhecidas. Apagar ou pular
os testes faria o defeito ser esquecido.

## Decisão

O teste continua verificando o comportamento **correto** e recebe `test.fail()` com o ID do defeito,
centralizado em [`known-defects.ts`](../../src/config/known-defects.ts).

## Consequências

- A execução fica verde enquanto o defeito é conhecido e está registrado.
- Quando o site for corrigido, o teste reprova com "expected to fail, but passed". É o aviso para fechar o
  defeito e remover a marcação.
- O relatório HTML mostra a anotação "defeito conhecido" em cada teste afetado.
