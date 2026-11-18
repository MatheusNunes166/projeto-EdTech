import { criarRespostaAcademica } from '../adaptativo/respostas';
import type { ContextoEstudo } from '../adaptativo/contexto-estudo';
import type { Dificuldade, QuestaoDisciplina, RespostaAcademica } from '../dominio/tipos';

/** Contextos de uma matrícula para testes puros: nada de repositório, seed ou armazenamento. */
export function questaoFicticia(topicoId: string, dificuldade: Dificuldade, n = 1, disciplinaId = 'd1'): QuestaoDisciplina {
  return {
    id: `q-${topicoId}-${dificuldade}-${n}`, disciplinaId, topicoId, dificuldade, enunciado: `Enunciado ${topicoId} ${dificuldade} ${n}`,
    alternativas: ['certa', 'errada'], correta: 0, explicacao: `Explicação ${n}`, revisao: 0,
  };
}

export function bancoCompleto(topicos: string[]): QuestaoDisciplina[] {
  return topicos.flatMap((t) => (['facil', 'medio', 'dificil'] as const).flatMap((d) => [questaoFicticia(t, d, 1), questaoFicticia(t, d, 2)]));
}

let momentoGlobal = 0;
/** Resposta real do motor (efeitos calculados), acertando (alternativa 0) ou errando (1). */
export function resp(
  matriculaId: string, questao: QuestaoDisciplina, acertou: boolean, data = '2026-11-10', momento = ++momentoGlobal,
): RespostaAcademica {
  return criarRespostaAcademica({ id: `r${momento}-${matriculaId}`, matriculaId, questao, alternativa: acertou ? 0 : 1, data, momento });
}

export function contextoFicticio(opcoes: {
  matriculaId?: string; topicos?: string[]; questoes?: QuestaoDisciplina[]; respostas?: RespostaAcademica[];
} = {}): ContextoEstudo {
  const ids = opcoes.topicos ?? ['t1', 't2'];
  return {
    matriculaId: opcoes.matriculaId ?? 'm1', alunoId: 'u1', turmaId: 'turma1', periodoLetivoId: 'p1',
    disciplina: { id: 'd1', graduacaoId: 'g1', codigo: 'D1', nome: 'D1', descricaoCurta: '', descricao: '', nivel: 'Iniciante',
      status: 'publicado', topicos: ids.map((id) => ({ id, titulo: id.toUpperCase(), materiais: [] })) },
    questoes: opcoes.questoes ?? bancoCompleto(ids),
    respostas: (opcoes.respostas ?? []).filter((r) => r.matriculaId === (opcoes.matriculaId ?? 'm1')),
  };
}

/** Respostas que levam o domínio do tópico a 80 (quatro acertos Difíceis de +20). */
export function dominar(matriculaId: string, topicoId: string, dataInicial = '2026-11-10', n = 4): RespostaAcademica[] {
  return Array.from({ length: n }, () => resp(matriculaId, questaoFicticia(topicoId, 'dificil'), true, dataInicial));
}
