/**
 * Funções de estudo sobre o contexto de UMA matrícula (design D3/D6): próxima questão, feedback
 * e sugestão de revisão. Nenhuma recebe histórico de outras matrículas.
 */
import type { LeituraProfunda } from '../dominio/autorizacao';
import type { Dificuldade, QuestaoDisciplina, RespostaAcademica } from '../dominio/tipos';
import { CONFIG } from './config';
import { calcularEstadoMatricula, type ContextoEstudo, type EstadoTrilhaMatricula } from './contexto-estudo';
import { faixaDificuldade } from './motor';

export interface ProximaAtividadeMatricula {
  questao: LeituraProfunda<QuestaoDisciplina>;
  topicoId: string;
  dificuldade: Dificuldade;
}

/**
 * Tópico desbloqueado e não dominado de menor domínio (ordem da disciplina no empate); dificuldade pela
 * faixa do domínio; prefere questões inéditas e evita repetir a última respondida quando há alternativa.
 * Sem inédita, reutiliza a menos recente na dificuldade alvo.
 */
export function proximaQuestaoMatricula(
  contexto: ContextoEstudo, estado: EstadoTrilhaMatricula = calcularEstadoMatricula(contexto),
): ProximaAtividadeMatricula | null {
  const candidatos = estado.topicos
    .map((t, ordem) => ({ ...t, ordem }))
    .filter((t) => t.desbloqueado && !t.dominado)
    .sort((a, b) => a.dominio - b.dominio || a.ordem - b.ordem);

  const historico = [...contexto.respostas].sort((a, b) => a.momento - b.momento);
  const ultima = historico.length > 0 ? historico[historico.length - 1].questaoId : undefined;
  const ultimoUso = new Map<string, number>();
  for (const r of historico) ultimoUso.set(r.questaoId, r.momento);

  for (const topico of candidatos) {
    const dificuldade = faixaDificuldade(topico.dominio);
    const doTopico = contexto.questoes.filter((q) => q.topicoId === topico.topicoId);
    let pool = doTopico.filter((q) => q.dificuldade === dificuldade);
    if (pool.length === 0) pool = doTopico;
    if (pool.length === 0) continue;

    const semUltima = pool.length > 1 ? pool.filter((q) => q.id !== ultima) : pool;
    const inedita = semUltima.find((q) => !ultimoUso.has(q.id));
    const questao = inedita
      ?? [...semUltima].sort((a, b) => (ultimoUso.get(a.id) ?? 0) - (ultimoUso.get(b.id) ?? 0))[0];
    return { questao, topicoId: topico.topicoId, dificuldade: questao.dificuldade };
  }
  return null;
}

/** Erros consecutivos mais recentes da matrícula no tópico. */
export function errosSeguidosNoTopicoMatricula(contexto: Pick<ContextoEstudo, 'respostas'>, topicoId: string): number {
  const doTopico = contexto.respostas.filter((r) => r.topicoId === topicoId)
    .sort((a, b) => a.momento - b.momento);
  let erros = 0;
  for (let i = doTopico.length - 1; i >= 0 && !doTopico[i].acertou; i--) erros++;
  return erros;
}

export function deveSugerirRevisaoMatricula(contexto: Pick<ContextoEstudo, 'respostas'>, topicoId: string): boolean {
  return errosSeguidosNoTopicoMatricula(contexto, topicoId) >= CONFIG.errosParaRevisao;
}

export interface FeedbackResposta {
  acertou: boolean;
  explicacao: string;
  /** Somente em caso de erro: índice e texto da alternativa correta apresentada. */
  alternativaCorreta: { indice: number; texto: string } | null;
  topicoId: string;
  dominioAnterior: number;
  dominioAtual: number;
  /** Variação efetiva do domínio (já considerando os limites 0–100). */
  variacao: number;
  topicoDominado: boolean;
  sugerirRevisao: boolean;
  /** Progresso exato (0–100) após a resposta; a formatação pertence à apresentação. */
  progresso: number;
  concluido: boolean;
}

/** Feedback imediato: usa o conteúdo gravado na resposta, não o cadastro corrente. */
export function feedbackDaResposta(
  anterior: ContextoEstudo, resposta: LeituraProfunda<RespostaAcademica>,
): FeedbackResposta {
  const depois: ContextoEstudo = { ...anterior, respostas: [...anterior.respostas, resposta] };
  const antes = calcularEstadoMatricula(anterior).topicos.find((t) => t.topicoId === resposta.topicoId);
  const agora = calcularEstadoMatricula(depois);
  const topico = agora.topicos.find((t) => t.topicoId === resposta.topicoId);
  const c = resposta.conteudoOriginal;
  return {
    acertou: resposta.acertou,
    explicacao: c.explicacao,
    alternativaCorreta: resposta.acertou ? null : { indice: c.correta, texto: c.alternativas[c.correta] },
    topicoId: resposta.topicoId,
    dominioAnterior: antes?.dominio ?? 0,
    dominioAtual: topico?.dominio ?? 0,
    variacao: (topico?.dominio ?? 0) - (antes?.dominio ?? 0),
    topicoDominado: topico?.dominado ?? false,
    sugerirRevisao: deveSugerirRevisaoMatricula(depois, resposta.topicoId),
    progresso: agora.progresso,
    concluido: agora.concluido,
  };
}
