import { describe, expect, it, vi } from 'vitest';
import { calcularEstadoMatricula, resolverContextoEstudo } from '../adaptativo/contexto-estudo';
import { recusaSemEfeitos } from '../testes/ambiente-comandos-academicos';
import { ALVO, ambienteEstudo, candidatoDe, concluirTrilha, questao, responderComo } from '../testes/ambiente-estudo';

const pegar = async (a: ReturnType<typeof ambienteEstudo>, quem = 'u-carla') => { await a.repo.entrar(quem); return candidatoDe(a.ler()); };

describe('4.1 — [GC] Conteúdo pertencente à disciplina, Escopo do professor sobre conteúdo', () => {
  it.each(['u-carla', 'u-admin'])('%s salva o candidato completo e só tópicos/materiais/questões mudam', async (autor) => {
    const a = ambienteEstudo(); const antes = a.ler(); const c = await pegar(a, autor);
    c.topicos[0].materiais.push({ id: 'mat-1', tipo: 'texto', titulo: 'Aula 1', conteudo: 'Texto' });
    c.questoes[0].enunciado = 'Enunciado novo';
    const salvo = await a.repo.salvarConteudo(ALVO, c, 0);
    const d = a.ler();
    expect(d.revisao).toBe(1);
    expect(d.disciplinas[0].topicos[0].materiais).toEqual([{ id: 'mat-1', tipo: 'texto', titulo: 'Aula 1', conteudo: 'Texto' }]);
    expect(d.questoes.find((q) => q.id === c.questoes[0].id)).toMatchObject({ enunciado: 'Enunciado novo', revisao: 1 });
    expect(salvo.topicos[0].materiais).toHaveLength(1);
    const { disciplinas: _d, questoes: _q, revisao: _r, ...resto } = d; const { disciplinas: _d2, questoes: _q2, revisao: _r2, ...restoAntes } = antes;
    expect(resto).toEqual(restoAntes);
    expect(d.disciplinas[0]).toMatchObject({ status: 'publicado', nome: 'Algoritmos', graduacaoId: 'g-si' });
  });

  it('edição sem diferenças não grava nem avança a revisão', async () => {
    const a = ambienteEstudo(); const c = await pegar(a); const antes = a.bruto();
    await a.repo.salvarConteudo(ALVO, c, 0);
    expect(a.bruto()).toBe(antes); expect(a.persistencia.gravar).not.toHaveBeenCalled();
  });

  it('nega Coordenador sem vínculo docente, Professor sem vínculo, Aluno, Responsável e ausência de sessão', async () => {
    const a = ambienteEstudo((d) => {
      d.usuarios.push({ id: 'u-coord-si', nome: 'Coord SI', email: 'x@x', ativo: true, funcoes: ['coordenador'] });
      d.vinculosCoordenador.push({ coordenadorId: 'u-coord-si', graduacaoId: 'g-si' });
    });
    const c = candidatoDe(a.ler()); c.topicos[0].titulo = 'Alterado';
    await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, c, 0), 'SEM_SESSAO');
    for (const quem of ['u-coord-si', 'u-coord', 'u-prof', 'u-ana', 'u-helena']) {
      await a.repo.entrar(quem);
      await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, c, 0), 'ACESSO_NEGADO');
    }
  });

  it('nega pais incompatíveis e disciplina inexistente', async () => {
    const a = ambienteEstudo(); const c = await pegar(a);
    await recusaSemEfeitos(a, () => a.repo.salvarConteudo({ disciplinaId: 'd-alg', graduacaoId: 'g-dir' }, c, 0), 'ACESSO_NEGADO');
    await recusaSemEfeitos(a, () => a.repo.salvarConteudo({ disciplinaId: 'inexistente' }, c, 0), 'ACESSO_NEGADO');
  });

  it('não aceita cadastro, publicação, alunos ou autor no payload', async () => {
    const a = ambienteEstudo(); const base = await pegar(a);
    const casos: unknown[] = [
      { ...base, status: 'rascunho' }, { ...base, nome: 'Outro' }, { ...base, respostas: [] }, { ...base, autorId: 'u-admin' },
      { ...base, topicos: base.topicos.map((t) => ({ ...t, status: 'x' })) },
      { ...base, questoes: base.questoes.map((q) => ({ ...q, disciplinaId: 'd-dir' })) },
    ];
    for (const c of casos) await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, c as never, 0), 'VALIDACAO_REJEITADA');
  });

  it('rejeita formulário obsoleto e falha de persistência sem sucesso nem mutação', async () => {
    const a = ambienteEstudo(); const c = await pegar(a); c.topicos[0].titulo = 'Novo';
    await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, c, 3), 'REVISAO_OBSOLETA');
    vi.mocked(a.persistencia.gravar).mockImplementationOnce(() => { throw new Error('cota'); });
    const antes = a.bruto();
    await expect(a.repo.salvarConteudo(ALVO, c, 0)).rejects.toMatchObject({ codigo: 'FALHA_PERSISTENCIA' });
    expect(a.bruto()).toBe(antes);
  });

  it('professor de duas turmas encontra o mesmo conteúdo, sem duplicação, por qualquer oferta', async () => {
    const a = ambienteEstudo((d) => { d.vinculosProfessor.push({ professorId: 'u-carla', turmaId: 't-b' }); });
    await a.repo.entrar('u-carla');
    const { dados } = await a.repo.consultarConteudoEditavel({ disciplinaId: 'd-alg' });
    expect(dados.disciplina.topicos).toHaveLength(2); expect(dados.questoes).toHaveLength(6);
  });
});

describe('4.2 — [GC] Tópicos ordenados, Bloqueio estrutural após início do estudo', () => {
  it('reordena antes de qualquer resposta; nova matrícula começa no primeiro tópico da nova sequência', async () => {
    const a = ambienteEstudo(); const c = await pegar(a); c.topicos.reverse();
    await a.repo.salvarConteudo(ALVO, c, 0);
    expect(a.ler().disciplinas[0].topicos.map((t) => t.id)).toEqual(['tp-2', 'tp-1']);
    const estado = calcularEstadoMatricula(resolverContextoEstudo(a.ler(), 'm-ana-27')!);
    expect(estado.topicos.map((t) => [t.topicoId, t.desbloqueado])).toEqual([['tp-2', true], ['tp-1', false]]);
  });

  it('adiciona, em uma só edição, tópico com as três dificuldades em disciplina publicada', async () => {
    const a = ambienteEstudo(); const c = await pegar(a);
    c.topicos.push({ id: 'tp-3', titulo: 'Funções', materiais: [] });
    for (const dificuldade of ['facil', 'medio', 'dificil'] as const) {
      c.questoes.push({ id: `q3-${dificuldade}`, topicoId: 'tp-3', dificuldade, enunciado: 'E', alternativas: ['a', 'b'], correta: 1, explicacao: 'x', revisao: 0 });
    }
    await a.repo.salvarConteudo(ALVO, c, 0);
    expect(a.ler().disciplinas[0]).toMatchObject({ status: 'publicado' });
    expect(a.ler().disciplinas[0].topicos).toHaveLength(3);
  });

  it('remove tópico e suas questões antes do estudo; questões não somem como efeito colateral', async () => {
    const a = ambienteEstudo(); const c = await pegar(a);
    const semQuestoes = { ...c, topicos: c.topicos.slice(0, 1) };
    await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, semQuestoes, 0), 'VALIDACAO_REJEITADA'); // questões órfãs
    await a.repo.salvarConteudo(ALVO, { topicos: c.topicos.slice(0, 1), questoes: c.questoes.filter((q) => q.topicoId === 'tp-1') }, 0);
    expect(a.ler().disciplinas[0].topicos.map((t) => t.id)).toEqual(['tp-1']);
    expect(a.ler().questoes).toHaveLength(3);
  });

  it('título obrigatório e identificadores únicos', async () => {
    const a = ambienteEstudo(); const c = await pegar(a); c.topicos[0].titulo = '  ';
    await expect(a.repo.salvarConteudo(ALVO, c, 0)).rejects.toMatchObject({ detalhes: { 'topicos.0.titulo': expect.any(String) } });
    const d = candidatoDe(a.ler()); d.topicos[1].id = 'tp-1';
    await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, d, 0), 'VALIDACAO_REJEITADA');
  });

  describe('após a primeira resposta em qualquer turma da disciplina', () => {
    const tentativas = {
      adicionar: (c: ReturnType<typeof candidatoDe>) => { c.topicos.push({ id: 'tp-9', titulo: 'Novo', materiais: [] });
        for (const d of ['facil', 'medio', 'dificil'] as const) c.questoes.push({ id: `q9-${d}`, topicoId: 'tp-9', dificuldade: d, enunciado: 'E', alternativas: ['a', 'b'], correta: 0, explicacao: 'x', revisao: 0 }); },
      remover: (c: ReturnType<typeof candidatoDe>) => { c.topicos.pop(); c.questoes = c.questoes.filter((q) => q.topicoId !== 'tp-2'); },
      reordenar: (c: ReturnType<typeof candidatoDe>) => { c.topicos.reverse(); },
    };

    it.each(['u-carla', 'u-admin', 'u-prof2'])('%s: adicionar, remover e reordenar são rejeitados com explicação (aluno em andamento)', async (autor) => {
      const a = ambienteEstudo();
      await responderComo(a, 'u-ana', 'm-ana-26', questao('tp-1', 'facil'));
      await a.repo.entrar(autor);
      for (const mudar of Object.values(tentativas)) {
        const c = candidatoDe(a.ler()); mudar(c);
        await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, c, a.ler().revisao), 'VALIDACAO_REJEITADA');
      }
    });

    it('a mensagem informa que o estudo já foi iniciado', async () => {
      const a = ambienteEstudo(); await responderComo(a, 'u-ana', 'm-ana-26', questao('tp-1', 'facil'));
      await a.repo.entrar('u-carla'); const c = candidatoDe(a.ler()); tentativas.reordenar(c);
      await expect(a.repo.salvarConteudo(ALVO, c, a.ler().revisao)).rejects.toMatchObject({ detalhes: { topicos: expect.stringContaining('estudo já foi iniciado') } });
    });

    it('trilha concluída: Administrador não adiciona tópico e a trilha continua concluída', async () => {
      const a = ambienteEstudo(); await concluirTrilha(a, 'u-ana', 'm-ana-26');
      await a.repo.entrar('u-admin'); const c = candidatoDe(a.ler()); tentativas.adicionar(c);
      await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, c, a.ler().revisao), 'VALIDACAO_REJEITADA');
      expect(calcularEstadoMatricula(resolverContextoEstudo(a.ler(), 'm-ana-26')!)).toMatchObject({ concluido: true, progresso: 100 });
    });

    it('resposta em A bloqueia o professor vinculado somente à turma vazia B de outro período', async () => {
      const a = ambienteEstudo((d) => {
        d.turmas.find((t) => t.id === 't-b')!.periodoLetivoId = 'p-27';
      });
      await responderComo(a, 'u-ana', 'm-ana-26', questao('tp-1', 'facil'));
      await a.repo.entrar('u-prof2'); const c = candidatoDe(a.ler()); tentativas.reordenar(c);
      await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, c, a.ler().revisao), 'VALIDACAO_REJEITADA');
      expect(a.ler().disciplinas[0].topicos.map((t) => t.id)).toEqual(['tp-1', 'tp-2']);
    });

    it('renomear tópico respondido exige confirmação do próprio autor; materiais e questões seguem livres', async () => {
      const a = ambienteEstudo(); await responderComo(a, 'u-ana', 'm-ana-26', questao('tp-1', 'facil'));
      await a.repo.entrar('u-carla'); const c = candidatoDe(a.ler()); c.topicos[0].titulo = 'Tópico 1';
      await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, c, a.ler().revisao), 'VALIDACAO_REJEITADA');
      const confirmacao = { recursoId: 'topico:d-alg:tp-1', revisaoOriginal: a.ler().revisao, diferenca: [{ campo: 'titulo' as const, original: 'tp-1', proposto: 'Tópico 1' }] };
      await a.repo.salvarConteudo(ALVO, c, a.ler().revisao, [confirmacao]);
      expect(a.ler().disciplinas[0].topicos[0].titulo).toBe('Tópico 1');
      expect(a.ler().revisoesTextuais).toHaveLength(1);
    });
  });
});
