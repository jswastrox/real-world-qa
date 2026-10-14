# 05 a 08 — Cookies, autenticação, conta e mobile

Specs:
[`05-consentimento-cookies`](../../tests/e2e/05-consentimento-cookies.spec.ts) ·
[`06-autenticacao`](../../tests/e2e/06-autenticacao.spec.ts) ·
[`07-conta-e-creditos`](../../tests/e2e/07-conta-e-creditos.spec.ts) ·
[`08-mobile`](../../tests/e2e/08-mobile.spec.ts)

```gherkin
Funcionalidade: Consentimento de cookies (LGPD)

  Cenário: CT-22 Primeiro acesso
    Dado que nunca visitei o site
    Então vejo o banner de cookies com link para a Política de Cookies

  Esquema do Cenário: CT-23 Escolha é lembrada
    Quando clico em "<botão>"
    Então o banner some
    E a escolha "<valor>" fica gravada
    E o banner não volta depois de recarregar a página

    Exemplos:
      | botão   | valor   |
      | Recusar | denied  |
      | Aceitar | granted |
```

```gherkin
Funcionalidade: Autenticação

  Cenário: CT-24 Credenciais inválidas
    Quando faço login com um e-mail inexistente
    Então vejo uma mensagem de erro
    E continuo na tela de login sem sessão criada

  Cenário: CT-25 Sessão expirada
    Quando sou redirecionado ao login por sessão expirada
    Então vejo "Sua sessão expirou por segurança, faça login novamente."

  Cenário: CT-26 Rota protegida
    Dado que não estou logado
    Quando acesso a área do usuário
    Então sou levado ao login

  Cenário: CT-27 Aceite dos termos no cadastro
    Dado que preenchi usuário, e-mail e senha
    Então "Cadastrar-se" fica desabilitado até eu aceitar os Termos de Uso
    E volta a ficar desabilitado se eu desmarcar

  Cenário: CT-28 Cabeçalho logado
    Dado que estou logado com a conta de teste
    Então vejo a saudação "Olá" e o saldo "R$ 0,00"
    E o botão "Entrar" não aparece

  Cenário: CT-29 Logout
    Dado que estou logado
    Quando saio pelo menu da conta
    Então a sessão local é apagada e volto à home como visitante
```

```gherkin
Funcionalidade: Conta e compra de créditos

  Contexto:
    Dado que estou logado com a conta de teste, sem créditos

  Cenário: CT-30 Histórico vazio
    Quando abro "Minhas consultas"
    Então vejo "Você ainda não tem consultas"

  Cenário: CT-31 Pacotes de créditos
    Quando abro a página de compra de créditos
    Então vejo pacotes com preço em reais e a opção "Pagar com PIX"

  Cenário: CT-32 Trava de produção
    Quando clico em um pacote
    Então a criação do pagamento é abortada pela suíte
    E nenhum PIX real é gerado
```

```gherkin
Funcionalidade: Experiência mobile (Pixel 7)

  Cenário: CT-33 Menu hambúrguer
    Quando abro o menu
    Então vejo os links de navegação
    E consigo fechar o menu

  Cenário: CT-34 Consulta no celular
    Então o campo de placa está visível sem rolar
    E a validação de placa funciona

  Cenário: CT-35 Sem rolagem horizontal
    Então a largura da página não ultrapassa a da tela
```
