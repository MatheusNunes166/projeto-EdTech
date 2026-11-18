import { alternativaValida, criarRespostaAcademica } from '../adaptativo/respostas';
import { calcularEstadoMatricula, resolverContextoEstudo } from '../adaptativo/contexto-estudo';
import type { RespostaAcademica } from '../dominio/tipos';
import { ComandosAcademicos } from './comandos-academicos';
import { conferirChaves, rejeitar, validarRespostas } from './validacao-comandos-academicos';

/** Identifica a matrícula; pais opcionais (URL aninhada) devem coincidir com a relação real. */
export interface AlvoMatricula { matriculaId: string; turmaId?: string; disciplinaId?: string; graduacaoId?: string }
/** Somente a escolha do aluno: autor, tópico, avaliação, XP e datas vêm do repositório. */
export interface EscolhaResposta { questaoId: string; alternativa: number }

export function conferirAlvoMatricula(alvo: AlvoMatricula): void {
  conferirChaves(alvo, ['matriculaId', 'turmaId', 'disciplinaId', 'graduacaoId']);
  for (const valor of Object.values(alvo)) if (typeof valor !== 'string') rejeitar('recurso', 'Identificador inválido.');
}

/** Comandos de estudo, isolados por matrícula. */
export class ComandosEstudo extends ComandosAcademicos {
  registrarResposta(alvo: AlvoMatricula, escolha: EscolhaResposta, revisao: number): Promise<RespostaAcademica> {
    return this.alterar({ acao: 'responder', recurso: { tipo: 'matricula', ...alvo } }, revisao, (dados) => {
      conferirAlvoMatricula(alvo);
      conferirChaves(escolha, ['questaoId', 'alternativa']);
      if (typeof escolha.questaoId !== 'string') rejeitar('questaoId', 'Informe a questão.');
      const contexto = resolverContextoEstudo(dados, alvo.matriculaId);
      if (!contexto) rejeitar('matriculaId', 'Matrícula inexistente.');
      const questao = contexto.questoes.find((q) => q.id === escolha.questaoId);
      if (!questao) rejeitar('questaoId', 'A questão não pertence à disciplina desta turma.');
      const estado = calcularEstadoMatricula(contexto).topicos.find((t) => t.topicoId === questao.topicoId);
      if (!estado) rejeitar('questaoId', 'A questão não pertence a um tópico da disciplina.');
      if (!estado.desbloqueado) rejeitar('questaoId', 'O tópico da questão está bloqueado.');
      if (!alternativaValida(questao, escolha.alternativa)) rejeitar('alternativa', 'Escolha uma alternativa existente.');
      const resposta = criarRespostaAcademica({
        id: this.gerarId(), matriculaId: contexto.matriculaId, questao, alternativa: escolha.alternativa,
        data: dados.dataVirtual, momento: Math.max(0, ...dados.respostas.map((r) => r.momento)) + 1,
      });
      dados.respostas.push(structuredClone(resposta));
      return resposta;
    }, validarRespostas);
  }
}
