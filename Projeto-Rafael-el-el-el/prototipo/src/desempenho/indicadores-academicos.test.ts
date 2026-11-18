import { describe, expect, it } from 'vitest';
import { contextoFicticio, dominar, resp, questaoFicticia } from '../testes/contextos';
import { criarFixtureAutorizacao } from '../testes/fixtures-autorizacao';
import { prepararEstudo } from '../testes/ambiente-estudo';
import type { DadosAcademicos } from '../dominio/tipos';
import { calcularEstadoMatricula } from '../adaptativo/contexto-estudo';
import { exibirMedias } from './apresentacao';
import {
  calcularMediasTurma, contextosDaTurma, indicadoresDaMatricula, situacaoDoAluno, taxaAcertosMatricula,
  ultimaAtividadeMatricula, ultimasRespostas,
} from './indicadores-academicos';

const q = questaoFicticia;
const cinco = ['t1', 't2', 't3', 't4', 't5'];
/** Aluno com N tópicos dominados (de T) e domínios exatos por tópico (quatro acertos Difíceis = 80). */
const aluno = (m: string, topicos: string[], dominados: number) =>
  contextoFicticio({ matriculaId: m, topicos, respostas: topicos.slice(0, dominados).flatMap((t) => dominar(m, t)) });

describe('5.6 — [AC] Progresso médio por turma, Domínio médio por tópico da turma', () => {
  it('progresso 80% e 0% resultam em 40%, e domínio 80 e 0 em 40', () => {
    const m = calcularMediasTurma([aluno('ana', cinco, 4), aluno('bruno', cinco, 0)]);
    expect(m).toMatchObject({ situacao: 'calculadas', progressoMedio: 40 });
    expect(m.situacao === 'calculadas' && m.dominioMedioPorTopico.map((t) => t.dominio)).toEqual([40, 40, 40, 40, 0]);
  });

  it('quem não iniciou contribui com zero no divisor e na soma', () => {
    const m = calcularMediasTurma([aluno('ana', ['v'], 1), aluno('b', ['v'], 0), aluno('c', ['v'], 0)]);
    expect(m.situacao === 'calculadas' && m.dominioMedioPorTopico[0].dominio).toBeCloseTo(80 / 3, 10);
  });

  it('só os matriculados da turma compõem soma e divisor; alteração em outra turma não afeta', () => {
    const dados: DadosAcademicos = criarFixtureAutorizacao(); prepararEstudo(dados);
    dados.turmas.push({ id: 't-c', codigo: 'C', disciplinaId: 'd-alg', periodoLetivoId: 'p-26' });
    const mediaDeA = () => calcularMediasTurma(contextosDaTurma(dados, 't-26'));
    const antes = mediaDeA();
    expect(contextosDaTurma(dados, 't-26').map((c) => c.matriculaId).sort()).toEqual(['m-ana-26', 'm-bruno-26']);
    dados.matriculas.push({ id: 'm-nova', alunoId: 'u-bruno', turmaId: 't-c', data: dados.dataVirtual }); // outra turma
    expect(mediaDeA()).toEqual(antes);
    expect(contextosDaTurma(dados, 't-c')).toHaveLength(1);
  });

  it('turma sem matriculados não tem médias calculadas', () => {
    expect(calcularMediasTurma([])).toEqual({ situacao: 'sem-dados' });
    const dados: DadosAcademicos = criarFixtureAutorizacao(); prepararEstudo(dados);
    expect(contextosDaTurma(dados, 't-b')).toEqual([]);
  });

  it('turmas B com 100% não participam de A (80% e 0% → 40%)', () => {
    const A = calcularMediasTurma([aluno('a1', cinco, 4), aluno('a2', cinco, 0)]);
    const B = calcularMediasTurma([aluno('b1', cinco, 5), aluno('b2', cinco, 5)]);
    expect(A).toMatchObject({ progressoMedio: 40 }); expect(B).toMatchObject({ progressoMedio: 100 });
  });
});

describe('5.7 — [AC] Precisão e exibição das médias, Turma sem alunos, Painel do coordenador', () => {
  const seis = ['a', 'b', 'c', 'd', 'e', 'f'];

  it('seis tópicos com 1, 1 e 4 dominados: média exata 100/3 exibida 33 (e não 34 pelos individuais 17, 17, 67)', () => {
    const alunos = [aluno('x', seis, 1), aluno('y', seis, 1), aluno('z', seis, 4)];
    const m = calcularMediasTurma(alunos);
    expect(m.situacao === 'calculadas' && m.progressoMedio).toBeCloseTo(100 / 3 + 0, 8);
    expect(m.situacao === 'calculadas' && m.progressoMedio).toBeCloseTo(((100 / 6) + (100 / 6) + (400 / 6)) / 3, 10);
    expect(exibirMedias(m)).toMatchObject({ situacao: 'calculadas', progressoMedio: 33 });
    const arredondadosAntes = alunos.map((a) => Math.round(calcularEstadoMatricula(a).progresso));
    expect(arredondadosAntes).toEqual([17, 17, 67]);
    expect(Math.round(arredondadosAntes.reduce((s, v) => s + v, 0) / 3)).toBe(34); // o erro que se evita
  });

  it('domínio 80, 0 e 0 → 80/3 exibido 27, sem arredondar parcelas', () => {
    const m = calcularMediasTurma([aluno('a', ['v'], 1), aluno('b', ['v'], 0), aluno('c', ['v'], 0)]);
    const exibida = exibirMedias(m);
    expect(exibida.situacao === 'calculadas' && exibida.dominioMedioPorTopico[0].dominio).toBe(27);
    expect(m.situacao === 'calculadas' && m.dominioMedioPorTopico[0].dominio).not.toBe(27);
  });

  it('empate de meio ponto: 80 e 5 → 42,5 exibido 43', () => {
    const cinco5 = contextoFicticio({ matriculaId: 'b', topicos: ['v'], respostas: [resp('b', q('v', 'facil'), true, '2026-11-10')] });
    const quase = contextoFicticio({ matriculaId: 'b', topicos: ['v'], respostas: [{ ...cinco5.respostas[0], variacaoDominio: 5 }] });
    const m = calcularMediasTurma([aluno('a', ['v'], 1), quase]);
    expect(m.situacao === 'calculadas' && m.dominioMedioPorTopico[0].dominio).toBe(42.5);
    const exibida = exibirMedias(m);
    expect(exibida.situacao === 'calculadas' && exibida.dominioMedioPorTopico[0].dominio).toBe(43);
  });

  it('turma vazia exibe Sem dados, nunca zero nem valores inválidos', () => {
    expect(exibirMedias(calcularMediasTurma([]))).toEqual({ situacao: 'sem-dados', rotulo: 'Sem dados' });
    const comAlunosZero = exibirMedias(calcularMediasTurma([aluno('a', ['v'], 0)]));
    expect(comAlunosZero).toMatchObject({ situacao: 'calculadas', progressoMedio: 0 }); // média zero ≠ Sem dados
  });

  it('cada linha de média é independente: nenhuma função devolve média global entre turmas', () => {
    const A = calcularMediasTurma([aluno('a', cinco, 4)]), B = calcularMediasTurma([aluno('b', cinco, 0)]);
    expect([A, B]).toEqual([expect.objectContaining({ progressoMedio: 80 }), expect.objectContaining({ progressoMedio: 0 })]);
  });
});

describe('5.8 — [AC] Painel do aluno, Alunos com dificuldade, Detalhe de aluno para o professor, Painel do responsável', () => {
  const rs = (m: string, padrao: boolean[], data = '2026-11-10') => padrao.map((a) => resp(m, q('t1', 'facil'), a, data));

  it('taxa de acertos: 3 acertos em 4 respostas = 75; sem respostas 0 com total 0 (Sem atividade)', () => {
    expect(taxaAcertosMatricula({ respostas: rs('m1', [true, true, true, false]) })).toEqual({ acertos: 3, total: 4, taxa: 75 });
    expect(taxaAcertosMatricula({ respostas: [] })).toEqual({ acertos: 0, total: 0, taxa: 0 });
  });

  it('limite de atenção: menos de 50% destaca; exatamente 5 em 10 não', () => {
    expect(situacaoDoAluno({ respostas: rs('m1', [true, true, true, false, false, false, false, false, false, false]) })).toBe('precisa-de-atencao');
    expect(situacaoDoAluno({ respostas: rs('m1', [true, false, true, false, true, false, true, false, true, false]) })).toBe('regular');
  });

  it('usa só as últimas dez respostas: erros antigos já saíram da janela', () => {
    const antigos = rs('m1', Array(8).fill(false)); const recentes = rs('m1', Array(10).fill(true));
    expect(situacaoDoAluno({ respostas: [...antigos, ...recentes] })).toBe('regular');
    expect(ultimasRespostas({ respostas: [...antigos, ...recentes] })).toHaveLength(10);
  });

  it('menos de dez respostas usa as disponíveis (duas erradas destacam); sem respostas é Sem atividade', () => {
    expect(situacaoDoAluno({ respostas: rs('m1', [false, false]) })).toBe('precisa-de-atencao');
    expect(situacaoDoAluno({ respostas: [] })).toBe('sem-atividade');
  });

  it('exclui respostas de outras ofertas: erros em outra turma não entram no cálculo', () => {
    const errosOutraTurma = rs('outra', Array(10).fill(false));
    const c = contextoFicticio({ matriculaId: 'm1', respostas: [...rs('m1', [true, false, true, false, true, false, true, false, true, false]), ...errosOutraTurma] });
    expect(c.respostas).toHaveLength(10);
    expect(situacaoDoAluno(c)).toBe('regular');
    expect(taxaAcertosMatricula(c).taxa).toBe(50);
  });

  it('última atividade: maior data do histórico da matrícula, null sem respostas', () => {
    expect(ultimaAtividadeMatricula({ respostas: [...rs('m1', [true], '2026-11-03'), ...rs('m1', [true], '2026-11-09'), ...rs('m1', [true], '2026-11-05')] })).toBe('2026-11-09');
    expect(ultimaAtividadeMatricula({ respostas: [] })).toBeNull();
  });

  it('indicadores da matrícula reúnem progresso, domínio, taxa, XP, sequência, conquistas e última atividade', () => {
    const c = contextoFicticio({ respostas: [...dominar('m1', 't1', '2026-11-16'), ...rs('m1', [false], '2026-11-17')] });
    const i = indicadoresDaMatricula(c, '2026-11-17');
    expect(i).toMatchObject({ matriculaId: 'm1', progresso: 50, concluido: false, taxaAcertos: 80, totalRespostas: 5, xp: 120, sequenciaDias: 2, ultimaAtividade: '2026-11-17' });
    expect(i.dominioPorTopico).toEqual([{ topicoId: 't1', titulo: 'T1', dominio: 65 }, { topicoId: 't2', titulo: 'T2', dominio: 0 }]);
    expect(i.conquistas.map((x) => x.id)).toEqual(['primeira-questao', 'primeiro-topico']);
  });
});
