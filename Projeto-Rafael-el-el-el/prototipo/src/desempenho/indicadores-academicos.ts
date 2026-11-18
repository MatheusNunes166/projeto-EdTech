/**
 * Indicadores por matrícula e por turma (design D6). Calcula valores exatos: nenhuma função aqui
 * arredonda; a apresentação fica em apresentacao.ts. Sempre usa o conjunto completo de matriculados.
 */
import { CONFIG } from '../adaptativo/config';
import { calcularEstadoMatricula, resolverContextoEstudo, type ContextoEstudo } from '../adaptativo/contexto-estudo';
import type {
  IndicadoresAlunoTurma, MediasTurma, SituacaoAluno,
} from '../dados/contratos-consultas-academicas';
import type { LeituraProfunda } from '../dominio/autorizacao';
import type { DadosAcademicos, RespostaAcademica } from '../dominio/tipos';
import { conquistasMatricula, sequenciaDiasMatricula, xpMatricula } from '../gamificacao/gamificacao';

type Respostas = readonly LeituraProfunda<RespostaAcademica>[];

export interface TaxaAcertosMatricula { acertos: number; total: number; taxa: number }

/** Taxa exata (0–100) das respostas válidas da matrícula; sem respostas devolve total 0 e taxa 0. */
export function taxaAcertosMatricula(contexto: { readonly respostas: Respostas }): TaxaAcertosMatricula {
  const total = contexto.respostas.length;
  const acertos = contexto.respostas.filter((r) => r.acertou).length;
  return { acertos, total, taxa: total === 0 ? 0 : (acertos / total) * 100 };
}

/** Últimas até dez respostas (ou as disponíveis) da própria matrícula, em ordem histórica. */
export function ultimasRespostas(contexto: { readonly respostas: Respostas }, limite = CONFIG.atencao.ultimasRespostas) {
  return [...contexto.respostas].sort((a, b) => a.momento - b.momento).slice(-limite);
}

/** Menos de 50% nas últimas até 10 respostas, comparando a razão sem arredondar; sem respostas não classifica. */
export function situacaoDoAluno(contexto: { readonly respostas: Respostas }): SituacaoAluno {
  const ultimas = ultimasRespostas(contexto);
  if (ultimas.length === 0) return 'sem-atividade';
  return ultimas.filter((r) => r.acertou).length / ultimas.length < CONFIG.atencao.taxaMinima
    ? 'precisa-de-atencao' : 'regular';
}

export function ultimaAtividadeMatricula(contexto: { readonly respostas: Respostas }): string | null {
  return contexto.respostas.reduce<string | null>((max, r) => (max === null || r.data > max ? r.data : max), null);
}

export function indicadoresDaMatricula(contexto: ContextoEstudo, hoje: string): IndicadoresAlunoTurma {
  const estado = calcularEstadoMatricula(contexto);
  const taxa = taxaAcertosMatricula(contexto);
  return {
    matriculaId: contexto.matriculaId,
    progresso: estado.progresso,
    concluido: estado.concluido,
    dominioPorTopico: estado.topicos.map((t) => ({ topicoId: t.topicoId, titulo: t.titulo, dominio: t.dominio })),
    taxaAcertos: taxa.taxa,
    totalRespostas: taxa.total,
    xp: xpMatricula(contexto),
    sequenciaDias: sequenciaDiasMatricula(contexto, hoje),
    conquistas: conquistasMatricula(contexto).map((c) => ({ id: c.id, nome: c.nome, data: c.data })),
    ultimaAtividade: ultimaAtividadeMatricula(contexto),
  };
}

/** Contextos de TODAS as matrículas da turma, inclusive de quem ainda não respondeu. */
export function contextosDaTurma(dados: LeituraProfunda<DadosAcademicos>, turmaId: string): ContextoEstudo[] {
  return dados.matriculas.filter((m) => m.turmaId === turmaId)
    .map((m) => resolverContextoEstudo(dados, m.id)).filter((c): c is ContextoEstudo => c !== undefined);
}

/**
 * Progresso médio = soma dos progressos exatos ÷ matriculados; domínio médio do tópico = soma ÷ matriculados.
 * Sem matriculados: 'sem-dados' (distinto de média zero).
 */
export function calcularMediasTurma(contextos: readonly ContextoEstudo[]): MediasTurma {
  const n = contextos.length;
  if (n === 0) return { situacao: 'sem-dados' };
  const estados = contextos.map((c) => calcularEstadoMatricula(c));
  const topicos = contextos[0].disciplina.topicos;
  return {
    situacao: 'calculadas',
    progressoMedio: estados.reduce((soma, e) => soma + e.progresso, 0) / n,
    dominioMedioPorTopico: topicos.map((t, i) => ({
      topicoId: t.id, dominio: estados.reduce((soma, e) => soma + e.topicos[i].dominio, 0) / n,
    })),
  };
}
