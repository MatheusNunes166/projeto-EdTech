/**
 * Apresentação dos indicadores. É o ÚNICO lugar com arredondamento: os cálculos do motor e dos
 * agregadores mantêm valores exatos (design D6).
 */
import type { MediasTurma } from '../dados/contratos-consultas-academicas';

/** Inteiro mais próximo; meio ponto arredonda para cima (Math.round). */
export const arredondarExibicao = (valor: number): number => Math.round(valor);

export const SEM_DADOS = 'Sem dados' as const;

export type MediasExibidas =
  | { situacao: 'sem-dados'; rotulo: typeof SEM_DADOS }
  | { situacao: 'calculadas'; progressoMedio: number; dominioMedioPorTopico: { topicoId: string; dominio: number }[] };

export function exibirMedias(medias: MediasTurma): MediasExibidas {
  if (medias.situacao === 'sem-dados') return { situacao: 'sem-dados', rotulo: SEM_DADOS };
  return {
    situacao: 'calculadas',
    progressoMedio: arredondarExibicao(medias.progressoMedio),
    dominioMedioPorTopico: medias.dominioMedioPorTopico.map((t) => ({ topicoId: t.topicoId, dominio: arredondarExibicao(t.dominio) })),
  };
}
