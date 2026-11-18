import { describe, expect, it } from 'vitest';
import { bancoCompleto, contextoFicticio, dominar, questaoFicticia, resp } from '../testes/contextos';
import { calcularEstadoMatricula } from './contexto-estudo';
import {
  deveSugerirRevisaoMatricula, errosSeguidosNoTopicoMatricula, feedbackDaResposta, proximaQuestaoMatricula,
} from './estudo';
import { faixaDificuldade } from './motor';
import { arredondarExibicao } from '../desempenho/apresentacao';

/** Respostas sintéticas com variação exata (domínios 39/69 não são alcançáveis só por +10/+15/+20). */
const comDominio = (topico: string, dominio: number) => ({
  ...resp('m1', questaoFicticia(topico, 'facil'), true, '2026-11-01'), variacaoDominio: dominio,
});

describe('5.1 — [AA] Dificuldade conforme domínio, Escolha da próxima atividade', () => {
  it.each([[0, 'facil'], [39, 'facil'], [40, 'medio'], [69, 'medio'], [70, 'dificil'], [100, 'dificil']] as const)(
    'faixa do domínio %i é %s', (dominio, esperado) => expect(faixaDificuldade(dominio)).toBe(esperado));

  it.each([[39, 'facil'], [40, 'medio'], [69, 'medio'], [70, 'dificil']] as const)(
    'com domínio %i no tópico a próxima questão é %s', (dominio, dificuldade) => {
      const c = contextoFicticio({ topicos: ['t1'], respostas: [comDominio('t1', dominio)] });
      expect(proximaQuestaoMatricula(c)).toMatchObject({ topicoId: 't1', dificuldade, questao: { dificuldade } });
    });

  it('matrícula nova recebe questão Fácil do primeiro tópico sem diagnóstico, com os demais bloqueados', () => {
    const c = contextoFicticio();
    expect(proximaQuestaoMatricula(c)).toMatchObject({ topicoId: 't1', dificuldade: 'facil' });
  });

  it('foca no tópico desbloqueado e não dominado de menor domínio (Vetores 30 × Matrizes 60 → Fácil de Vetores)', () => {
    // O encadeamento de desbloqueio torna este estado inalcançável pelo histórico; o estado é injetado
    // para exercitar somente a regra de seleção.
    const c = contextoFicticio();
    const estado = (d1: number, d2: number) => ({ matriculaId: 'm1', disciplinaId: 'd1', progresso: 0, concluido: false, topicos: [
      { topicoId: 't1', titulo: 'T1', dominio: d1, desbloqueado: true, dominado: false },
      { topicoId: 't2', titulo: 'T2', dominio: d2, desbloqueado: true, dominado: false }] });
    expect(proximaQuestaoMatricula(c, estado(30, 60))).toMatchObject({ topicoId: 't1', dificuldade: 'facil' });
    expect(proximaQuestaoMatricula(c, estado(60, 30))).toMatchObject({ topicoId: 't2', dificuldade: 'facil' });
    expect(proximaQuestaoMatricula(c, estado(45, 45))).toMatchObject({ topicoId: 't1', dificuldade: 'medio' }); // empate: ordem
  });

  it('após dominar o primeiro tópico, o único candidato é o seguinte', () => {
    const c = contextoFicticio({ respostas: dominar('m1', 't1') });
    expect(proximaQuestaoMatricula(c)).toMatchObject({ topicoId: 't2', dificuldade: 'facil' });
  });

  it('desempata pela ordem dos tópicos', () => {
    const c = contextoFicticio({ topicos: ['t1', 't2'], respostas: [comDominio('t1', 80), comDominio('t2', 0)] });
    // t1 dominado: o único candidato é t2
    expect(proximaQuestaoMatricula(c)!.topicoId).toBe('t2');
  });

  it('evita a última respondida quando há outra na dificuldade; reutiliza a menos recente sem inéditas', () => {
    const [f1, f2] = [questaoFicticia('t1', 'facil', 1), questaoFicticia('t1', 'facil', 2)];
    const apos1 = contextoFicticio({ topicos: ['t1'], respostas: [resp('m1', f1, false)] });
    expect(proximaQuestaoMatricula(apos1)!.questao.id).toBe(f2.id);
    const aposAmbas = contextoFicticio({ topicos: ['t1'], respostas: [resp('m1', f1, false), resp('m1', f2, false)] });
    expect(proximaQuestaoMatricula(aposAmbas)!.questao.id).toBe(f1.id); // menos recente, evitando a última (f2)
    const aposTres = contextoFicticio({ topicos: ['t1'], respostas: [resp('m1', f1, false), resp('m1', f2, false), resp('m1', f1, false)] });
    expect(proximaQuestaoMatricula(aposTres)!.questao.id).toBe(f2.id);
  });

  it('com uma única questão na dificuldade, repete (não há alternativa)', () => {
    const f = questaoFicticia('t1', 'facil', 1);
    const c = contextoFicticio({ topicos: ['t1'], questoes: [f], respostas: [resp('m1', f, false)] });
    expect(proximaQuestaoMatricula(c)!.questao.id).toBe(f.id);
  });

  it('só usa questões do contexto (disciplina da turma) e devolve null quando tudo está dominado', () => {
    const outra = questaoFicticia('t1', 'facil', 1, 'outra');
    const c = contextoFicticio({ topicos: ['t1'], questoes: [{ ...outra, disciplinaId: 'd1' }] });
    expect(proximaQuestaoMatricula(c)!.questao.id).toBe(outra.id);
    const concluida = contextoFicticio({ topicos: ['t1'], respostas: dominar('m1', 't1') });
    expect(proximaQuestaoMatricula(concluida)).toBeNull();
  });
});

describe('5.2 — [AA] Nível de domínio, Feedback imediato, Revisão sugerida, Conclusão da trilha da turma', () => {
  it('feedback após erro Médio com domínio 55: alternativa correta, explicação, variação −10, domínio 45', () => {
    const base = contextoFicticio({ topicos: ['t1'], respostas: [comDominio('t1', 55)] });
    const erro = resp('m1', questaoFicticia('t1', 'medio'), false);
    expect(feedbackDaResposta(base, erro)).toMatchObject({
      acertou: false, explicacao: 'Explicação 1', alternativaCorreta: { indice: 0, texto: 'certa' },
      dominioAnterior: 55, dominioAtual: 45, variacao: -10, topicoDominado: false,
    });
  });

  it('acerto não revela alternativa correta e informa domínio dominado; variação efetiva respeita o limite', () => {
    const base = contextoFicticio({ topicos: ['t1'], respostas: [comDominio('t1', 95)] });
    const f = feedbackDaResposta(base, resp('m1', questaoFicticia('t1', 'dificil'), true));
    expect(f).toMatchObject({ acertou: true, alternativaCorreta: null, dominioAtual: 100, variacao: 5, topicoDominado: true, concluido: true });
    const zero = feedbackDaResposta(contextoFicticio({ topicos: ['t1'] }), resp('m1', questaoFicticia('t1', 'facil'), false));
    expect(zero).toMatchObject({ dominioAnterior: 0, dominioAtual: 0, variacao: 0 });
  });

  it('o feedback usa o conteúdo gravado na resposta, não o cadastro corrente', () => {
    const q = questaoFicticia('t1', 'facil');
    const r = resp('m1', q, false);
    const c = contextoFicticio({ topicos: ['t1'], questoes: [{ ...q, explicacao: 'MUDOU', correta: 1 }] });
    expect(feedbackDaResposta(c, r)).toMatchObject({ explicacao: 'Explicação 1', alternativaCorreta: { indice: 0 } });
  });

  it('dois erros seguidos no mesmo tópico sugerem revisão; um acerto no meio ou outro tópico não', () => {
    const f = (acertou: boolean, t = 't1') => resp('m1', questaoFicticia(t, 'facil'), acertou);
    expect(deveSugerirRevisaoMatricula(contextoFicticio({ respostas: [f(false), f(false)] }), 't1')).toBe(true);
    expect(deveSugerirRevisaoMatricula(contextoFicticio({ respostas: [f(false), f(true), f(false)] }), 't1')).toBe(false);
    const intercalado = contextoFicticio({ respostas: [f(false), f(false, 't2'), f(false)] });
    expect(deveSugerirRevisaoMatricula(intercalado, 't1')).toBe(true); // erro de outro tópico não interrompe
    expect(deveSugerirRevisaoMatricula(intercalado, 't2')).toBe(false);
    expect(errosSeguidosNoTopicoMatricula(contextoFicticio({ respostas: [f(false), f(false), f(false)] }), 't1')).toBe(3);
  });

  it('erros de outra turma ou outro aluno não compõem a sequência (contexto filtrado por matrícula)', () => {
    const f = (m: string, acertou: boolean) => resp(m, questaoFicticia('t1', 'facil'), acertou);
    const outras = [f('m2', false), f('m2', false)];
    const c = contextoFicticio({ respostas: [...outras, f('m1', false)] });
    expect(c.respostas).toHaveLength(1);
    expect(deveSugerirRevisaoMatricula(c, 't1')).toBe(false);
    const feedback = feedbackDaResposta(c, f('m1', false));
    expect(feedback.sugerirRevisao).toBe(true); // o segundo erro da PRÓPRIA matrícula
  });

  it('o erro em outro período não dispara a sugestão no novo', () => {
    const antigo = contextoFicticio({ matriculaId: 'm-2026', respostas: [resp('m-2026', questaoFicticia('t1', 'facil'), false)] });
    const novo = contextoFicticio({ matriculaId: 'm-2027' });
    const f = feedbackDaResposta(novo, resp('m-2027', questaoFicticia('t1', 'facil'), false));
    expect(antigo.respostas).toHaveLength(1);
    expect(f.sugerirRevisao).toBe(false);
  });

  it('progresso exato antes da formatação: 1 de 6 tópicos = 100/6, exibido 17; conclusão sem aprovação acadêmica', () => {
    const topicos = ['a', 'b', 'c', 'd', 'e', 'f'];
    const parcial = calcularEstadoMatricula(contextoFicticio({ topicos, respostas: dominar('m1', 'a') }));
    expect(parcial.progresso).toBe(100 / 6);
    expect(parcial.progresso).not.toBe(17);
    expect(arredondarExibicao(parcial.progresso)).toBe(17);
    expect(parcial.concluido).toBe(false);
    const respostas = topicos.flatMap((t) => dominar('m1', t));
    const concluida = calcularEstadoMatricula(contextoFicticio({ topicos, respostas }));
    expect(concluida).toMatchObject({ progresso: 100, concluido: true });
    expect(Object.keys(concluida)).not.toContain('aprovado');
    expect(Object.keys(concluida).join()).not.toMatch(/aprova|graduacao/i);
  });

  it('progresso parcial 50% (um de dois tópicos) e sem tópicos = 0 não concluída', () => {
    expect(calcularEstadoMatricula(contextoFicticio({ respostas: dominar('m1', 't1') })).progresso).toBe(50);
    expect(calcularEstadoMatricula(contextoFicticio({ topicos: [] }))).toMatchObject({ progresso: 0, concluido: false });
  });

  it('dois erros em turmas diferentes mantêm estados independentes', () => {
    const a = contextoFicticio({ matriculaId: 'mA', respostas: [resp('mA', questaoFicticia('t1', 'facil'), false), resp('mA', questaoFicticia('t1', 'facil'), false)] });
    const b = contextoFicticio({ matriculaId: 'mB', respostas: [resp('mB', questaoFicticia('t1', 'facil'), false)] });
    expect(deveSugerirRevisaoMatricula(a, 't1')).toBe(true);
    expect(deveSugerirRevisaoMatricula(b, 't1')).toBe(false);
    void bancoCompleto;
  });
});
