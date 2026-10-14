# Teste manual — Compra de créditos via PIX e desbloqueio

**Por que é manual:** gera uma cobrança PIX real e consome uma consulta paga no fornecedor. Não existe
sandbox do gateway nem ambiente de homologação.

**Quando executar:** antes de mudanças em pagamento, preços, pacotes ou desbloqueio. Usar o menor pacote
disponível.

**Pré-condições:** conta de teste logada, saldo R$ 0,00, uma placa real conhecida.

| # | Passo | Resultado esperado |
| --- | --- | --- |
| 1 | Abrir "Comprar Créditos" | Pacotes com preço, quantidade de créditos e "Pagar com PIX" |
| 2 | Aplicar um cupom inválido | Mensagem de cupom inválido; preços inalterados |
| 3 | Escolher o menor pacote | Tela de checkout com QR Code e código copia-e-cola |
| 4 | Conferir o valor do PIX no app do banco | Igual ao preço exibido no pacote |
| 5 | Pagar | Em até 1 minuto, saldo atualizado no cabeçalho sem recarregar a página |
| 6 | Abrir "Dados da conta" → pagamentos | Pagamento listado com data, valor e status confirmado |
| 7 | Consultar a placa conhecida | Prévia exibida com dados públicos |
| 8 | Desbloquear a consulta simples | Créditos debitados conforme a tabela; chassi e RENAVAM liberados |
| 9 | Baixar o PDF | PDF com os mesmos dados da tela, sem campos vazios inesperados |
| 10 | Abrir "Minhas consultas" | Consulta listada; reabrir não debita créditos de novo |

**Pontos de atenção exploratórios:**
- Fechar a aba durante o checkout e voltar: o PIX pendente é retomado ou um novo é gerado?
- Pagar duas vezes o mesmo PIX (copia-e-cola reaproveitado): os créditos entram em dobro?
- Duas abas desbloqueando a mesma consulta ao mesmo tempo: o débito acontece uma única vez?
- Celular com conexão lenta (DevTools → Slow 3G): os estados de carregamento ficam claros?
