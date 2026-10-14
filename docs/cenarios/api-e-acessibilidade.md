# API e acessibilidade

Specs: [`tests/api/apiveicular.spec.ts`](../../tests/api/apiveicular.spec.ts) ·
[`tests/a11y/acessibilidade.spec.ts`](../../tests/a11y/acessibilidade.spec.ts)

```gherkin
Funcionalidade: API apiveicular
  Só endpoints de leitura ou que devem ser recusados. A consulta de placa não é chamada diretamente.

  Cenário: API-01 Configurações públicas
    Quando consulto GET /api/public/settings
    Então recebo HTTP 200 com JSON
    E o número de WhatsApp segue o formato esperado
    E a resposta chega em menos de 2 segundos

  Cenário: API-02 Perfil sem token
    Quando consulto GET /api/user/profile sem autenticação
    Então recebo HTTP 401

  Cenário: API-03 Token adulterado
    Quando consulto o perfil com um JWT de assinatura inválida
    Então recebo HTTP 401

  Cenário: API-04 Histórico sem token
    Quando consulto GET /api/user/consultas sem autenticação
    Então recebo HTTP 401 ou 403

  Esquema do Cenário: API-05 Endpoint financeiro protegido
    Quando consulto GET /api/controller/summary <condição>
    Então recebo HTTP 401 ou 403
    E a resposta não contém receita nem lucro

    Exemplos:
      | condição           |
      | sem chave          |
      | com chave inválida |

  Cenário: API-06 Perfil da conta de teste
    Dado o token da sessão criada no setup
    Quando consulto GET /api/user/profile
    Então o JSON respeita o contrato
    E o saldo de créditos é 0
```

```gherkin
Funcionalidade: Acessibilidade (axe-core, WCAG 2.1 A/AA)

  Esquema do Cenário: Página sem violações críticas
    Quando analiso "<página>" com o axe-core
    Então não há violações de impacto "critical"
    E a lista completa de violações fica anexada ao relatório

    Exemplos:
      | página                  |
      | Home                    |
      | Login                   |
      | Cadastro                |
      | Contato                 |
      | Política de Privacidade |
```
