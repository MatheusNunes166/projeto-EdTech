import { describe, expect, it } from 'vitest';
import { resolverContextoEstudo } from '../adaptativo/contexto-estudo';
import { diferencaTextualQuestao } from '../conteudo/regras-disciplina';
import { conquistasMatricula, sequenciaDiasMatricula, xpMatricula } from '../gamificacao/gamificacao';
import { recusaSemEfeitos } from '../testes/ambiente-comandos-academicos';
import { ALVO, ambienteEstudo, candidatoDe, concluirTrilha, questao, responderComo } from '../testes/ambiente-estudo';

type Amb = ReturnType<typeof ambienteEstudo>;
const placar = (a: Amb) => ['m-ana-26', 'm-bruno-b'].map((m) => {
  const c = resolverContextoEstudo(a.ler(), m)!;
  return { xp: xpMatricula(c), conquistas: conquistasMatricula(c), sequencia: sequenciaDiasMatricula(c, a.ler().dataVirtual) };
});

/** Ana em andamento em A; Bruno com trilha concluída em B (mesma disciplina), ambos respondendo a mesma questão. */
async function cenario() {
  const a = ambienteEstudo((d) => { d.matriculas.push({ id: 'm-bruno-b', alunoId: 'u-bruno', turmaId: 't-b', data: d.dataVirtual }); });
  await responderComo(a, 'u-ana', 'm-ana-26', questao('tp-1', 'dificil'));
  await responderComo(a, 'u-ana', 'm-ana-26', questao('tp-1', 'facil'), 1);
  await concluirTrilha(a, 'u-bruno', 'm-bruno-b');
  await responderComo(a, 'u-bruno', 'm-bruno-b', questao('tp-1', 'dificil'));
  return a;
}

describe('5.3/5.5 — [GA] Preservação da gamificação em edições de conteúdo (comandos reais)', () => {
  it('XP, conquistas e datas permanecem após ajuste de material', async () => {
    const a = await cenario(); const antes = placar(a);
    expect(antes[1].conquistas.map((c) => c.id)).toContain('trilha-concluida');
    expect(antes[0].xp).toBe(30);
    await a.repo.entrar('u-carla');
    await a.repo.salvarMateriais(ALVO, [{ topicoId: 'tp-1', materiais: [{ id: 'v', tipo: 'video', titulo: 'Aula', conteudo: 'https://x.y/z' }] }], a.ler().revisao);
    expect(placar(a)).toEqual(antes);
  });

  it('correção textual confirmada em questão respondida em turmas distintas não altera XP, conquistas ou datas', async () => {
    const a = await cenario(); const antes = placar(a);
    await a.repo.entrar('u-carla'); const c = candidatoDe(a.ler());
    const alvo = c.questoes.find((x) => x.id === questao('tp-1', 'dificil'))!; const gravada = structuredClone(a.ler().questoes.find((x) => x.id === alvo.id)!);
    alvo.explicacao = 'Explicação revisada';
    await a.repo.salvarConteudo(ALVO, c, a.ler().revisao, [{ recursoId: alvo.id, revisaoOriginal: gravada.revisao, diferenca: diferencaTextualQuestao(gravada, alvo) }]);
    expect(placar(a)).toEqual(antes);
  });

  it('tentativas rejeitadas (adicionar tópico, mudar dificuldade) preservam tudo, inclusive a conquista de conclusão única', async () => {
    const a = await cenario(); const antes = placar(a);
    await a.repo.entrar('u-admin');
    const adicionar = candidatoDe(a.ler()); adicionar.topicos.push({ id: 'tp-9', titulo: 'Novo', materiais: [] });
    await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, adicionar, a.ler().revisao), 'VALIDACAO_REJEITADA');
    const mudar = candidatoDe(a.ler()); mudar.questoes.find((x) => x.id === questao('tp-1', 'dificil'))!.dificuldade = 'facil';
    await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, mudar, a.ler().revisao), 'VALIDACAO_REJEITADA');
    expect(placar(a)).toEqual(antes);
    expect(placar(a)[1].conquistas.filter((c) => c.id === 'trilha-concluida')).toHaveLength(1);
  });

  it('outra oferta da mesma disciplina em outro período começa com zero XP e nenhuma conquista', async () => {
    const a = await cenario();
    const c = resolverContextoEstudo(a.ler(), 'm-ana-27')!;
    expect([xpMatricula(c), sequenciaDiasMatricula(c, a.ler().dataVirtual), conquistasMatricula(c)]).toEqual([0, 0, []]);
  });
});
