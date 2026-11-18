import type { Dificuldade } from '../dominio/tipos';

/**
 * Parâmetros do motor adaptativo e da gamificação, centralizados para ajuste
 * após testes com usuários (design D4 e D5).
 */
export const CONFIG = {
  /** Versão das regras numéricas, gravada em cada resposta para auditoria histórica. */
  versaoRegras: 1,
  dominioMinimo: 0,
  dominioMaximo: 100,
  /** Domínio a partir do qual o tópico é considerado dominado. */
  limiarDominado: 80,
  /** Variação do domínio por resultado e dificuldade. */
  variacao: {
    acerto: { facil: 10, medio: 15, dificil: 20 } as Record<Dificuldade, number>,
    erro: { facil: -15, medio: -10, dificil: -5 } as Record<Dificuldade, number>,
  },
  /** Limite superior (exclusivo) de cada faixa: 0–39 Fácil, 40–69 Médio, 70–100 Difícil. */
  faixas: { facilAte: 40, medioAte: 70 },
  /** Erros seguidos no mesmo tópico que disparam a sugestão de revisão. */
  errosParaRevisao: 2,
  xp: { facil: 10, medio: 20, dificil: 30 } as Record<Dificuldade, number>,
  /** Dias de sequência para a conquista de sequência. */
  diasConquistaSequencia: 7,
  /** Painel do professor: janela e limite para "precisa de atenção". */
  atencao: { ultimasRespostas: 10, taxaMinima: 0.5 },
} as const;
