import { describe, expect, it } from 'vitest';
import { recusaSemEfeitos } from '../testes/ambiente-comandos-academicos';
import { ambienteEstudo, questao } from '../testes/ambiente-estudo';

async function comRespostas() {
  const a = ambienteEstudo();
  await a.repo.entrar('u-ana');
  await a.repo.registrarResposta({ matriculaId: 'm-ana-26' }, { questaoId: questao('tp-1', 'facil'), alternativa: 1 }, 0);
  await a.repo.registrarResposta({ matriculaId: 'm-ana-26' }, { questaoId: questao('tp-1', 'facil'), alternativa: 0 }, 1);
  return a;
}
/** Correção textual simulada diretamente no armazenamento (o comando de edição é do grupo 4). */
function corrigirTextoDoCadastro(a: Awaited<ReturnType<typeof comRespostas>>) {
  const d = a.ler();
  const q = d.questoes.find((x) => x.id === questao('tp-1', 'facil'))!;
  q.enunciado = 'Enunciado corrigido'; q.explicacao = 'Explicação corrigida'; q.alternativas = ['Talvez', 'Sim']; q.correta = 1; q.revisao++;
  return d;
}

describe('3.4 — [AA] Preservação do estado de estudo em edições de conteúdo; [AC] Detalhe de aluno para o professor', () => {
  it('retomada: estado reconstituído e histórico com conteúdo original, avaliação e efeitos gravados', async () => {
    const a = await comRespostas();
    const { revisao, dados } = await a.repo.consultarHistoricoEstudo({ matriculaId: 'm-ana-26' });
    expect(revisao).toBe(a.ler().revisao);
    expect(dados.aluno).toEqual({ id: 'u-ana', nome: 'Ana' });
    expect(dados.contexto).toMatchObject({ turma: { id: 't-26' }, disciplina: { id: 'd-alg' }, periodoLetivo: { id: 'p-26' } });
    expect(dados.trilha.topicos[0]).toEqual({ topicoId: 'tp-1', titulo: 'tp-1', dominio: 0 + 10, desbloqueado: true, dominado: false });
    expect(dados.trilha).toMatchObject({ progresso: 0, concluido: false });
    expect(dados.respostas).toHaveLength(2);
    expect(dados.respostas[0]).toMatchObject({
      acertou: false, variacaoDominio: -15, xpConcedido: 0, momento: 1, data: a.ler().dataVirtual,
      enunciado: 'Texto original', alternativas: ['Sim', 'Não'], correta: 0, explicacao: 'Explicação original',
    });
    expect(dados.respostas[1]).toMatchObject({ acertou: true, variacaoDominio: 10, xpConcedido: 10 });
  });

  it('após correção textual do cadastro o histórico mostra o conteúdo apresentado, sem reavaliar', async () => {
    const a = await comRespostas();
    const antes = (await a.repo.consultarHistoricoEstudo({ matriculaId: 'm-ana-26' })).dados;
    // Atualização direta do armazenamento, preservando a revisão lida pela sessão.
    const novo = corrigirTextoDoCadastro(a);
    (a.persistencia.gravar as (s: string) => void)(JSON.stringify(novo));
    const depois = (await a.repo.consultarHistoricoEstudo({ matriculaId: 'm-ana-26' })).dados;
    expect(depois).toEqual(antes);
    expect(depois.respostas[0]).toMatchObject({ enunciado: 'Texto original', alternativas: ['Sim', 'Não'], correta: 0, acertou: false });
    // O cadastro corrente é outro: provam que a consulta não o usa.
    expect(a.ler().questoes.find((q) => q.id === questao('tp-1', 'facil'))!.enunciado).toBe('Enunciado corrigido');
  });

  it('nova matrícula em outro período devolve trilha inicial e histórico vazio, sem copiar a oferta anterior', async () => {
    const a = await comRespostas();
    const { dados } = await a.repo.consultarHistoricoEstudo({ matriculaId: 'm-ana-27' });
    expect(dados.respostas).toEqual([]);
    expect(dados.trilha.topicos.map((t) => [t.dominio, t.desbloqueado])).toEqual([[0, true], [0, false]]);
    expect(dados.trilha).toMatchObject({ progresso: 0, concluido: false });
  });

  it('o aluno só lê o próprio histórico, e não de turma sem matrícula', async () => {
    const a = await comRespostas();
    await a.repo.entrar('u-bruno');
    await recusaSemEfeitos(a, () => a.repo.consultarHistoricoEstudo({ matriculaId: 'm-ana-26' }), 'ACESSO_NEGADO');
    await a.repo.entrar('u-ana');
    await recusaSemEfeitos(a, () => a.repo.consultarHistoricoEstudo({ matriculaId: 'm-ana-26', turmaId: 't-b' }), 'ACESSO_NEGADO');
  });

  it('professor vinculado à turma lê o detalhe do aluno com o conteúdo original', async () => {
    const a = await comRespostas();
    await a.repo.entrar('u-carla');
    const { dados } = await a.repo.consultarHistoricoAlunoDocente({ matriculaId: 'm-ana-26', turmaId: 't-26' });
    expect(dados.aluno.id).toBe('u-ana');
    expect(dados.respostas[0].enunciado).toBe('Texto original');
  });

  it('nega o mesmo aluno em turma não vinculada, mesmo com a disciplina coincidindo', async () => {
    const a = ambienteEstudo((d) => { d.matriculas.push({ id: 'm-ana-b', alunoId: 'u-ana', turmaId: 't-b', data: d.dataVirtual }); });
    await a.repo.entrar('u-carla'); // leciona t-26, não t-b
    await recusaSemEfeitos(a, () => a.repo.consultarHistoricoAlunoDocente({ matriculaId: 'm-ana-b' }), 'ACESSO_NEGADO');
    await a.repo.entrar('u-prof2');
    await recusaSemEfeitos(a, () => a.repo.consultarHistoricoAlunoDocente({ matriculaId: 'm-ana-26' }), 'ACESSO_NEGADO');
    expect((await a.repo.consultarHistoricoAlunoDocente({ matriculaId: 'm-ana-b' })).dados.aluno.id).toBe('u-ana');
  });

  it('o aluno e o responsável não usam a consulta docente', async () => {
    const a = await comRespostas();
    for (const quem of ['u-ana', 'u-helena', 'u-coord']) {
      await a.repo.entrar(quem);
      await recusaSemEfeitos(a, () => a.repo.consultarHistoricoAlunoDocente({ matriculaId: 'm-ana-26' }), 'ACESSO_NEGADO');
    }
  });

  it('aceita apenas campos de alvo conhecidos', async () => {
    const a = await comRespostas();
    await recusaSemEfeitos(a, () => a.repo.consultarHistoricoEstudo({ matriculaId: 'm-ana-26', alunoId: 'u-bruno' } as never), 'VALIDACAO_REJEITADA');
  });
});
