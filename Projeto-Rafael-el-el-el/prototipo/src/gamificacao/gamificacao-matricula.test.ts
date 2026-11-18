import { describe, expect, it } from 'vitest';
import { contextoFicticio, dominar, questaoFicticia, resp } from '../testes/contextos';
import { conquistasMatricula, sequenciaDiasMatricula, xpMatricula } from './gamificacao';

const q = questaoFicticia;

describe('5.3 — [GA] Gamificação independente por aluno e turma, XP por turma', () => {
  it.each([['facil', 10], ['medio', 20], ['dificil', 30]] as const)('acerto %s concede %i XP', (dificuldade, xp) => {
    expect(xpMatricula(contextoFicticio({ respostas: [resp('m1', q('t1', dificuldade), true)] }))).toBe(xp);
  });

  it('erro não concede XP; o total soma os efeitos gravados (30 + 10 + 0)', () => {
    const c = contextoFicticio({ respostas: [resp('m1', q('t1', 'dificil'), true), resp('m1', q('t1', 'facil'), true), resp('m1', q('t1', 'medio'), false)] });
    expect(xpMatricula(c)).toBe(40);
  });

  it('acerto Difícil na turma A soma só em A (20 → 50); B permanece em 40', () => {
    const base = [resp('mA', q('t1', 'medio'), true), resp('mB', q('t1', 'medio'), true), resp('mB', q('t1', 'medio'), true)];
    const xp = (m: string, respostas: typeof base) => xpMatricula(contextoFicticio({ matriculaId: m, respostas }));
    expect([xp('mA', base), xp('mB', base)]).toEqual([20, 40]);
    const depois = [...base, resp('mA', q('t1', 'dificil'), true)];
    expect([xp('mA', depois), xp('mB', depois)]).toEqual([50, 40]);
  });

  it('nova matrícula (outro período) começa com zero XP, sequência zero e nenhuma conquista', () => {
    const antigo = [...dominar('m-2026', 't1', '2026-11-10')];
    const novo = contextoFicticio({ matriculaId: 'm-2027', respostas: antigo });
    expect(novo.respostas).toEqual([]);
    expect(xpMatricula(novo)).toBe(0);
    expect(sequenciaDiasMatricula(novo, '2026-11-17')).toBe(0);
    expect(conquistasMatricula(novo)).toEqual([]);
    expect(xpMatricula(contextoFicticio({ matriculaId: 'm-2026', respostas: antigo }))).toBe(120);
  });

  it('é imutável a edições do cadastro: mudar texto, gabarito ou dificuldade correntes não altera o XP gravado', () => {
    const questao = q('t1', 'dificil');
    const respostas = [resp('m1', questao, true)];
    const editado = contextoFicticio({ respostas, questoes: [{ ...questao, dificuldade: 'facil', correta: 1, enunciado: 'outro' }] });
    expect(xpMatricula(editado)).toBe(30);
  });
});

describe('5.4 — [GA] Sequência de dias de estudo', () => {
  const dia = (data: string, n = 1) => Array.from({ length: n }, () => resp('m1', q('t1', 'facil'), true, data));

  it('várias respostas no mesmo dia contam um único dia', () => {
    const c = contextoFicticio({ respostas: [...dia('2026-11-15'), ...dia('2026-11-16'), ...dia('2026-11-17', 3)] });
    expect(sequenciaDiasMatricula(c, '2026-11-17')).toBe(3);
    expect(sequenciaDiasMatricula(contextoFicticio({ respostas: [...dia('2026-11-17', 5)] }), '2026-11-17')).toBe(1);
  });

  it('continua no dia seguinte (3 → 4) e permanece 4 com mais respostas no mesmo dia', () => {
    const base = [...dia('2026-11-14'), ...dia('2026-11-15'), ...dia('2026-11-16')];
    expect(sequenciaDiasMatricula(contextoFicticio({ respostas: base }), '2026-11-16')).toBe(3);
    const mais = [...base, ...dia('2026-11-17')];
    expect(sequenciaDiasMatricula(contextoFicticio({ respostas: mais }), '2026-11-17')).toBe(4);
    expect(sequenciaDiasMatricula(contextoFicticio({ respostas: [...mais, ...dia('2026-11-17', 2)] }), '2026-11-17')).toBe(4);
  });

  it('encerrada ontem permanece visível; um dia inteiro sem resposta a zera', () => {
    const c = contextoFicticio({ respostas: [...dia('2026-11-14'), ...dia('2026-11-15'), ...dia('2026-11-16')] });
    expect(sequenciaDiasMatricula(c, '2026-11-17')).toBe(3);
    expect(sequenciaDiasMatricula(c, '2026-11-18')).toBe(0);
  });

  it('atividade em outra turma no dia seguinte não sustenta a sequência desta turma', () => {
    const respostas = [...dia('2026-11-14'), ...dia('2026-11-15'), ...dia('2026-11-16'), resp('outra', q('t1', 'facil'), true, '2026-11-17')];
    const emA = contextoFicticio({ matriculaId: 'm1', respostas });
    expect(sequenciaDiasMatricula(emA, '2026-11-18')).toBe(0);
    expect(sequenciaDiasMatricula(contextoFicticio({ matriculaId: 'outra', respostas }), '2026-11-18')).toBe(1);
  });

  it('sem respostas a sequência é zero; avançar a data virtual pode zerá-la sem qualquer edição', () => {
    expect(sequenciaDiasMatricula(contextoFicticio(), '2026-11-17')).toBe(0);
  });
});

describe('5.5 — [GA] Conquistas; [AA] preservação do estado de estudo', () => {
  it('primeira resposta errada concede Primeira questão, sem XP', () => {
    const c = contextoFicticio({ respostas: [resp('m1', q('t1', 'facil'), false, '2026-11-10')] });
    expect(conquistasMatricula(c)).toEqual([{ id: 'primeira-questao', nome: 'Primeira questão', data: '2026-11-10' }]);
    expect(xpMatricula(c)).toBe(0);
  });

  it('primeiro tópico dominado, com a data do evento; outro tópico depois não duplica nem muda a data', () => {
    const r = [resp('m1', q('t1', 'facil'), true, '2026-11-09'), ...dominar('m1', 't1', '2026-11-10'), ...dominar('m1', 't2', '2026-11-12')];
    const c = conquistasMatricula(contextoFicticio({ respostas: r }));
    expect(c.filter((x) => x.id === 'primeiro-topico')).toEqual([{ id: 'primeiro-topico', nome: 'Primeiro tópico dominado', data: '2026-11-10' }]);
    expect(c.find((x) => x.id === 'primeira-questao')!.data).toBe('2026-11-09');
    expect(c.find((x) => x.id === 'trilha-concluida')!.data).toBe('2026-11-12');
  });

  it('sete dias consecutivos concedem Sequência de 7 dias na data do sétimo dia; conclusão depois, na sua data', () => {
    const dias = Array.from({ length: 7 }, (_, i) => `2026-11-${String(1 + i).padStart(2, '0')}`);
    const r = dias.map((d) => resp('m1', q('t1', 'facil'), true, d));
    const c = conquistasMatricula(contextoFicticio({ respostas: [...r, ...dominar('m1', 't1', '2026-11-08'), ...dominar('m1', 't2', '2026-11-09')] }));
    expect(c.find((x) => x.id === 'sequencia-7')).toEqual({ id: 'sequencia-7', nome: 'Sequência de 7 dias', data: '2026-11-07' });
    expect(c.find((x) => x.id === 'trilha-concluida')).toMatchObject({ nome: 'Trilha concluída', data: '2026-11-09' });
    expect(c.map((x) => x.id).sort()).toEqual(['primeira-questao', 'primeiro-topico', 'sequencia-7', 'trilha-concluida']);
  });

  it('cada conquista aparece uma única vez e marcos de outra turma não são usados', () => {
    const outra = dominar('outra', 't1', '2026-11-01');
    const c = conquistasMatricula(contextoFicticio({ respostas: [...outra, resp('m1', q('t1', 'facil'), true, '2026-11-20')] }));
    expect(c).toEqual([{ id: 'primeira-questao', nome: 'Primeira questão', data: '2026-11-20' }]);
  });

  it('reconstruir a projeção é determinístico (não concede de novo nem muda datas)', () => {
    const c = contextoFicticio({ respostas: dominar('m1', 't1', '2026-11-10') });
    expect(conquistasMatricula(c)).toEqual(conquistasMatricula(c));
  });
});
