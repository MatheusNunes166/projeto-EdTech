import { describe, expect, it, vi } from 'vitest';
import { calcularEstadoMatricula, resolverContextoEstudo } from '../adaptativo/contexto-estudo';
import { diferencaTextualQuestao } from '../conteudo/regras-disciplina';
import { recusaSemEfeitos } from '../testes/ambiente-comandos-academicos';
import { ALVO, ambienteEstudo, candidatoDe, concluirTrilha, questao, responderComo } from '../testes/ambiente-estudo';

const Q = questao('tp-1', 'facil');

/** Ana em andamento na turma A e Bruno com trilha concluída na turma B, ambos respondendo Q. */
async function cenario() {
  const a = ambienteEstudo((d) => {
    d.matriculas.push({ id: 'm-bruno-b', alunoId: 'u-bruno', turmaId: 't-b', data: d.dataVirtual });
    d.disciplinas[0].topicos[0].materiais.push({ id: 'v1', tipo: 'video', titulo: 'Aula', conteudo: 'https://exemplo.com/errado' });
  });
  await responderComo(a, 'u-ana', 'm-ana-26', Q, 1);
  await concluirTrilha(a, 'u-bruno', 'm-bruno-b');
  await responderComo(a, 'u-bruno', 'm-bruno-b', Q);
  return a;
}
const estudo = (a: Awaited<ReturnType<typeof cenario>>) => ['m-ana-26', 'm-bruno-b'].map((m) => {
  const c = resolverContextoEstudo(a.ler(), m)!;
  return { estado: calcularEstadoMatricula(c), xp: c.respostas.reduce((s, r) => s + r.xpConcedido, 0), respostas: structuredClone(c.respostas) };
});

describe('4.7 — [GC] Falha preserva o conjunto anterior, Correção textual aceita pelo próprio autor; [AA] Histórico exibe o conteúdo anterior', () => {
  it('material válido + remoção que quebra a cobertura: rejeição integral, documento persistido idêntico', async () => {
    const a = await cenario(); await a.repo.entrar('u-carla');
    const c = candidatoDe(a.ler());
    c.topicos[0].materiais[0].conteudo = 'https://exemplo.com/corrigido'; // parte válida
    const unicaFacilNaoRespondida = questao('tp-2', 'facil');
    c.questoes = c.questoes.filter((q) => q.id !== unicaFacilNaoRespondida); // quebra a cobertura
    const antes = a.ler(), estudoAntes = estudo(a);
    await recusaSemEfeitos(a, () => a.repo.salvarConteudo(ALVO, c, a.ler().revisao), 'VALIDACAO_REJEITADA');
    expect(a.ler()).toEqual(antes);
    expect(a.ler().disciplinas[0].topicos[0].materiais[0].conteudo).toBe('https://exemplo.com/errado');
    expect(a.ler().disciplinas[0].status).toBe('publicado');
    expect(a.ler().questoes.some((q) => q.id === unicaFacilNaoRespondida)).toBe(true);
    expect(estudo(a)).toEqual(estudoAntes);
  });

  it('falha de gravação em edição combinada não devolve sucesso nem altera nada', async () => {
    const a = await cenario(); await a.repo.entrar('u-carla');
    const c = candidatoDe(a.ler()); c.topicos[0].materiais[0].conteudo = 'https://exemplo.com/corrigido'; c.questoes.find((q) => q.id === questao('tp-2', 'medio'))!.enunciado = 'Nova';
    vi.mocked(a.persistencia.gravar).mockImplementationOnce(() => { throw new Error('cota excedida'); });
    const antes = a.bruto();
    await expect(a.repo.salvarConteudo(ALVO, c, a.ler().revisao)).rejects.toMatchObject({ codigo: 'FALHA_PERSISTENCIA' });
    expect(a.bruto()).toBe(antes);
  });

  it('correção textual aprovada: salva só a correção, preserva o conteúdo original das respostas e o estudo', async () => {
    const a = await cenario(); await a.repo.entrar('u-carla');
    const antes = estudo(a), respostasAntes = structuredClone(a.ler().respostas);
    const c = candidatoDe(a.ler()); const q = c.questoes.find((x) => x.id === Q)!;
    const gravada = structuredClone(a.ler().questoes.find((x) => x.id === Q)!);
    Object.assign(q, { enunciado: 'Texto original (corrigido)', alternativas: ['Sim, correto', 'Não'], explicacao: 'Explicação revisada' });
    await a.repo.salvarConteudo(ALVO, c, a.ler().revisao, [{ recursoId: Q, revisaoOriginal: gravada.revisao, diferenca: diferencaTextualQuestao(gravada, q) }]);

    const d = a.ler();
    expect(d.questoes.find((x) => x.id === Q)).toMatchObject({ enunciado: 'Texto original (corrigido)', alternativas: ['Sim, correto', 'Não'], correta: 0, dificuldade: 'facil', revisao: 1 });
    expect(d.respostas).toEqual(respostasAntes);
    expect(d.respostas.filter((r) => r.questaoId === Q).every((r) => r.conteudoOriginal.enunciado === 'Texto original' && r.conteudoOriginal.alternativas[0] === 'Sim')).toBe(true);
    expect(estudo(a)).toEqual(antes);
    expect(d.disciplinas[0].status).toBe('publicado');

    // O histórico exibido continua sendo o apresentado ao responder, para Ana (A) e Bruno (B).
    await a.repo.entrar('u-ana');
    const ana = (await a.repo.consultarHistoricoEstudo({ matriculaId: 'm-ana-26' })).dados.respostas[0];
    expect(ana).toMatchObject({ enunciado: 'Texto original', alternativas: ['Sim', 'Não'], explicacao: 'Explicação original', acertou: false });
    await a.repo.entrar('u-prof2');
    const bruno = (await a.repo.consultarHistoricoAlunoDocente({ matriculaId: 'm-bruno-b' })).dados.respostas.find((r) => r.questaoId === Q)!;
    expect(bruno).toMatchObject({ enunciado: 'Texto original', alternativas: ['Sim', 'Não'], acertou: true });
  });
});
