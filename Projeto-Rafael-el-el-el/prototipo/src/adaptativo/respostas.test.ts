import { describe, expect, it } from 'vitest';
import type { QuestaoDisciplina } from '../dominio/tipos';
import { CONFIG } from './config';
import { criarRespostaAcademica } from './respostas';

const questao = (): QuestaoDisciplina => ({
  id: 'q1', disciplinaId: 'd1', topicoId: 'tp-1', dificuldade: 'medio', enunciado: 'Quanto é 1+1?',
  alternativas: ['1', '2', '3'], correta: 1, explicacao: 'Soma simples.', revisao: 0,
});
const entrada = (q = questao(), alternativa = 1) => ({ id: 'r1', matriculaId: 'm1', questao: q, alternativa, data: '2026-11-17', momento: 7 });

describe('3.1 — [AA] Preservação do estado de estudo; [GA] preservação da gamificação', () => {
  it('guarda conteúdo apresentado, avaliação, dificuldade, versão, efeitos, data virtual e ordem', () => {
    const r = criarRespostaAcademica(entrada());
    expect(r).toEqual({
      id: 'r1', matriculaId: 'm1', topicoId: 'tp-1', questaoId: 'q1', alternativa: 1, acertou: true,
      dificuldade: 'medio', variacaoDominio: 15, xpConcedido: 20, versaoRegras: CONFIG.versaoRegras,
      data: '2026-11-17', momento: 7,
      conteudoOriginal: { enunciado: 'Quanto é 1+1?', alternativas: ['1', '2', '3'], correta: 1, explicacao: 'Soma simples.' },
    });
  });

  it('calcula a avaliação pelo domínio: erro reduz domínio e não concede XP', () => {
    const r = criarRespostaAcademica(entrada(questao(), 0));
    expect(r).toMatchObject({ acertou: false, variacaoDominio: -10, xpConcedido: 0 });
  });

  it('alterações posteriores da questão corrente não modificam a cópia histórica', () => {
    const q = questao();
    const r = criarRespostaAcademica(entrada(q));
    q.enunciado = 'Corrigido'; q.alternativas.reverse(); q.alternativas[0] = 'X'; q.correta = 0;
    q.explicacao = 'Outra'; q.dificuldade = 'dificil';
    expect(r.conteudoOriginal).toEqual({
      enunciado: 'Quanto é 1+1?', alternativas: ['1', '2', '3'], correta: 1, explicacao: 'Soma simples.',
    });
    expect(r).toMatchObject({ acertou: true, dificuldade: 'medio', variacaoDominio: 15, xpConcedido: 20 });
  });

  it('o registro é imutável', () => {
    const r = criarRespostaAcademica(entrada());
    expect(Object.isFrozen(r)).toBe(true);
    expect(Object.isFrozen(r.conteudoOriginal)).toBe(true);
    expect(Object.isFrozen(r.conteudoOriginal.alternativas)).toBe(true);
    expect(() => { (r as { acertou: boolean }).acertou = false; }).toThrow();
  });

  it.each([-1, 3, 1.5, Number.NaN])('rejeita alternativa inválida (%s)', (alternativa) => {
    expect(() => criarRespostaAcademica(entrada(questao(), alternativa))).toThrow(RangeError);
  });
});
