# 04 — Página de resultado (prévia gratuita)

Spec: [`tests/e2e/04-resultado-previa.spec.ts`](../../tests/e2e/04-resultado-previa.spec.ts)

```gherkin
Funcionalidade: Prévia gratuita do resultado
  Para confirmar que é o veículo certo antes de pagar
  Como visitante
  Quero ver os dados públicos do veículo e entender o que o desbloqueio libera

  Cenário: CT-17 Dados públicos visíveis
    Dado que a consulta retornou um veículo
    Então vejo marca, modelo, cor e UF

  Cenário: CT-18 Dados pagos protegidos
    Dado que a consulta retornou um veículo
    Então chassi, RENAVAM, nome, documento e telefone não aparecem na tela
    E vejo o botão "Desbloquear Informações"

  Cenário: CT-19 Visitante tenta desbloquear
    Dado que não estou logado
    Quando clico em desbloquear
    Então não sou levado direto ao pagamento
    E sou convidado a me identificar primeiro

  Cenário: CT-20 Acesso direto sem consulta
    Quando abro a página de resultado sem ter consultado
    Então vejo "Resultado não encontrado"
    E o botão "Nova pesquisa" me leva à home

  Cenário: CT-21 Confirmação antes de descartar
    Dado que estou vendo um resultado
    Quando clico em "Nova pesquisa"
    Então preciso confirmar a saída
    E "Permanecer" mantém o resultado
    E "Sair" me leva à home
```
