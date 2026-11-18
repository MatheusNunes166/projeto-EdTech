import { beforeEach, describe, expect, it } from 'vitest';
import { ErroArmazenamentoLegado, Repositorio } from './repositorio';
import { DATA_INICIAL, SEED_VERSAO, criarSeed } from './seed';

describe('Repositorio (localStorage)', () => {
  let repo: Repositorio;
  beforeEach(() => {
    localStorage.clear();
    repo = new Repositorio(localStorage);
  });

  it('carrega o seed na primeira leitura', async () => {
    const dados = await repo.obterDados();
    expect(dados).toEqual(criarSeed());
    expect(localStorage.getItem('trilha-adaptativa:dados')).not.toBeNull();
  });

  it('persiste escritas entre instâncias', async () => {
    await repo.salvarUsuario({ nome: 'Novo Aluno', email: 'novo@exemplo.com', perfil: 'aluno', ativo: true });
    const outra = new Repositorio(localStorage);
    expect((await outra.obterDados()).usuarios.some((u) => u.nome === 'Novo Aluno')).toBe(true);
  });

  it('obterDados devolve uma cópia (alterá-la não afeta o armazenamento)', async () => {
    const dados = await repo.obterDados();
    dados.usuarios = [];
    expect((await repo.obterDados()).usuarios.length).toBeGreaterThan(0);
  });

  it('restaurar dados de demonstração descarta alterações e encerra a sessão', async () => {
    await repo.entrar('u-ana');
    await repo.definirAtivo('u-marcos', false);
    await repo.simularProximoDia();
    await repo.restaurarDemonstracao();
    expect(await repo.obterDados()).toEqual(criarSeed());
    expect(await repo.obterSessao()).toBeNull();
  });

  it('não repõe em silêncio dados de versão diferente nem JSON inválido: erro e armazenamento intactos', async () => {
    const antigo = JSON.stringify({ ...criarSeed(), versaoSeed: SEED_VERSAO - 1, usuarios: [] });
    for (const conteudo of [antigo, '{json inválido', '']) {
      localStorage.setItem('trilha-adaptativa:dados', conteudo);
      await expect(repo.obterDados()).rejects.toBeInstanceOf(ErroArmazenamentoLegado);
      await expect(repo.entrar('u-ana')).rejects.toBeInstanceOf(ErroArmazenamentoLegado);
      expect(localStorage.getItem('trilha-adaptativa:dados')).toBe(conteudo);
    }
  });

  it('restaurar explicitamente continua substituindo os dados (ação confirmada pelo fluxo de restauração)', async () => {
    localStorage.setItem('trilha-adaptativa:dados', '{json inválido');
    await repo.restaurarDemonstracao();
    expect(await repo.obterDados()).toEqual(criarSeed());
  });

  it('simular próximo dia avança a data virtual usada nas respostas', async () => {
    expect(await repo.obterDataVirtual()).toBe(DATA_INICIAL);
    expect(await repo.simularProximoDia()).toBe('2026-03-17');
    const r = await repo.registrarResposta({ alunoId: 'u-ana', cursoId: 'c-mat', questaoId: 'q-7', alternativa: 0 });
    expect(r.data).toBe('2026-03-17');
  });

  it('registra resposta calculando acerto, tópico e dificuldade pela questão', async () => {
    const dados = await repo.obterDados();
    const q = dados.questoes.find((x) => x.id === 'q-7')!;
    const r = await repo.registrarResposta({ alunoId: 'u-ana', cursoId: 'c-mat', questaoId: q.id, alternativa: q.correta });
    expect(r).toMatchObject({ acertou: true, topicoId: q.topicoId, dificuldade: q.dificuldade });
    expect(r.momento).toBe(Math.max(...dados.respostas.map((x) => x.momento)) + 1);
  });

  it('sessão: usuário inativo não entra e sessão de usuário desativado é encerrada', async () => {
    await expect(repo.entrar('u-paulo')).rejects.toThrow();
    await repo.entrar('u-marcos');
    await repo.definirAtivo('u-marcos', false);
    expect(await repo.obterSessao()).toBeNull();
  });
});
