import { describe, expect, it } from 'vitest';
import { resolverContextoEstudo } from '../adaptativo/contexto-estudo';
import { proximaQuestaoMatricula } from '../adaptativo/estudo';
import { indicadoresDaMatricula, situacaoDoAluno } from '../desempenho/indicadores-academicos';
import { conquistasMatricula } from '../gamificacao/gamificacao';
import { ConsultasAcademicas } from './consultas-academicas';
import { criarSeedAcademico, gerarHistoricoMatricula } from './seed-academico';

describe('6.2 — [AA] Trilha independente por aluno e turma; [GA] Conquistas; [AC] Painel do aluno', () => {
  const seed = criarSeedAcademico();
  const contexto = (m: string) => resolverContextoEstudo(seed, m)!;
  const indicadores = (m: string) => indicadoresDaMatricula(contexto(m), seed.dataVirtual);

  it('todas as respostas pertencem a matrículas existentes, com ordem global crescente e IDs únicos', () => {
    expect(seed.respostas.length).toBeGreaterThan(0);
    for (const r of seed.respostas) expect(seed.matriculas.some((m) => m.id === r.matriculaId), r.id).toBe(true);
    expect(new Set(seed.respostas.map((r) => r.id)).size).toBe(seed.respostas.length);
    const momentos = seed.respostas.map((r) => r.momento);
    expect(momentos).toEqual([...momentos].sort((a, b) => a - b));
    expect(new Set(momentos).size).toBe(momentos.length);
  });

  it('o histórico é alcançável pelo motor: cada resposta é a questão que o motor escolheria dado o histórico anterior', () => {
    for (const m of seed.matriculas) {
      const base = contexto(m.id);
      base.respostas.forEach((r, i) => {
        const proxima = proximaQuestaoMatricula({ ...base, respostas: base.respostas.slice(0, i) });
        expect(proxima?.questao.id, `${m.id} #${i}`).toBe(r.questaoId);
        expect(r.topicoId).toBe(proxima?.topicoId);
      });
    }
  });

  it('avaliação e efeitos coerentes com o conteúdo apresentado: sem contadores inventados', () => {
    for (const r of seed.respostas) {
      const q = seed.questoes.find((x) => x.id === r.questaoId)!;
      expect(r.conteudoOriginal).toEqual({ enunciado: q.enunciado, alternativas: q.alternativas, correta: q.correta, explicacao: q.explicacao });
      expect(r.acertou).toBe(r.alternativa === q.correta);
      expect(r.xpConcedido).toBe(r.acertou ? { facil: 10, medio: 20, dificil: 30 }[r.dificuldade] : 0);
      expect(r.versaoRegras).toBe(1);
    }
  });

  it('gerarHistoricoMatricula é puro e determinístico e rejeita matrícula inexistente', () => {
    const plano: [number, boolean[]][] = [[2, [true, false]]];
    expect(gerarHistoricoMatricula(seed, 'm-ana-alg-a-262', plano, { valor: 0 })).toEqual(gerarHistoricoMatricula(seed, 'm-ana-alg-a-262', plano, { valor: 0 }));
    expect(() => gerarHistoricoMatricula(seed, 'inexistente', plano, { valor: 0 })).toThrow();
  });

  it('aluno sem respostas tem indicadores zerados e Sem atividade', () => {
    const i = indicadores('m-diego-alg-a-262');
    expect(i).toMatchObject({ progresso: 0, taxaAcertos: 0, totalRespostas: 0, xp: 0, sequenciaDias: 0, ultimaAtividade: null, conquistas: [], concluido: false });
    expect(situacaoDoAluno(contexto('m-diego-alg-a-262'))).toBe('sem-atividade');
  });

  it('estudo em andamento: progresso parcial, XP somado das respostas e taxa calculada do histórico', () => {
    const c = contexto('m-ana-alg-a-262'); const i = indicadores('m-ana-alg-a-262');
    expect(i.progresso).toBeGreaterThan(0); expect(i.progresso).toBeLessThan(100); expect(i.concluido).toBe(false);
    expect(i.xp).toBe(c.respostas.filter((r) => r.acertou).reduce((s, r) => s + r.xpConcedido, 0));
    expect(i.taxaAcertos).toBe((c.respostas.filter((r) => r.acertou).length / c.respostas.length) * 100);
    expect(i.totalRespostas).toBe(c.respostas.length);
  });

  it('conclusão: trilha 100% concluída com as quatro conquistas, a de sequência datada no sétimo dia seguido (4 dias atrás)', () => {
    const i = indicadores('m-elisa-alg-a-262');
    expect(i).toMatchObject({ progresso: 100, concluido: true, totalRespostas: 21, taxaAcertos: 100 });
    expect(i.conquistas.map((c) => c.id).sort()).toEqual(['primeira-questao', 'primeiro-topico', 'sequencia-7', 'trilha-concluida']);
    expect(i.conquistas.find((c) => c.id === 'sequencia-7')!.data).toBe('2026-11-13');
    expect(conquistasMatricula(contexto('m-elisa-alg-a-262'))).toEqual(i.conquistas);
  });

  it('mesma disciplina em períodos distintos: a nova oferta começa do zero e a anterior permanece intacta', () => {
    const nova = indicadores('m-ana-alg-a-271'), antiga = indicadores('m-ana-alg-a-262');
    expect(nova).toMatchObject({ progresso: 0, xp: 0, totalRespostas: 0, conquistas: [], sequenciaDias: 0 });
    expect(antiga.xp).toBeGreaterThan(0);
    expect(contexto('m-ana-alg-a-271').respostas).toEqual([]);
  });

  it('turmas paralelas e outras disciplinas do mesmo aluno não se influenciam', () => {
    expect(contexto('m-bruno-alg-b-262').respostas.every((r) => r.matriculaId === 'm-bruno-alg-b-262')).toBe(true);
    expect(indicadores('m-ana-ing-a-262').totalRespostas).toBe(5);
    expect(indicadores('m-bruno-mat-a-262').totalRespostas).toBe(3);
  });

  it('há ao menos um aluno que Precisa de atenção, para demonstrar o destaque docente', () => {
    expect(situacaoDoAluno(contexto('m-bruno-alg-b-262'))).toBe('precisa-de-atencao');
    expect(situacaoDoAluno(contexto('m-elisa-alg-a-262'))).toBe('regular');
  });

  it('o seed sustenta as consultas reais: totais administrativos e painel do professor, sobre um armazenamento isolado', async () => {
    let bruto = JSON.stringify(seed), usuarioId: string | null = null;
    const repo = new ConsultasAcademicas({ ler: () => bruto, gravar: (s) => { bruto = s; } }, { obterUsuarioId: () => usuarioId, definirUsuarioId: (id) => { usuarioId = id; } });
    await repo.entrar('u-renata');
    expect((await repo.consultarIndicadoresAdministracao()).dados).toMatchObject({
      pessoas: { total: 12 }, graduacoes: 2, disciplinas: { publicadas: 3, rascunho: 1 }, periodosLetivos: 2, turmas: 7, matriculas: 7,
    });
    await repo.entrar('u-marcos');
    const t = (await repo.consultarIndicadoresDocencia({ turmaId: 't-alg-a-262' })).dados;
    expect(t.matriculados.map((m) => [m.nome, m.situacao])).toEqual([['Ana Souza', 'regular'], ['Elisa Prado', 'regular'], ['Diego Martins', 'sem-atividade']]);
    expect(t.quantidadeMatriculados).toBe(3);
  });
});
