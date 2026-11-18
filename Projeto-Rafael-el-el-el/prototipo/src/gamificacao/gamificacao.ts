/**
 * Gamificação derivada do histórico de respostas de um par aluno + curso
 * (design D5) — nada é guardado como contador solto.
 */
import { CONFIG } from '../adaptativo/config';
import { calcularEstado, ordenarRespostas } from '../adaptativo/motor';
import { somarDias } from '../dominio/datas';
import type { Curso, Resposta } from '../dominio/tipos';
import { calcularEstadoMatricula, type ContextoEstudo } from '../adaptativo/contexto-estudo';

export type IdConquista = 'primeira-questao' | 'primeiro-topico' | 'sequencia-7' | 'curso-concluido';

export const CONQUISTAS: { id: IdConquista; nome: string; descricao: string }[] = [
  { id: 'primeira-questao', nome: 'Primeira questão', descricao: 'Respondeu a primeira questão do curso' },
  { id: 'primeiro-topico', nome: 'Primeiro tópico dominado', descricao: 'Dominou o primeiro tópico do curso' },
  { id: 'sequencia-7', nome: 'Sequência de 7 dias', descricao: 'Estudou o curso 7 dias seguidos' },
  { id: 'curso-concluido', nome: 'Curso concluído', descricao: 'Dominou todos os tópicos do curso' },
];

export interface ConquistaObtida {
  id: IdConquista;
  nome: string;
  /** Data em que foi conquistada. */
  data: string;
}

function doCurso(respostas: Resposta[], cursoId: string): Resposta[] {
  return respostas.filter((r) => r.cursoId === cursoId);
}

export function xpDaResposta(r: Pick<Resposta, 'acertou' | 'dificuldade'>): number {
  return r.acertou ? CONFIG.xp[r.dificuldade] : 0;
}

export function xpCurso(respostas: Resposta[], cursoId: string): number {
  return doCurso(respostas, cursoId).reduce((soma, r) => soma + xpDaResposta(r), 0);
}

/**
 * Dias consecutivos com ao menos uma resposta no curso, terminando hoje ou
 * ontem (o dia de hoje ainda não terminou). Um dia inteiro sem atividade zera.
 */
export function sequenciaDias(respostas: Resposta[], cursoId: string, hoje: string): number {
  return sequenciaDeDatas(new Set(doCurso(respostas, cursoId).map((r) => r.data)), hoje);
}

/** Dias consecutivos terminando hoje ou ontem; um dia inteiro sem atividade zera a sequência. */
export function sequenciaDeDatas(dias: ReadonlySet<string>, hoje: string): number {
  let dia = dias.has(hoje) ? hoje : somarDias(hoje, -1);
  let sequencia = 0;
  while (dias.has(dia)) {
    sequencia++;
    dia = somarDias(dia, -1);
  }
  return sequencia;
}

/** Conquistas do curso, cada uma no máximo uma vez, na ordem em que ocorreram. */
export function conquistasCurso(curso: Curso, respostas: Resposta[]): ConquistaObtida[] {
  const ordenadas = ordenarRespostas(doCurso(respostas, curso.id));
  const obtidas = new Map<IdConquista, string>();
  const conceder = (id: IdConquista, data: string) => {
    if (!obtidas.has(id)) obtidas.set(id, data);
  };

  let diaAnterior: string | undefined;
  let sequencia = 0;
  ordenadas.forEach((r, i) => {
    conceder('primeira-questao', r.data);

    if (r.data !== diaAnterior) {
      sequencia = diaAnterior && somarDias(diaAnterior, 1) === r.data ? sequencia + 1 : 1;
      diaAnterior = r.data;
      if (sequencia >= CONFIG.diasConquistaSequencia) conceder('sequencia-7', r.data);
    }

    const estado = calcularEstado(curso, ordenadas.slice(0, i + 1));
    if (estado.topicos.some((t) => t.dominado)) conceder('primeiro-topico', r.data);
    if (estado.concluido) conceder('curso-concluido', r.data);
  });

  return CONQUISTAS.filter((c) => obtidas.has(c.id)).map((c) => ({ id: c.id, nome: c.nome, data: obtidas.get(c.id)! }))
    .sort((a, b) => a.data.localeCompare(b.data));
}

export function novasConquistas(antes: ConquistaObtida[], depois: ConquistaObtida[]): ConquistaObtida[] {
  const ids = new Set(antes.map((c) => c.id));
  return depois.filter((c) => !ids.has(c.id));
}

// ---- Gamificação por matrícula (Aluno–Turma), derivada do histórico imutável ----

export type IdConquistaTurma = 'primeira-questao' | 'primeiro-topico' | 'sequencia-7' | 'trilha-concluida';

export const CONQUISTAS_TURMA: { id: IdConquistaTurma; nome: string; descricao: string }[] = [
  { id: 'primeira-questao', nome: 'Primeira questão', descricao: 'Respondeu a primeira questão da turma' },
  { id: 'primeiro-topico', nome: 'Primeiro tópico dominado', descricao: 'Dominou o primeiro tópico da turma' },
  { id: 'sequencia-7', nome: 'Sequência de 7 dias', descricao: 'Estudou na turma 7 dias seguidos' },
  { id: 'trilha-concluida', nome: 'Trilha concluída', descricao: 'Dominou todos os tópicos da turma' },
];

export interface ConquistaTurmaObtida { id: IdConquistaTurma; nome: string; data: string }

/** XP é a soma dos valores concedidos nas respostas da matrícula; edições de conteúdo não o alteram. */
export function xpMatricula(contexto: Pick<ContextoEstudo, 'respostas'>): number {
  return contexto.respostas.reduce((soma, r) => soma + r.xpConcedido, 0);
}

/** Sequência da matrícula: dias distintos do próprio histórico e a data virtual atual. */
export function sequenciaDiasMatricula(contexto: Pick<ContextoEstudo, 'respostas'>, hoje: string): number {
  return sequenciaDeDatas(new Set(contexto.respostas.map((r) => r.data)), hoje);
}

/**
 * Cada conquista na primeira ocorrência do marco no histórico da matrícula, com a data da resposta que
 * o satisfez — nunca a data da consulta ou de uma edição. Reconstruir a projeção não concede outra.
 */
export function conquistasMatricula(contexto: ContextoEstudo): ConquistaTurmaObtida[] {
  const ordenadas = [...contexto.respostas].sort((a, b) => a.momento - b.momento);
  const obtidas = new Map<IdConquistaTurma, string>();
  const conceder = (id: IdConquistaTurma, data: string) => { if (!obtidas.has(id)) obtidas.set(id, data); };

  let diaAnterior: string | undefined;
  let sequencia = 0;
  ordenadas.forEach((r, i) => {
    conceder('primeira-questao', r.data);
    if (r.data !== diaAnterior) {
      sequencia = diaAnterior && somarDias(diaAnterior, 1) === r.data ? sequencia + 1 : 1;
      diaAnterior = r.data;
      if (sequencia >= CONFIG.diasConquistaSequencia) conceder('sequencia-7', r.data);
    }
    const estado = calcularEstadoMatricula({ ...contexto, respostas: ordenadas.slice(0, i + 1) });
    if (estado.topicos.some((t) => t.dominado)) conceder('primeiro-topico', r.data);
    if (estado.concluido) conceder('trilha-concluida', r.data);
  });

  return CONQUISTAS_TURMA.filter((c) => obtidas.has(c.id))
    .map((c) => ({ id: c.id, nome: c.nome, data: obtidas.get(c.id)! }))
    .sort((a, b) => a.data.localeCompare(b.data));
}
