# 02 — Validação do campo de placa

Spec: [`tests/e2e/02-validacao-placa.spec.ts`](../../tests/e2e/02-validacao-placa.spec.ts)

Regras extraídas do comportamento do site:
- Padrão antigo: `AAA9999`. Padrão Mercosul: `AAA9A99`.
- O campo converte para maiúsculas, remove símbolos e espaços e aceita no máximo 7 caracteres.
- Placa inválida não pode gerar consulta, que custa dinheiro.

```gherkin
Funcionalidade: Validação da placa
  Para não desperdiçar consultas
  Como operador do serviço
  Quero que só placas em formato válido cheguem à API

  Cenário: CT-07 Normalização do que é digitado
    Quando digito "abc-1d23"
    Então o campo mostra "ABC1D23"
    Quando digito "XYZ 9876 543"
    Então o campo mostra "XYZ9876"

  Esquema do Cenário: CT-08 Placa inválida com 7 caracteres
    Quando consulto a placa "<placa>"
    Então vejo "Informe uma placa válida, no padrão ABC1D23 ou ABC1234."
    E nenhuma consulta é enviada à API

    Exemplos:
      | placa   | motivo                         |
      |         | campo vazio                    |
      | 1234ABC | números antes das letras       |
      | ABC12D3 | letra fora da posição Mercosul |
      | ABCD123 | quatro letras                  |

  Cenário: CT-37 Placa curta é barrada pelo navegador  # OBS-01
    Quando consulto a placa "AB12"
    Então o campo fica inválido pela regra de padrão do HTML
    E a mensagem do site não aparece
    E nenhuma consulta é enviada à API

  Cenário: CT-09 Erro some ao corrigir
    Dado que vi o erro de placa inválida
    Quando apago um caractere
    Então a mensagem de erro desaparece

  Esquema do Cenário: CT-10 Placa válida é consultada
    Quando consulto a placa "<placa>" em letras minúsculas
    Então a API recebe exatamente {"placa": "<placa>"}
    E sou levado à página de resultado

    Exemplos:
      | placa   | padrão   |
      | ABC1234 | antigo   |
      | ABC1D23 | Mercosul |
```
