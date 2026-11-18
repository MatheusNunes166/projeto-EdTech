import { describe, expect, it } from 'vitest';
import type { DadosAcademicos, RespostaAcademica } from '../dominio/tipos';
import { prepararConteudoPublicado } from '../testes/ambiente-comandos-academicos';
import { criarFixtureAutorizacao } from '../testes/fixtures-autorizacao';
import { calcularEstadoMatricula, resolverContextoEstudo } from './contexto-estudo';
import { criarRespostaAcademica } from './respostas';

function dadosBase(): DadosAcademicos {
  const d = criarFixtureAutorizacao();
  prepararConteudoPublicado(d);
  d.usuarios.push({ id: 'u-bruno', nome: 'Bruno', email: 'b@exemplo.com', ativo: true, funcoes: ['aluno'] });
  d.turmas.push({ id: 't-b', codigo: 'B', disciplinaId: 'd-alg', periodoLetivoId: 'p-26' });
  d.matriculas.push(
    { id: 'm-bruno-26', alunoId: 'u-bruno', turmaId: 't-26', data: d.dataVirtual },
    { id: 'm-ana-b', alunoId: 'u-ana', turmaId: 't-b', data: d.dataVirtual },
  );
  return d;
}
let momento = 0;
function responder(d: DadosAcademicos, matriculaId: string, topico: string, dif: 'facil' | 'medio' | 'dificil', alternativa: number): RespostaAcademica {
  const questao = d.questoes.find((q) => q.topicoId === topico && q.dificuldade === dif)!;
  const r = criarRespostaAcademica({ id: `r-${++momento}`, matriculaId, questao, alternativa, data: d.dataVirtual, momento });
  d.respostas.push(structuredClone(r));
  return r;
}
/** Quatro acertos Difíceis (+20) levam o domínio a 80. */
const dominarTopico1 = (d: DadosAcademicos, m: string) => { for (let i = 0; i < 4; i++) responder(d, m, 'tp-1', 'dificil', 0); };

describe('3.2 — [AA] Trilha independente, Inicialização e retomada, Nível de domínio, Desbloqueio', () => {
  it('resolve matrícula → aluno, turma, disciplina e período, só com respostas dessa matrícula', () => {
    const d = dadosBase(); responder(d, 'm-ana-26', 'tp-1', 'facil', 0); responder(d, 'm-bruno-26', 'tp-1', 'facil', 1);
    const c = resolverContextoEstudo(d, 'm-ana-26')!;
    expect(c).toMatchObject({ matriculaId: 'm-ana-26', alunoId: 'u-ana', turmaId: 't-26', periodoLetivoId: 'p-26' });
    expect(c.disciplina.id).toBe('d-alg');
    expect(c.respostas.map((r) => r.matriculaId)).toEqual(['m-ana-26']);
    expect(c.questoes.every((q) => q.disciplinaId === 'd-alg')).toBe(true);
  });

  it.each(['inexistente', ''])('não resolve matrícula inexistente (%s)', (id) => {
    expect(resolverContextoEstudo(dadosBase(), id)).toBeUndefined();
  });

  it('não resolve relações quebradas (turma, disciplina, aluno ou período ausentes)', () => {
    for (const quebrar of [
      (d: DadosAcademicos) => { d.turmas = d.turmas.filter((t) => t.id !== 't-26'); },
      (d: DadosAcademicos) => { d.disciplinas = d.disciplinas.filter((x) => x.id !== 'd-alg'); },
      (d: DadosAcademicos) => { d.usuarios = d.usuarios.filter((u) => u.id !== 'u-ana'); },
      (d: DadosAcademicos) => { d.periodosLetivos = d.periodosLetivos.filter((p) => p.id !== 'p-26'); },
    ]) {
      const d = dadosBase(); quebrar(d);
      expect(resolverContextoEstudo(d, 'm-ana-26')).toBeUndefined();
    }
  });

  it('matrícula nova começa com domínio 0, progresso 0, histórico vazio e só o primeiro tópico desbloqueado', () => {
    const estado = calcularEstadoMatricula(resolverContextoEstudo(dadosBase(), 'm-ana-26')!);
    expect(estado.topicos).toEqual([
      { topicoId: 'tp-1', titulo: 'tp-1', dominio: 0, desbloqueado: true, dominado: false },
      { topicoId: 'tp-2', titulo: 'tp-2', dominio: 0, desbloqueado: false, dominado: false },
    ]);
    expect(estado).toMatchObject({ progresso: 0, concluido: false });
  });

  it('aplica os efeitos gravados na ordem, com limites 0–100 (erro em zero não fica negativo)', () => {
    const d = dadosBase();
    responder(d, 'm-ana-26', 'tp-1', 'facil', 1); // erro em 0 permanece 0
    expect(calcularEstadoMatricula(resolverContextoEstudo(d, 'm-ana-26')!).topicos[0].dominio).toBe(0);
    responder(d, 'm-ana-26', 'tp-1', 'medio', 0); // +15
    expect(calcularEstadoMatricula(resolverContextoEstudo(d, 'm-ana-26')!).topicos[0].dominio).toBe(15);
  });

  it('dominar o tópico (80) o marca dominado e desbloqueia o seguinte; progresso é exato', () => {
    const d = dadosBase(); dominarTopico1(d, 'm-ana-26');
    const e = calcularEstadoMatricula(resolverContextoEstudo(d, 'm-ana-26')!);
    expect(e.topicos.map((t) => [t.dominio, t.dominado, t.desbloqueado])).toEqual([[80, true, true], [0, false, true]]);
    expect(e.progresso).toBe(50);
    expect(e.concluido).toBe(false);
  });

  it('dois alunos na mesma turma não se influenciam', () => {
    const d = dadosBase(); dominarTopico1(d, 'm-ana-26');
    const bruno = calcularEstadoMatricula(resolverContextoEstudo(d, 'm-bruno-26')!);
    expect(bruno.topicos.map((t) => [t.dominio, t.desbloqueado])).toEqual([[0, true], [0, false]]);
    expect(resolverContextoEstudo(d, 'm-bruno-26')!.respostas).toEqual([]);
  });

  it('turmas paralelas da mesma disciplina e período não se influenciam', () => {
    const d = dadosBase(); dominarTopico1(d, 'm-ana-26');
    const emB = calcularEstadoMatricula(resolverContextoEstudo(d, 'm-ana-b')!);
    expect(emB.topicos.map((t) => t.dominio)).toEqual([0, 0]);
    expect(emB.topicos[1].desbloqueado).toBe(false);
  });

  it('dois períodos da mesma disciplina: nova matrícula começa do zero e a anterior segue intacta', () => {
    const d = dadosBase(); dominarTopico1(d, 'm-ana-26');
    const antes = JSON.stringify(calcularEstadoMatricula(resolverContextoEstudo(d, 'm-ana-26')!));
    const novo = calcularEstadoMatricula(resolverContextoEstudo(d, 'm-ana-27')!);
    expect(resolverContextoEstudo(d, 'm-ana-27')!.respostas).toEqual([]);
    expect(novo.topicos.map((t) => [t.dominio, t.dominado, t.desbloqueado])).toEqual([[0, false, true], [0, false, false]]);
    expect(novo.progresso).toBe(0);
    expect(JSON.stringify(calcularEstadoMatricula(resolverContextoEstudo(d, 'm-ana-26')!))).toBe(antes);
  });

  it('ignora respostas de outra matrícula mesmo se passadas no contexto', () => {
    const d = dadosBase(); dominarTopico1(d, 'm-ana-26');
    const c = resolverContextoEstudo(d, 'm-bruno-26')!;
    const estado = calcularEstadoMatricula({ ...c, respostas: d.respostas });
    expect(estado.topicos[0].dominio).toBe(0);
  });

  it('disciplina sem tópicos: progresso 0 e sem conclusão', () => {
    const d = criarFixtureAutorizacao();
    const e = calcularEstadoMatricula(resolverContextoEstudo(d, 'm-ana-26')!);
    expect(e).toMatchObject({ topicos: [], progresso: 0, concluido: false });
  });
});
