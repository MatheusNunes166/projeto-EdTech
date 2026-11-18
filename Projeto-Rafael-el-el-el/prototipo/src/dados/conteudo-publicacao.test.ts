import { describe, expect, it } from 'vitest';
import { calcularEstadoMatricula, resolverContextoEstudo } from '../adaptativo/contexto-estudo';
import { verificarPublicacaoDisciplina } from '../conteudo/regras-disciplina';
import { recusaSemEfeitos } from '../testes/ambiente-comandos-academicos';
import { ALVO, ambienteEstudo, candidatoDe, concluirTrilha, questao, responderComo } from '../testes/ambiente-estudo';

const rascunho = (d: import('../dominio/tipos').DadosAcademicos) => { d.disciplinas.find((x) => x.id === 'd-alg')!.status = 'rascunho'; };
const rej = 'VALIDACAO_REJEITADA';
const detalhes = async (p: Promise<unknown>) => p.then(() => ({}), (e) => (e as { detalhes: Record<string, string> }).detalhes);

describe('4.5 — [GC] Publicação de conteúdo da disciplina, Validade contínua do conteúdo publicado', () => {
  it('cobertura pura: lista tópicos e dificuldades faltantes e só conta questões da disciplina e do tópico', () => {
    const d = { id: 'd', topicos: [{ id: 't1', titulo: 'Vetores' }, { id: 't2', titulo: 'Laços' }] };
    const qs = [
      { disciplinaId: 'd', topicoId: 't1', dificuldade: 'facil' as const }, { disciplinaId: 'd', topicoId: 't1', dificuldade: 'medio' as const },
      { disciplinaId: 'outra', topicoId: 't1', dificuldade: 'dificil' as const },
      { disciplinaId: 'd', topicoId: 't2', dificuldade: 'facil' as const }, { disciplinaId: 'd', topicoId: 't2', dificuldade: 'medio' as const }, { disciplinaId: 'd', topicoId: 't2', dificuldade: 'dificil' as const },
    ];
    expect(verificarPublicacaoDisciplina(d, qs)).toEqual({ ok: false, semTopicos: false, faltantes: [{ topicoId: 't1', titulo: 'Vetores', niveis: ['dificil'] }] });
    expect(verificarPublicacaoDisciplina({ id: 'd', topicos: [] }, [])).toMatchObject({ ok: false, semTopicos: true });
  });

  it.each(['u-carla', 'u-admin'])('%s publica conteúdo completo; a disciplina passa a publicada sem criar matrículas', async (quem) => {
    const a = ambienteEstudo(rascunho); await a.repo.entrar(quem); const antes = a.ler();
    await a.repo.publicarConteudo(ALVO, 0);
    expect(a.ler().disciplinas[0].status).toBe('publicado');
    expect(a.ler()).toEqual({ ...antes, revisao: 1, disciplinas: [{ ...antes.disciplinas[0], status: 'publicado' }, ...antes.disciplinas.slice(1)] });
    await a.repo.entrar('u-ana');
    const { dados } = await a.repo.consultarMinhasTurmas();
    expect(dados.find((t) => t.turma.id === 't-26')!.conteudoDisponivel).toBe(true);
  });

  it('publicar de novo é idempotente (sem gravação)', async () => {
    const a = ambienteEstudo(); await a.repo.entrar('u-carla'); const antes = a.bruto();
    await a.repo.publicarConteudo(ALVO, 0); expect(a.bruto()).toBe(antes);
  });

  it('bloqueia a publicação por cobertura, mantém rascunho e lista tópico e dificuldade faltantes', async () => {
    const a = ambienteEstudo((d) => { rascunho(d); d.questoes = d.questoes.filter((q) => q.id !== questao('tp-2', 'dificil')); });
    await a.repo.entrar('u-carla');
    expect(await detalhes(a.repo.publicarConteudo(ALVO, 0))).toEqual({ 'cobertura.tp-2.dificil': expect.stringContaining('Difícil') });
    await recusaSemEfeitos(a, () => a.repo.publicarConteudo(ALVO, 0), rej);
    expect(a.ler().disciplinas[0].status).toBe('rascunho');
  });

  it('rejeita publicar disciplina sem tópicos', async () => {
    const a = ambienteEstudo((d) => { rascunho(d); d.disciplinas[0].topicos = []; d.questoes = []; });
    await a.repo.entrar('u-admin');
    expect(await detalhes(a.repo.publicarConteudo(ALVO, 0))).toEqual({ topicos: expect.stringContaining('ao menos um tópico') });
  });

  it('nega publicação a Coordenador sem vínculo docente, Professor sem vínculo, Aluno e sem sessão', async () => {
    const a = ambienteEstudo(rascunho);
    await recusaSemEfeitos(a, () => a.repo.publicarConteudo(ALVO, 0), 'SEM_SESSAO');
    for (const quem of ['u-coord', 'u-prof', 'u-ana']) { await a.repo.entrar(quem); await recusaSemEfeitos(a, () => a.repo.publicarConteudo(ALVO, 0), 'ACESSO_NEGADO'); }
  });

  it('publicação não aceita conteúdo junto nem campos extras', async () => {
    const a = ambienteEstudo(rascunho); await a.repo.entrar('u-carla');
    await recusaSemEfeitos(a, () => a.repo.publicarConteudo({ ...ALVO, status: 'x' } as never, 0), rej);
  });

  it('conteúdo em rascunho pode ser salvo com cobertura incompleta, mas questões continuam validadas', async () => {
    const a = ambienteEstudo(rascunho); await a.repo.entrar('u-carla'); const c = candidatoDe(a.ler());
    c.questoes = c.questoes.filter((q) => q.id !== questao('tp-1', 'dificil'));
    await a.repo.salvarConteudo(ALVO, c, 0);
    const d = candidatoDe(a.ler()); d.questoes[0].correta = 9;
    await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, d, a.ler().revisao), rej);
  });

  describe('todo salvamento de disciplina publicada revalida o estado final', () => {
    it('edição válida de questão sem respostas mantém a disciplina publicada e os resultados dos alunos', async () => {
      const a = ambienteEstudo(); await responderComo(a, 'u-ana', 'm-ana-26', questao('tp-1', 'facil'));
      await a.repo.entrar('u-carla'); const c = candidatoDe(a.ler()); c.questoes.find((q) => q.id === questao('tp-2', 'medio'))!.enunciado = 'Corrigida';
      const antes = a.ler().respostas;
      await a.repo.salvarConteudo(ALVO, c, a.ler().revisao);
      expect(a.ler().disciplinas[0].status).toBe('publicado'); expect(a.ler().respostas).toEqual(antes);
    });

    it('rejeita excluir a única questão Difícil, ou mudar sua dificuldade, indicando tópico e nível', async () => {
      const a = ambienteEstudo(); await a.repo.entrar('u-carla');
      const excluir = candidatoDe(a.ler()); excluir.questoes = excluir.questoes.filter((q) => q.id !== questao('tp-1', 'dificil'));
      expect(await detalhes(a.repo.salvarConteudo(ALVO, excluir, 0))).toEqual({ 'cobertura.tp-1.dificil': expect.stringContaining('tp-1') });
      await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, excluir, 0), rej);
      const mudar = candidatoDe(a.ler()); mudar.questoes.find((q) => q.id === questao('tp-1', 'dificil'))!.dificuldade = 'medio';
      expect(await detalhes(a.repo.salvarConteudo(ALVO, mudar, 0))).toEqual({ 'cobertura.tp-1.dificil': expect.any(String) });
      await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, mudar, 0), rej);
      expect(a.ler().disciplinas[0].status).toBe('publicado');
    });

    it('rejeita remover o único tópico de disciplina publicada sem respostas', async () => {
      const a = ambienteEstudo((d) => {
        d.disciplinas[0].topicos = [d.disciplinas[0].topicos[0]]; d.questoes = d.questoes.filter((q) => q.topicoId === 'tp-1');
      });
      await a.repo.entrar('u-carla');
      await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, { topicos: [], questoes: [] }, 0), rej);
      expect(a.ler().disciplinas[0]).toMatchObject({ status: 'publicado' }); expect(a.ler().disciplinas[0].topicos).toHaveLength(1);
      expect(await detalhes(a.repo.salvarConteudo(ALVO, { topicos: [], questoes: [] }, 0))).toMatchObject({ topicos: expect.stringContaining('ao menos um tópico') });
    });

    it('nunca despublica nem altera status pelo salvamento de conteúdo', async () => {
      const a = ambienteEstudo(); await a.repo.entrar('u-carla');
      const c = candidatoDe(a.ler()); c.topicos[0].titulo = 'Outro nome';
      await a.repo.salvarConteudo(ALVO, c, 0);
      expect(a.ler().disciplinas[0].status).toBe('publicado');
    });
  });
});

describe('4.6 — [GC] Materiais por tópico; [AA]/[GA] preservação do estado e da gamificação', () => {
  const material = { id: 'v1', tipo: 'video' as const, titulo: 'Aula', conteudo: 'https://exemplo.com/v1' };

  async function cenario() {
    const a = ambienteEstudo((d) => {
      d.matriculas.push({ id: 'm-bruno-b', alunoId: 'u-bruno', turmaId: 't-b', data: d.dataVirtual });
      d.disciplinas[0].topicos[0].materiais.push({ ...material });
    });
    await responderComo(a, 'u-ana', 'm-ana-26', questao('tp-1', 'facil')); // Ana em andamento em A
    await responderComo(a, 'u-ana', 'm-ana-26', questao('tp-1', 'dificil'), 1);
    await concluirTrilha(a, 'u-bruno', 'm-bruno-b'); // Bruno conclui em B
    return a;
  }
  const projecoes = (a: Awaited<ReturnType<typeof cenario>>) => ['m-ana-26', 'm-bruno-b'].map((m) => {
    const c = resolverContextoEstudo(a.ler(), m)!;
    return { estado: calcularEstadoMatricula(c), xp: c.respostas.reduce((s, r) => s + r.xpConcedido, 0), respostas: structuredClone(c.respostas) };
  });

  it('corrige link com trilhas em andamento e concluída: registros, efeitos, XP e progresso inalterados; link visível nas duas turmas', async () => {
    const a = await cenario(); const antes = projecoes(a); const questoesAntes = a.ler().questoes; expect(antes[1].estado.concluido).toBe(true);
    await a.repo.entrar('u-carla');
    await a.repo.salvarMateriais(ALVO, [{ topicoId: 'tp-1', materiais: [{ ...material, conteudo: 'https://exemplo.com/corrigido' }] }], a.ler().revisao);
    expect(a.ler().disciplinas[0].topicos[0].materiais[0].conteudo).toBe('https://exemplo.com/corrigido');
    expect(projecoes(a)).toEqual(antes);
    expect(a.ler().questoes).toEqual(questoesAntes);
  });

  it('adiciona material a um tópico', async () => {
    const a = ambienteEstudo(); await a.repo.entrar('u-carla');
    await a.repo.salvarMateriais(ALVO, [{ topicoId: 'tp-2', materiais: [material] }], 0);
    expect(a.ler().disciplinas[0].topicos[1].materiais).toEqual([material]);
  });

  it('o ajuste não altera tópicos, questões, revisões de questão nem outras coleções', async () => {
    const a = await cenario(); await a.repo.entrar('u-admin'); const antes = a.ler();
    await a.repo.salvarMateriais(ALVO, [{ topicoId: 'tp-1', materiais: [{ ...material, titulo: 'Novo título' }] }], a.ler().revisao);
    const d = a.ler();
    expect(d.questoes).toEqual(antes.questoes); expect(d.respostas).toEqual(antes.respostas); expect(d.revisoesTextuais).toEqual(antes.revisoesTextuais);
    expect(d.disciplinas[0].topicos.map((t) => [t.id, t.titulo])).toEqual(antes.disciplinas[0].topicos.map((t) => [t.id, t.titulo]));
  });

  it('o payload de material não admite questões, resultados, títulos de tópico ou outro campo', async () => {
    const a = await cenario(); await a.repo.entrar('u-carla');
    for (const ajuste of [
      { topicoId: 'tp-1', materiais: [], questoes: [] }, { topicoId: 'tp-1', titulo: 'x', materiais: [] },
      { topicoId: 'tp-1', materiais: [{ ...material, acertou: true }] },
    ]) await recusaSemEfeitos(a, () => a.repo.salvarMateriais(ALVO, [ajuste as never], a.ler().revisao), rej);
    await recusaSemEfeitos(a, () => a.repo.salvarMateriais(ALVO, [{ topicoId: 'inexistente', materiais: [] }], a.ler().revisao), rej);
    await recusaSemEfeitos(a, () => a.repo.salvarMateriais(ALVO, [{ topicoId: 'tp-1', materiais: [{ ...material, titulo: ' ' }] }], a.ler().revisao), rej);
    await recusaSemEfeitos(a, () => a.repo.salvarMateriais(ALVO, [{ topicoId: 'tp-1', materiais: [{ ...material, tipo: 'audio' as never }] }], a.ler().revisao), rej);
  });

  it('exige autorização docente, não concede permissão para questões e valida revisão', async () => {
    const a = await cenario();
    for (const quem of ['u-coord', 'u-prof', 'u-ana']) { await a.repo.entrar(quem); await recusaSemEfeitos(a, () => a.repo.salvarMateriais(ALVO, [{ topicoId: 'tp-1', materiais: [] }], a.ler().revisao), 'ACESSO_NEGADO'); }
    await a.repo.entrar('u-carla');
    await recusaSemEfeitos(a, () => a.repo.salvarMateriais(ALVO, [{ topicoId: 'tp-1', materiais: [] }], 99), 'REVISAO_OBSOLETA');
  });
});
