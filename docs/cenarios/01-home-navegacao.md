# 01 — Home e navegação

Spec: [`tests/e2e/01-home-navegacao.spec.ts`](../../tests/e2e/01-home-navegacao.spec.ts)

```gherkin
Funcionalidade: Home e navegação
  Para confiar no serviço antes de pagar
  Como visitante
  Quero encontrar a consulta, as informações legais e a empresa responsável

  Cenário: CT-01 Home carrega sem erros
    Dado que acesso a home
    Então vejo o título "Consulte as informações do veículo"
    E vejo o campo de placa com o exemplo "ABC1D23"
    E não há erros de JavaScript no console

  Cenário: CT-02 Menu principal
    Dado que estou na home
    Quando clico em "Ajuda" ou "Contato" no menu
    Então sou levado à página correspondente, que tem um título

  Esquema do Cenário: CT-03 Páginas legais disponíveis
    Quando acesso "<página>"
    Então a resposta é HTTP 200
    E a página tem um título principal (h1)

    Exemplos:
      | página                  |
      | Sobre nós               |
      | Termos de Uso           |
      | Política de Privacidade |
      | Política de Cookies     |
      | LGPD                    |
      | Aviso legal             |
      | Política de Reembolso   |  # DEF-02: sem h1

  Cenário: CT-04 Nenhum link interno quebrado
    Dado que estou na home
    Quando verifico cada link interno da página
    Então nenhum responde com erro (HTTP 4xx ou 5xx)

  Cenário: CT-05 FAQ
    Dado que estou na home
    Quando abro a pergunta "A consulta é grátis?"
    Então vejo a resposta
    E quando clico de novo a resposta é recolhida

  Cenário: CT-06 Transparência sobre a empresa
    Então vejo o aviso de que o serviço não tem vínculo com o DETRAN
    E vejo o CNPJ da empresa responsável

  Cenário: CT-36 CSP compatível com as tags do site  # DEF-01
    Quando a home termina de carregar
    Então nenhum script do próprio site é bloqueado pela política de segurança de conteúdo
```
