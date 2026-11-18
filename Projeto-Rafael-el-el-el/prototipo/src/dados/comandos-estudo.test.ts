import { describe, expect, it } from 'vitest';
import { calcularEstadoMatricula, resolverContextoEstudo } from '../adaptativo/contexto-estudo';
import { recusaSemEfeitos } from '../testes/ambiente-comandos-academicos';
import { ambienteEstudo, questao } from '../testes/ambiente-estudo';

const alvoAna = { matriculaId: 'm-ana-26' };

describe('3.3 — [AA] Respostas somente no contexto autorizado, Feedback imediato; [PA] Aluno tenta registrar resposta por outro aluno', () => {
  it('registra resposta aceita com avaliação, efeitos, data virtual e ordem calculados pelo repositório', async () => {
    const a = ambienteEstudo(); await a.repo.entrar('u-ana'); const antes = a.ler();
    const r = await a.repo.registrarResposta(alvoAna, { questaoId: questao('tp-1', 'medio'), alternativa: 0 }, 0);
    expect(r).toMatchObject({
      matriculaId: 'm-ana-26', topicoId: 'tp-1', questaoId: questao('tp-1', 'medio'), acertou: true,
      dificuldade: 'medio', variacaoDominio: 15, xpConcedido: 20, data: antes.dataVirtual, momento: 1,
      conteudoOriginal: { enunciado: 'Texto original', alternativas: ['Sim', 'Não'], correta: 0, explicacao: 'Explicação original' },
    });
    expect(a.ler()).toEqual({ ...antes, revisao: 1, respostas: [r] });
    const proxima = await a.repo.registrarResposta(alvoAna, { questaoId: questao('tp-1', 'facil'), alternativa: 1 }, 1);
    expect(proxima).toMatchObject({ acertou: false, variacaoDominio: -15, xpConcedido: 0, momento: 2 });
  });

  it('a ordem é global e crescente entre matrículas; o contexto de cada uma só vê as próprias', async () => {
    const a = ambienteEstudo();
    await a.repo.entrar('u-ana'); await a.repo.registrarResposta(alvoAna, { questaoId: questao('tp-1', 'facil'), alternativa: 0 }, 0);
    await a.repo.entrar('u-bruno');
    const r = await a.repo.registrarResposta({ matriculaId: 'm-bruno-26' }, { questaoId: questao('tp-1', 'facil'), alternativa: 0 }, 1);
    expect(r.momento).toBe(2);
    const d = a.ler();
    expect(resolverContextoEstudo(d, 'm-ana-26')!.respostas).toHaveLength(1);
    expect(resolverContextoEstudo(d, 'm-bruno-26')!.respostas).toHaveLength(1);
  });

  it('a resposta alimenta o domínio e desbloqueia o tópico seguinte somente na matrícula certa', async () => {
    const a = ambienteEstudo(); await a.repo.entrar('u-ana');
    for (let i = 0; i < 4; i++) await a.repo.registrarResposta(alvoAna, { questaoId: questao('tp-1', 'dificil'), alternativa: 0 }, i);
    const e = calcularEstadoMatricula(resolverContextoEstudo(a.ler(), 'm-ana-26')!);
    expect(e.topicos.map((t) => [t.dominado, t.desbloqueado])).toEqual([[true, true], [false, true]]);
    const outra = calcularEstadoMatricula(resolverContextoEstudo(a.ler(), 'm-ana-27')!);
    expect(outra.topicos.every((t) => t.dominio === 0)).toBe(true);
    await a.repo.registrarResposta(alvoAna, { questaoId: questao('tp-2', 'facil'), alternativa: 0 }, 4);
  });

  describe('rejeições sem efeito algum', () => {
    it('sem sessão', async () => {
      const a = ambienteEstudo();
      await recusaSemEfeitos(a, () => a.repo.registrarResposta(alvoAna, { questaoId: questao('tp-1', 'facil'), alternativa: 0 }, 0), 'SEM_SESSAO');
    });

    it('matrícula de outro aluno (aluno diferente da sessão)', async () => {
      const a = ambienteEstudo(); await a.repo.entrar('u-ana');
      await recusaSemEfeitos(a, () => a.repo.registrarResposta({ matriculaId: 'm-bruno-26' }, { questaoId: questao('tp-1', 'facil'), alternativa: 0 }, 0), 'ACESSO_NEGADO');
    });

    it('identidade, funções ou efeitos enviados no payload', async () => {
      const a = ambienteEstudo(); await a.repo.entrar('u-ana');
      for (const extra of [{ alunoId: 'u-bruno' }, { funcoes: ['admin'] }, { acertou: true }, { xpConcedido: 999 }, { topicoId: 'tp-2' }]) {
        await recusaSemEfeitos(a, () => a.repo.registrarResposta(alvoAna,
          { questaoId: questao('tp-1', 'facil'), alternativa: 0, ...extra } as never, 0), 'VALIDACAO_REJEITADA');
      }
      await recusaSemEfeitos(a, () => a.repo.registrarResposta({ ...alvoAna, alunoId: 'u-bruno' } as never,
        { questaoId: questao('tp-1', 'facil'), alternativa: 0 }, 0), 'VALIDACAO_REJEITADA');
    });

    it('turma sem matrícula, mesmo com matrícula na turma A da mesma disciplina', async () => {
      const a = ambienteEstudo(); await a.repo.entrar('u-ana');
      await recusaSemEfeitos(a, () => a.repo.registrarResposta({ matriculaId: 'm-ana-26', turmaId: 't-b' },
        { questaoId: questao('tp-1', 'facil'), alternativa: 0 }, 0), 'ACESSO_NEGADO');
      await recusaSemEfeitos(a, () => a.repo.registrarResposta({ matriculaId: 'inexistente' },
        { questaoId: questao('tp-1', 'facil'), alternativa: 0 }, 0), 'ACESSO_NEGADO');
    });

    it('disciplina em rascunho', async () => {
      const a = ambienteEstudo((d) => { d.disciplinas.find((x) => x.id === 'd-alg')!.status = 'rascunho'; });
      await a.repo.entrar('u-ana');
      await recusaSemEfeitos(a, () => a.repo.registrarResposta(alvoAna, { questaoId: questao('tp-1', 'facil'), alternativa: 0 }, 0), 'ACESSO_NEGADO');
    });

    it('tópico bloqueado, por acesso direto', async () => {
      const a = ambienteEstudo(); await a.repo.entrar('u-ana');
      await recusaSemEfeitos(a, () => a.repo.registrarResposta(alvoAna, { questaoId: questao('tp-2', 'facil'), alternativa: 0 }, 0), 'VALIDACAO_REJEITADA');
    });

    it('questão de outra disciplina ou inexistente', async () => {
      const a = ambienteEstudo((d) => {
        d.questoes.push({ id: 'q-dir', disciplinaId: 'd-dir', topicoId: 'tp-1', dificuldade: 'facil', enunciado: 'Civil', alternativas: ['a', 'b'], correta: 0, explicacao: '', revisao: 0 });
      });
      await a.repo.entrar('u-ana');
      await recusaSemEfeitos(a, () => a.repo.registrarResposta(alvoAna, { questaoId: 'q-dir', alternativa: 0 }, 0), 'VALIDACAO_REJEITADA');
      await recusaSemEfeitos(a, () => a.repo.registrarResposta(alvoAna, { questaoId: 'nao-existe', alternativa: 0 }, 0), 'VALIDACAO_REJEITADA');
    });

    it.each([-1, 2, 0.5, '0', null])('alternativa inválida (%s)', async (alternativa) => {
      const a = ambienteEstudo(); await a.repo.entrar('u-ana');
      await recusaSemEfeitos(a, () => a.repo.registrarResposta(alvoAna, { questaoId: questao('tp-1', 'facil'), alternativa: alternativa as number }, 0), 'VALIDACAO_REJEITADA');
    });

    it('usuário desativado durante a sessão, aluno sem função Aluno e formulário obsoleto', async () => {
      const a = ambienteEstudo(); await a.repo.entrar('u-ana');
      await recusaSemEfeitos(a, () => a.repo.registrarResposta(alvoAna, { questaoId: questao('tp-1', 'facil'), alternativa: 0 }, 5), 'REVISAO_OBSOLETA');
      const b = ambienteEstudo((d) => { d.usuarios.find((u) => u.id === 'u-ana')!.ativo = false; });
      b.sessao.definirUsuarioId('u-ana');
      await recusaSemEfeitos(b, () => b.repo.registrarResposta(alvoAna, { questaoId: questao('tp-1', 'facil'), alternativa: 0 }, 0), 'SESSAO_INVALIDA');
    });

    it('professor/administrador não respondem em nome do aluno', async () => {
      for (const quem of ['u-prof', 'u-admin', 'u-carla']) {
        const a = ambienteEstudo(); await a.repo.entrar(quem);
        await recusaSemEfeitos(a, () => a.repo.registrarResposta(alvoAna, { questaoId: questao('tp-1', 'facil'), alternativa: 0 }, 0), 'ACESSO_NEGADO');
      }
    });
  });

  it('respostas registradas não podem ser alteradas por comandos de outra coleção', async () => {
    const a = ambienteEstudo(); await a.repo.entrar('u-ana');
    await a.repo.registrarResposta(alvoAna, { questaoId: questao('tp-1', 'facil'), alternativa: 0 }, 0);
    await a.repo.entrar('u-admin');
    const antes = a.ler().respostas;
    await a.repo.criarGraduacao({ codigo: 'X', nome: 'X', descricao: '', area: '' }, 1);
    expect(a.ler().respostas).toEqual(antes);
  });
});
