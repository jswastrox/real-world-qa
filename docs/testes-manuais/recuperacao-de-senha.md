# Teste manual — Recuperação de senha

**Por que é manual:** dispara e-mail real e depende de abrir a caixa de entrada.

**Pré-condições:** conta de teste com acesso à caixa de e-mail.

| # | Passo | Resultado esperado |
| --- | --- | --- |
| 1 | Login → "Esqueceu a senha?" | Formulário pedindo e-mail |
| 2 | Informar um e-mail **não** cadastrado | Mesma mensagem de sucesso do e-mail cadastrado (não revela se a conta existe) |
| 3 | Informar o e-mail da conta de teste | Mensagem de envio; e-mail chega em até 2 minutos |
| 4 | Abrir o link do e-mail | Formulário de nova senha |
| 5 | Usar o mesmo link uma segunda vez | Link recusado (uso único) |
| 6 | Definir nova senha e fazer login | Login com a nova senha funciona; a antiga é recusada |
| 7 | Solicitar 5 vezes seguidas | Limite de tentativas aplicado, sem enviar 5 e-mails |

**Pontos de atenção exploratórios:**
- O link expira? Em quanto tempo?
- Sessões abertas em outros dispositivos são encerradas após a troca de senha?
- O e-mail chega na caixa principal ou no spam (Gmail e Outlook)?
