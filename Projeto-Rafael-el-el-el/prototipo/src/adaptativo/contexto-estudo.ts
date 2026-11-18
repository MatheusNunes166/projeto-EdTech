/**
 * Contexto de estudo de uma matrícula (design D3). Toda função de estudo recebe este
 * contexto já filtrado: nenhuma delas aceita o histórico de uma disciplina inteira.
 */
import { CONFIG } from './config';
import { aplicarDesbloqueios, limitarDominio } from './motor';
import type { LeituraProfunda } from '../dominio/autorizacao';
import type { DadosAcademicos, Disciplina, QuestaoDisciplina, RespostaAcademica } from '../dominio/tipos';

export interface ContextoEstudo {
  readonly matriculaId: string;
  readonly alunoId: string;
  readonly turmaId: string;
  readonly periodoLetivoId: string;
  readonly disciplina: LeituraProfunda<Disciplina>;
  /** Banco de questões da disciplina (conteúdo corrente, não o apresentado em respostas). */
  readonly questoes: readonly LeituraProfunda<QuestaoDisciplina>[];
  /** Apenas as respostas desta matrícula, em ordem histórica. */
  readonly respostas: readonly LeituraProfunda<RespostaAcademica>[];
}

/** Resolve matrícula → aluno/turma/disciplina. Devolve undefined se alguma relação estiver quebrada. */
export function resolverContextoEstudo(
  dados: LeituraProfunda<DadosAcademicos>, matriculaId: string,
): ContextoEstudo | undefined {
  const matricula = dados.matriculas.find((m) => m.id === matriculaId);
  const turma = matricula && dados.turmas.find((t) => t.id === matricula.turmaId);
  const disciplina = turma && dados.disciplinas.find((d) => d.id === turma.disciplinaId);
  if (!matricula || !turma || !disciplina
    || !dados.usuarios.some((u) => u.id === matricula.alunoId)
    || !dados.periodosLetivos.some((p) => p.id === turma.periodoLetivoId)) return undefined;
  return {
    matriculaId: matricula.id, alunoId: matricula.alunoId, turmaId: turma.id,
    periodoLetivoId: turma.periodoLetivoId, disciplina,
    questoes: dados.questoes.filter((q) => q.disciplinaId === disciplina.id),
    respostas: dados.respostas.filter((r) => r.matriculaId === matricula.id)
      .sort((a, b) => a.momento - b.momento),
  };
}

export interface EstadoTopicoMatricula {
  topicoId: string;
  titulo: string;
  dominio: number;
  desbloqueado: boolean;
  dominado: boolean;
}

export interface EstadoTrilhaMatricula {
  matriculaId: string;
  disciplinaId: string;
  topicos: EstadoTopicoMatricula[];
  /** Porcentagem exata (0–100) de tópicos dominados; o arredondamento é da apresentação. */
  progresso: number;
  concluido: boolean;
}

/**
 * Reconstitui domínio e desbloqueios aplicando, na ordem, os efeitos gravados em cada
 * resposta — sem reavaliar contra o cadastro atual.
 */
export function calcularEstadoMatricula(
  contexto: Pick<ContextoEstudo, 'matriculaId' | 'disciplina' | 'respostas'>,
): EstadoTrilhaMatricula {
  const { disciplina } = contexto;
  const dominios = new Map<string, number>(disciplina.topicos.map((t) => [t.id, CONFIG.dominioMinimo]));
  const dominados = new Set<string>();
  const proprias = contexto.respostas.filter((r) => r.matriculaId === contexto.matriculaId)
    .sort((a, b) => a.momento - b.momento);
  for (const r of proprias) {
    if (!dominios.has(r.topicoId)) continue;
    const novo = limitarDominio(dominios.get(r.topicoId)! + r.variacaoDominio);
    dominios.set(r.topicoId, novo);
    if (novo >= CONFIG.limiarDominado) dominados.add(r.topicoId);
  }
  const desbloqueados = aplicarDesbloqueios(disciplina, dominados);
  const topicos = disciplina.topicos.map((t) => ({
    topicoId: t.id, titulo: t.titulo, dominio: dominios.get(t.id)!,
    desbloqueado: desbloqueados.has(t.id), dominado: dominados.has(t.id),
  }));
  const total = topicos.length, quantidade = topicos.filter((t) => t.dominado).length;
  return {
    matriculaId: contexto.matriculaId, disciplinaId: disciplina.id, topicos,
    progresso: total === 0 ? 0 : (100 * quantidade) / total,
    concluido: total > 0 && quantidade === total,
  };
}
