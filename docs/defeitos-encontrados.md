# Defeitos e observações encontrados

Registro do que a suíte encontrou na primeira execução contra produção.

## Defeitos

### DEF-01 — CSP bloqueia o script do Microsoft Ads

| | |
| --- | --- |
| Severidade | Média (perda de dados de conversão de campanhas pagas) |
| Encontrado por | CT-01 (erros de console na home), isolado em CT-36 |
| Status | Aberto |

**Passos:** abrir a home com o DevTools aberto.

**Resultado atual:** o console mostra
`Loading the script 'https://bat.bing.com/p/action/….js' violates the following Content Security Policy directive: "script-src … https://bat.bing.net …"`.
O navegador bloqueia o script.

**Resultado esperado:** a política de segurança de conteúdo permite o domínio de onde o próprio site
carrega a tag, ou a tag é carregada do domínio já permitido.

**Impacto:** a tag de conversão do Microsoft Ads (UET) nunca executa, e as campanhas do Bing ficam sem
dados de conversão.

**Sugestão:** incluir `https://bat.bing.com` na diretiva `script-src`.

### DEF-02 — Política de Reembolso sem título `h1`

| | |
| --- | --- |
| Severidade | Baixa (acessibilidade e SEO) |
| Encontrado por | CT-03 |
| Status | Aberto |

**Resultado atual:** o título "Política de Reembolso" é um `h2`, e a página não tem nenhum `h1`. As outras
seis páginas legais têm `h1`.

**Impacto:** quem usa leitor de tela e navega por títulos não encontra o título principal. Também é um
sinal fraco para SEO numa página exigida pelas políticas do Google Ads.

**Sugestão:** trocar o `h2` do título por `h1`.

## Acessibilidade (axe-core, impacto "serious")

Não bloqueiam a execução (o critério de bloqueio é "critical"), mas entram na fila de priorização. A lista
completa de elementos afetados está anexada a cada teste no relatório HTML.

| ID | Página | Regra | Ocorrências | Sugestão |
| --- | --- | --- | --- | --- |
| A11Y-01 | Home | `color-contrast`: contraste abaixo de 4.5:1 | 8 elementos | Escurecer os textos cinza sobre fundo escuro, ou clarear o fundo dos selos |
| A11Y-02 | Login | `listitem`: `<li>` fora de `<ul>`/`<ol>` | 2 elementos | Envolver as dicas de segurança ("Nunca solicitamos senha…") em uma `<ul>` |

## Observações de experiência do usuário

### OBS-01 — Duas formas diferentes de erro no campo de placa

Placas com menos de 7 caracteres são barradas pelo atributo `pattern` do HTML, e o usuário vê o balão
nativo do navegador. Placas com 7 caracteres em formato inválido passam pelo JavaScript do site e mostram a
mensagem estilizada "Informe uma placa válida, no padrão ABC1D23 ou ABC1234." O mesmo tipo de erro aparece
de dois jeitos diferentes, e o balão nativo varia conforme o navegador e o idioma.

**Sugestão:** adicionar `novalidate` ao formulário e deixar a validação toda com o JavaScript do site, que
já cobre os dois casos. Coberto por CT-37, que documenta o comportamento atual.
