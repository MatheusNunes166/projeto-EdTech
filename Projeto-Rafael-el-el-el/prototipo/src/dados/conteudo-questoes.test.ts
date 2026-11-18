import { describe, expect, it } from 'vitest';
import { diferencaTextualQuestao } from '../conteudo/regras-disciplina';
import { recusaSemEfeitos } from '../testes/ambiente-comandos-academicos';
import { ALVO, ambienteEstudo, candidatoDe, questao, responderComo } from '../testes/ambiente-estudo';
import type { ConfirmacaoTextual } from './comandos-conteudo';

type Amb = ReturnType<typeof ambienteEstudo>;
const Q = questao('tp-1', 'facil');
const rej = 'VALIDACAO_REJEITADA';
const editar = async (a: Amb, quem: string) => { await a.repo.entrar(quem); return candidatoDe(a.ler()); };
const q = (c: ReturnType<typeof candidatoDe>, id = Q) => c.questoes.find((x) => x.id === id)!;
/** Confirmação do autor para a diferença exata entre a questão gravada e a proposta. */
function confirmar(a: Amb, c: ReturnType<typeof candidatoDe>, id = Q): ConfirmacaoTextual {
  const gravada = a.ler().questoes.find((x) => x.id === id)!;
  return { recursoId: id, revisaoOriginal: gravada.revisao, diferenca: diferencaTextualQuestao(gravada, q(c, id)) };
}
/** Questões Fáceis extras mantêm a cobertura válida, para isolar a proteção de questões respondidas. */
const comResposta = async () => {
  const a = ambienteEstudo((d) => {
    for (const tp of ['tp-1', 'tp-2']) {
      d.questoes.push({ id: `extra-${tp}`, disciplinaId: 'd-alg', topicoId: tp, dificuldade: 'facil', enunciado: 'Extra', alternativas: ['Sim', 'Não'], correta: 0, explicacao: 'x', revisao: 0 });
    }
  }); await responderComo(a, 'u-ana', 'm-ana-26', Q); await responderComo(a, 'u-bruno', 'm-bruno-26', Q, 1); return a; };

describe('4.3 — [GC] Banco de questões classificado, Proteção de questões com respostas', () => {
  it('cadastra questão válida no tópico com a dificuldade informada', async () => {
    const a = ambienteEstudo(); const c = await editar(a, 'u-carla');
    c.questoes.push({ id: 'nova', topicoId: 'tp-1', dificuldade: 'medio', enunciado: 'E', alternativas: ['a', 'b', 'c'], correta: 2, explicacao: 'x', revisao: 0 });
    await a.repo.salvarConteudo(ALVO, c, 0);
    expect(a.ler().questoes.find((x) => x.id === 'nova')).toEqual({ id: 'nova', disciplinaId: 'd-alg', topicoId: 'tp-1', dificuldade: 'medio', enunciado: 'E', alternativas: ['a', 'b', 'c'], correta: 2, explicacao: 'x', revisao: 0 });
  });

  it.each([
    ['sem alternativa correta (índice fora)', (x: ReturnType<typeof q>) => { x.correta = 5; }],
    ['sem alternativa correta (nenhuma)', (x: ReturnType<typeof q>) => { x.correta = -1; }],
    ['alternativa correta vazia', (x: ReturnType<typeof q>) => { x.alternativas = ['a', '  ']; x.correta = 1; }],
    ['menos de duas alternativas', (x: ReturnType<typeof q>) => { x.alternativas = ['a']; x.correta = 0; }],
    ['sem enunciado', (x: ReturnType<typeof q>) => { x.enunciado = ''; }],
    ['sem explicação', (x: ReturnType<typeof q>) => { x.explicacao = ' '; }],
    ['dificuldade inválida', (x: ReturnType<typeof q>) => { x.dificuldade = 'extremo' as never; }],
  ])('rejeita questão %s', async (_nome, quebrar) => {
    const a = ambienteEstudo(); const c = await editar(a, 'u-carla');
    c.questoes.push({ id: 'nova', topicoId: 'tp-1', dificuldade: 'medio', enunciado: 'E', alternativas: ['a', 'b'], correta: 1, explicacao: 'x', revisao: 0 });
    quebrar(q(c, 'nova'));
    await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, c, 0), rej);
  });

  it('rejeita tópico de outra disciplina e identificador de questão de outro banco, sem alterar bancos', async () => {
    const a = ambienteEstudo((d) => {
      d.disciplinas.find((x) => x.id === 'd-dir')!.topicos = [{ id: 'tp-dir', titulo: 'Civil', materiais: [] }];
      d.questoes.push({ id: 'q-dir', disciplinaId: 'd-dir', topicoId: 'tp-dir', dificuldade: 'facil', enunciado: 'C', alternativas: ['a', 'b'], correta: 0, explicacao: 'x', revisao: 0 });
    });
    const c = await editar(a, 'u-admin');
    c.questoes.push({ id: 'nova', topicoId: 'tp-dir', dificuldade: 'facil', enunciado: 'E', alternativas: ['a', 'b'], correta: 0, explicacao: 'x', revisao: 0 });
    await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, c, 0), rej);
    const d = candidatoDe(a.ler()); d.questoes.push({ id: 'q-dir', topicoId: 'tp-1', dificuldade: 'facil', enunciado: 'E', alternativas: ['a', 'b'], correta: 0, explicacao: 'x', revisao: 0 });
    await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, d, 0), rej);
    const e = candidatoDe(a.ler()); q(e).topicoId = 'tp-dir';
    await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, e, 0), rej);
  });

  it('edita questão sem respostas (enunciado, gabarito, alternativas) mantendo a cobertura; revisão avança', async () => {
    const a = await comResposta(); const c = await editar(a, 'u-carla');
    const livre = questao('tp-2', 'medio');
    Object.assign(q(c, livre), { enunciado: 'Reescrita', alternativas: ['x', 'y', 'z'], correta: 2 });
    const antes = a.ler().respostas;
    await a.repo.salvarConteudo(ALVO, c, a.ler().revisao);
    expect(a.ler().questoes.find((x) => x.id === livre)).toMatchObject({ enunciado: 'Reescrita', correta: 2, revisao: 1 });
    expect(a.ler().respostas).toEqual(antes);
  });

  it('remove questão sem respostas se a cobertura publicada permanecer válida', async () => {
    const a = ambienteEstudo(); const c = await editar(a, 'u-carla');
    c.questoes.push({ id: 'extra', topicoId: 'tp-1', dificuldade: 'facil', enunciado: 'E', alternativas: ['a', 'b'], correta: 0, explicacao: 'x', revisao: 0 });
    await a.repo.salvarConteudo(ALVO, c, 0);
    const d = candidatoDe(a.ler()); d.questoes = d.questoes.filter((x) => x.id !== 'extra');
    await a.repo.salvarConteudo(ALVO, d, 1);
    expect(a.ler().questoes.some((x) => x.id === 'extra')).toBe(false);
  });

  describe('questão respondida em qualquer turma', () => {
    it.each(['u-carla', 'u-admin', 'u-prof2'])('%s não exclui (resposta em outra turma incluída)', async (quem) => {
      const a = await comResposta(); const c = await editar(a, quem);
      c.questoes = c.questoes.filter((x) => x.id !== Q);
      await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, c, a.ler().revisao), rej);
      expect(a.ler().questoes.some((x) => x.id === Q)).toBe(true);
    });

    it.each([
      ['gabarito', (x: ReturnType<typeof q>) => { x.correta = 1; }],
      ['dificuldade', (x: ReturnType<typeof q>) => { x.dificuldade = 'dificil'; }],
      ['tópico', (x: ReturnType<typeof q>) => { x.topicoId = 'tp-2'; }],
      ['quantidade de alternativas', (x: ReturnType<typeof q>) => { x.alternativas = [...x.alternativas, 'Talvez']; }],
      ['ordem das alternativas', (x: ReturnType<typeof q>) => { x.alternativas = [...x.alternativas].reverse(); }],
    ])('rejeita mudar %s, mesmo com confirmação humana do próprio autor', async (_nome, mudar) => {
      const a = await comResposta(); const c = await editar(a, 'u-admin'); mudar(q(c));
      const gravada = a.ler().questoes.find((x) => x.id === Q)!;
      const confirmacao: ConfirmacaoTextual = { recursoId: Q, revisaoOriginal: gravada.revisao, diferenca: diferencaTextualQuestao(gravada, q(c)) };
      await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, c, a.ler().revisao, [confirmacao]), rej);
      await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, c, a.ler().revisao), rej);
    });

    it('trocar a posição de duas alternativas mantendo os textos não é correção textual', async () => {
      const a = ambienteEstudo((d) => { d.questoes.find((x) => x.id === Q)!.alternativas = ['A', 'B', 'C']; });
      await responderComo(a, 'u-ana', 'm-ana-26', Q);
      const c = await editar(a, 'u-carla'); q(c).alternativas = ['B', 'A', 'C'];
      await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, c, a.ler().revisao, [confirmar(a, c)]), rej);
    });

    it('mudar o enunciado para pedir a incorreta não passa sem a confirmação humana (sentido é decisão do autor)', async () => {
      const a = await comResposta(); const c = await editar(a, 'u-carla'); q(c).enunciado = 'Qual NÃO é correta?';
      await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, c, a.ler().revisao), rej);
    });

    it('questão ainda não respondida segue editável quando há outra respondida', async () => {
      const a = await comResposta(); const c = await editar(a, 'u-carla');
      q(c, questao('tp-1', 'dificil')).dificuldade = 'dificil'; q(c, questao('tp-1', 'dificil')).enunciado = 'Ajustada';
      await a.repo.salvarConteudo(ALVO, c, a.ler().revisao);
    });
  });
});

describe('4.4 — [GC] Correção textual de questões respondidas', () => {
  const corrigir = (c: ReturnType<typeof candidatoDe>) => { Object.assign(q(c), { enunciado: 'Texto original corrigido', explicacao: 'Explicação corrigida', alternativas: ['Sim!', 'Não'] }); };

  it('aceita a correção confirmada pelo próprio autor, sem segunda pessoa, e registra a confirmação', async () => {
    const a = await comResposta(); const c = await editar(a, 'u-carla'); corrigir(c);
    await a.repo.salvarConteudo(ALVO, c, a.ler().revisao, [confirmar(a, c)]);
    const d = a.ler();
    expect(d.questoes.find((x) => x.id === Q)).toMatchObject({ enunciado: 'Texto original corrigido', alternativas: ['Sim!', 'Não'], correta: 0, revisao: 1 });
    expect(d.revisoesTextuais).toEqual([{
      id: expect.any(String), autorId: 'u-carla', data: d.dataVirtual, recursoId: Q, revisaoOriginal: 0, confirmada: true,
      diferenca: [
        { campo: 'enunciado', original: 'Texto original', proposto: 'Texto original corrigido' },
        { campo: 'alternativas', original: ['Sim', 'Não'], proposto: ['Sim!', 'Não'] },
        { campo: 'explicacao', original: 'Explicação original', proposto: 'Explicação corrigida' },
      ],
    }]);
    expect(d.disciplinas[0].status).toBe('publicado');
  });

  it('o Administrador também confirma por conta própria', async () => {
    const a = await comResposta(); const c = await editar(a, 'u-admin'); q(c).explicacao = 'Melhor';
    await a.repo.salvarConteudo(ALVO, c, a.ler().revisao, [confirmar(a, c)]);
    expect(a.ler().revisoesTextuais[0]).toMatchObject({ autorId: 'u-admin' });
  });

  it('a autoria vem da sessão: confirmação não carrega autor e payload com autor é recusado', async () => {
    const a = await comResposta(); const c = await editar(a, 'u-carla'); q(c).explicacao = 'Melhor';
    const conf = { ...confirmar(a, c), autorId: 'u-admin' };
    await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, c, a.ler().revisao, [conf as never]), rej);
  });

  it('rejeita correção sem confirmação', async () => {
    const a = await comResposta(); const c = await editar(a, 'u-carla'); corrigir(c);
    await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, c, a.ler().revisao), rej);
    await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, c, a.ler().revisao, []), rej);
  });

  it('rejeita a confirmação de uma alteração diferente da solicitada', async () => {
    const a = await comResposta(); const c = await editar(a, 'u-carla'); q(c).enunciado = 'Texto original corrigido';
    const conf = confirmar(a, c);
    q(c).enunciado = 'Outra correção'; // diferença exata diferente da confirmada
    await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, c, a.ler().revisao, [conf]), rej);
    // confirmação para recurso diferente
    const d = await editar(a, 'u-carla'); q(d).enunciado = 'Texto original corrigido';
    await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, d, a.ler().revisao, [{ ...confirmar(a, d), recursoId: questao('tp-1', 'medio') }]), rej);
  });

  it('nova edição após confirmar invalida a confirmação anterior', async () => {
    const a = await comResposta(); const c = await editar(a, 'u-carla'); q(c).enunciado = 'Texto original corrigido';
    const conf = confirmar(a, c);
    q(c).explicacao = 'Também mudei a explicação';
    await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, c, a.ler().revisao, [conf]), rej);
    await a.repo.salvarConteudo(ALVO, c, a.ler().revisao, [confirmar(a, c)]); // nova confirmação da diferença exata
    expect(a.ler().revisoesTextuais).toHaveLength(1);
  });

  it('revisão original desatualizada exige nova comparação, mesmo sem mudar o texto proposto', async () => {
    const a = await comResposta(); const c = await editar(a, 'u-carla'); q(c).explicacao = 'Melhor';
    const antiga = confirmar(a, c); const textoR0 = structuredClone(c);
    await a.repo.salvarConteudo(ALVO, c, a.ler().revisao, [antiga]); // R0 → R1
    // Reaplicar a mesma confirmação (R0) sobre a questão agora na R1:
    await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, textoR0, a.ler().revisao, [antiga]), rej);
    const doZero = await editar(a, 'u-carla'); q(doZero).explicacao = 'Melhor ainda';
    const confR1 = confirmar(a, doZero);
    expect(confR1.revisaoOriginal).toBe(1);
    await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, doZero, a.ler().revisao, [{ ...confR1, revisaoOriginal: 0 }]), rej);
    await a.repo.salvarConteudo(ALVO, doZero, a.ler().revisao, [confR1]);
    expect(a.ler().questoes.find((x) => x.id === Q)!.revisao).toBe(2);
  });

  it('confirmação não substitui a autorização: autor sem último vínculo docente é negado', async () => {
    const a = await comResposta(); const c = await editar(a, 'u-carla'); q(c).explicacao = 'Melhor';
    const conf = confirmar(a, c);
    await a.repo.entrar('u-admin');
    await a.repo.definirVinculoProfessor({ turmaId: 't-26' }, { professorId: 'u-carla' }, false, a.ler().revisao);
    await a.repo.entrar('u-carla');
    await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, c, a.ler().revisao, [conf]), 'ACESSO_NEGADO');
  });

  it('confirmação não vale para campos imutáveis nem sem diferença exigida (confirmação avulsa)', async () => {
    const a = await comResposta(); const c = await editar(a, 'u-carla');
    await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, c, a.ler().revisao, [{ recursoId: Q, revisaoOriginal: 0, diferenca: [] }]), rej);
  });

  it('questão sem respostas não precisa de confirmação', async () => {
    const a = ambienteEstudo(); const c = await editar(a, 'u-carla'); q(c).enunciado = 'Livre';
    await a.repo.salvarConteudo(ALVO, c, 0); expect(a.ler().revisoesTextuais).toEqual([]);
  });
});
