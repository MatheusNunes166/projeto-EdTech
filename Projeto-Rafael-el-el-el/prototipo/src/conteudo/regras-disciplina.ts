/**
 * Regras puras do conteúdo de uma disciplina (design D5): cobertura de publicação, bloqueios
 * derivados de respostas de TODAS as ofertas e diferença textual para a confirmação humana.
 */
import { DIFICULDADES, NOME_DIFICULDADE, type DadosAcademicos, type Dificuldade, type RevisaoTextual } from '../dominio/tipos';
import type { ErrosAcademicos } from '../dominio/academico';
import type { LeituraProfunda } from '../dominio/autorizacao';

type Documento = LeituraProfunda<DadosAcademicos>;
export type DiferencaTextual = RevisaoTextual['diferenca'][number];

/** Identificador do recurso de uma confirmação sobre o título de um tópico. */
export const recursoTopico = (disciplinaId: string, topicoId: string) => `topico:${disciplinaId}:${topicoId}`;

export interface FaltanteDisciplina { topicoId: string; titulo: string; niveis: Dificuldade[] }
export interface VerificacaoDisciplina { ok: boolean; semTopicos: boolean; faltantes: FaltanteDisciplina[] }

/** Cada tópico precisa de ao menos uma questão de cada dificuldade, da própria disciplina e tópico. */
export function verificarPublicacaoDisciplina(
  disciplina: { readonly id: string; readonly topicos: readonly { readonly id: string; readonly titulo: string }[] },
  questoes: readonly { readonly disciplinaId: string; readonly topicoId: string; readonly dificuldade: Dificuldade }[],
): VerificacaoDisciplina {
  const faltantes: FaltanteDisciplina[] = [];
  for (const t of disciplina.topicos) {
    const niveis = DIFICULDADES.filter((d) => !questoes.some((q) =>
      q.disciplinaId === disciplina.id && q.topicoId === t.id && q.dificuldade === d));
    if (niveis.length > 0) faltantes.push({ topicoId: t.id, titulo: t.titulo, niveis });
  }
  const semTopicos = disciplina.topicos.length === 0;
  return { ok: !semTopicos && faltantes.length === 0, semTopicos, faltantes };
}

/** Erros por campo, com tópico e dificuldade faltantes (sem expor dados de alunos). */
export function errosDeCobertura(v: VerificacaoDisciplina): ErrosAcademicos {
  const erros: ErrosAcademicos = {};
  if (v.semTopicos) erros.topicos = 'A disciplina publicada precisa de ao menos um tópico.';
  for (const f of v.faltantes) {
    for (const nivel of f.niveis) {
      erros[`cobertura.${f.topicoId}.${nivel}`] = `O tópico "${f.titulo}" precisa de uma questão ${NOME_DIFICULDADE[nivel]}.`;
    }
  }
  return erros;
}

/** Existe resposta em alguma turma da disciplina, mesmo de turma que o autor não consulta. */
export function disciplinaTemResposta(dados: Documento, disciplinaId: string): boolean {
  const turmas = new Set(dados.turmas.filter((t) => t.disciplinaId === disciplinaId).map((t) => t.id));
  const matriculas = new Set(dados.matriculas.filter((m) => turmas.has(m.turmaId)).map((m) => m.id));
  const questoes = new Set(dados.questoes.filter((q) => q.disciplinaId === disciplinaId).map((q) => q.id));
  return dados.respostas.some((r) => matriculas.has(r.matriculaId) || questoes.has(r.questaoId));
}

export const questaoRespondida = (dados: Documento, questaoId: string) =>
  dados.respostas.some((r) => r.questaoId === questaoId);

export const topicoRespondido = (dados: Documento, disciplinaId: string, topicoId: string) => {
  const matriculas = new Set(dados.matriculas.filter((m) => dados.turmas.some((t) =>
    t.id === m.turmaId && t.disciplinaId === disciplinaId)).map((m) => m.id));
  return dados.respostas.some((r) => r.topicoId === topicoId && matriculas.has(r.matriculaId));
};

const mesmasAlternativas = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((texto, i) => texto === b[i]);

/**
 * Diferença exata de texto entre uma questão e sua versão proposta. É o que o autor examina e
 * confirma; o repositório compara a confirmação com este mesmo resultado.
 */
export function diferencaTextualQuestao(
  original: { readonly enunciado: string; readonly alternativas: readonly string[]; readonly explicacao: string },
  proposto: { readonly enunciado: string; readonly alternativas: readonly string[]; readonly explicacao: string },
): DiferencaTextual[] {
  const diferenca: DiferencaTextual[] = [];
  if (original.enunciado !== proposto.enunciado) {
    diferenca.push({ campo: 'enunciado', original: original.enunciado, proposto: proposto.enunciado });
  }
  if (!mesmasAlternativas(original.alternativas, proposto.alternativas)) {
    diferenca.push({ campo: 'alternativas', original: [...original.alternativas], proposto: [...proposto.alternativas] });
  }
  if (original.explicacao !== proposto.explicacao) {
    diferenca.push({ campo: 'explicacao', original: original.explicacao, proposto: proposto.explicacao });
  }
  return diferenca;
}

export function diferencaTextualTopico(original: string, proposto: string): DiferencaTextual[] {
  return original === proposto ? [] : [{ campo: 'titulo', original, proposto }];
}

/** Troca de posição de textos: reordenar alternativas muda a correspondência com respostas gravadas. */
export function alternativasReordenadas(original: readonly string[], proposto: readonly string[]): boolean {
  return proposto.some((texto, i) => texto !== original[i] && original.some((outro, j) => j !== i && outro === texto));
}
