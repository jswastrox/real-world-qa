/**
 * Defeitos reais encontrados pela suíte e ainda não corrigidos no site.
 *
 * Testes ligados a um defeito usam `test.fail()`: passam enquanto o defeito
 * existir e reprovam ("unexpected pass") quando ele for corrigido — sinal para
 * remover a marcação. Detalhes de cada um em docs/defeitos-encontrados.md.
 */
export const knownDefects = {
  'DEF-01': 'CSP do site libera bat.bing.net, mas o script do Microsoft Ads é carregado de bat.bing.com',
  'DEF-02': 'Política de Reembolso não tem título h1 (usa h2 como título principal)',
} as const;

export type DefectId = keyof typeof knownDefects;

export function defect(id: DefectId) {
  return { type: 'defeito conhecido', description: `${id}: ${knownDefects[id]}` };
}
