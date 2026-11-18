import { ConsultasAcademicas } from '../dados/consultas-academicas';
import type { DadosAcademicos } from '../dominio/tipos';
import type { ConteudoCandidato } from '../dados/comandos-conteudo';
import { ambienteComandos, prepararConteudoPublicado } from './ambiente-comandos-academicos';

/**
 * Cenário de estudo sem respostas: d-alg publicada (tp-1/tp-2, 3 questões cada), Ana (m-ana-26, m-ana-27),
 * Bruno (m-bruno-26, turma A) e turma paralela t-b sem matrículas. Carla leciona t-26 (SI).
 */
export function prepararEstudo(dados: DadosAcademicos) {
  prepararConteudoPublicado(dados);
  dados.usuarios.push(
    { id: 'u-bruno', nome: 'Bruno', email: 'bruno@exemplo.com', ativo: true, funcoes: ['aluno'] },
    { id: 'u-prof2', nome: 'Professor de t-b', email: 'prof2@exemplo.com', ativo: true, funcoes: ['professor'] },
  );
  dados.turmas.push({ id: 't-b', codigo: 'B', disciplinaId: 'd-alg', periodoLetivoId: 'p-26' });
  dados.matriculas.push({ id: 'm-bruno-26', alunoId: 'u-bruno', turmaId: 't-26', data: dados.dataVirtual });
  dados.vinculosProfessor.push({ professorId: 'u-prof2', turmaId: 't-b' });
}

export function ambienteEstudo(preparar?: (dados: DadosAcademicos) => void) {
  const a = ambienteComandos((dados) => { prepararEstudo(dados); preparar?.(dados); });
  const repo = new ConsultasAcademicas(a.persistencia, a.sessao, a.gerarId);
  return { ...a, repo };
}

/** Id da questão do tópico e dificuldade dados na disciplina d-alg. */
export const questao = (topico: 'tp-1' | 'tp-2', dificuldade: 'facil' | 'medio' | 'dificil') => `d-alg-${topico}-${dificuldade}`;

/** Candidato completo de conteúdo a partir do documento gravado (como o editor o prepararia). */
export function candidatoDe(dados: DadosAcademicos, disciplinaId = 'd-alg'): ConteudoCandidato {
  const d = dados.disciplinas.find((x) => x.id === disciplinaId)!;
  return {
    topicos: structuredClone(d.topicos),
    questoes: dados.questoes.filter((q) => q.disciplinaId === disciplinaId)
      .map(({ disciplinaId: _omitida, ...q }) => structuredClone(q)),
  };
}

type Ambiente = ReturnType<typeof ambienteEstudo>;

/** Resposta real pelo comando do aluno; deixa a sessão com esse aluno. */
export async function responderComo(
  a: Ambiente, alunoId: string, matriculaId: string, questaoId: string, alternativa = 0,
) {
  await a.repo.entrar(alunoId);
  return a.repo.registrarResposta({ matriculaId }, { questaoId, alternativa }, a.ler().revisao);
}

/** Conclui a trilha de d-alg (dois tópicos, quatro acertos Difíceis cada). */
export async function concluirTrilha(a: Ambiente, alunoId: string, matriculaId: string) {
  for (const tp of ['tp-1', 'tp-2'] as const) {
    for (let i = 0; i < 4; i++) await responderComo(a, alunoId, matriculaId, questao(tp, 'dificil'));
  }
}

export const ALVO = { disciplinaId: 'd-alg' };
