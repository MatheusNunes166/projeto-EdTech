/** Contrato de resposta imutável (design D3): avaliação e efeitos são gravados, não recalculados. */
import { xpDaResposta } from '../gamificacao/gamificacao';
import type { LeituraProfunda } from '../dominio/autorizacao';
import type { QuestaoDisciplina, RespostaAcademica } from '../dominio/tipos';
import { CONFIG } from './config';
import { variacaoDominio } from './motor';

export interface EntradaResposta {
  id: string;
  matriculaId: string;
  questao: LeituraProfunda<QuestaoDisciplina>;
  alternativa: number;
  /** Data virtual e ordem fornecidas pelo comando, nunca pela interface. */
  data: string;
  momento: number;
}

export function alternativaValida(questao: { readonly alternativas: readonly string[] }, alternativa: unknown): alternativa is number {
  return typeof alternativa === 'number' && Number.isInteger(alternativa)
    && alternativa >= 0 && alternativa < questao.alternativas.length;
}

/**
 * Avalia pelo domínio e copia o conteúdo apresentado (enunciado, alternativas na ordem,
 * gabarito, explicação). A cópia não compartilha referências com a questão corrente.
 */
export function criarRespostaAcademica(entrada: EntradaResposta): RespostaAcademica {
  const { questao } = entrada;
  if (!alternativaValida(questao, entrada.alternativa)) throw new RangeError('Alternativa inexistente na questão.');
  const acertou = entrada.alternativa === questao.correta;
  const resposta: RespostaAcademica = {
    id: entrada.id, matriculaId: entrada.matriculaId, topicoId: questao.topicoId, questaoId: questao.id,
    alternativa: entrada.alternativa, acertou, dificuldade: questao.dificuldade,
    variacaoDominio: variacaoDominio(questao.dificuldade, acertou),
    xpConcedido: xpDaResposta({ acertou, dificuldade: questao.dificuldade }),
    versaoRegras: CONFIG.versaoRegras, data: entrada.data, momento: entrada.momento,
    conteudoOriginal: Object.freeze({
      enunciado: questao.enunciado, alternativas: Object.freeze([...questao.alternativas]),
      correta: questao.correta, explicacao: questao.explicacao,
    }),
  };
  return Object.freeze(resposta);
}
