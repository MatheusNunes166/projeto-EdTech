import { useParams } from 'react-router-dom';
import { useConsulta, type EstadoConsulta } from '../../app/contexto';
import type { AlvoMatricula } from '../../dados/comandos-estudo';

/**
 * Resolve a matrícula do aluno da sessão a partir de /disciplinas/:disciplinaId/turmas/:turmaId.
 * IDs aninhados que não correspondem a uma matrícula real do aluno resultam em acesso negado.
 */
export function useAlvoDaRota(): EstadoConsulta<AlvoMatricula> {
  const { disciplinaId = '', turmaId = '' } = useParams();
  const minhas = useConsulta((r) => r.consultarMinhasTurmas(), [disciplinaId, turmaId]);
  if (minhas.situacao !== 'ok') return minhas as EstadoConsulta<never>;
  const t = minhas.dados.find((x) => x.turma.id === turmaId && x.disciplina.id === disciplinaId);
  if (!t) return { situacao: 'erro', erro: { codigo: 'ACESSO_NEGADO', mensagem: 'Turma não encontrada entre as suas matrículas.', detalhes: {} } };
  if (!t.conteudoDisponivel) return { situacao: 'erro', erro: { codigo: 'ACESSO_NEGADO', mensagem: 'Conteúdo indisponível.', detalhes: {} } };
  return { situacao: 'ok', revisao: minhas.revisao, dados: { matriculaId: t.matricula.id, turmaId, disciplinaId } };
}

export const caminhoTurma = (a: AlvoMatricula) => `/aluno/disciplinas/${a.disciplinaId}/turmas/${a.turmaId}`;
