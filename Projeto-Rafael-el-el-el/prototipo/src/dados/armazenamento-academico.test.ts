import { describe, expect, it } from 'vitest';
import { criarArmazenamentoEspiao } from '../testes/armazenamento-espiao';
import { VERSAO_SCHEMA_ACADEMICO } from '../dominio/tipos';
import {
  CHAVES_ARMAZENAMENTO as K, ErroArmazenamentoAcademico, criarRepositorioLocal, inicializarDemonstracao,
  inspecionarArmazenamento, restaurarDemonstracao, substituirDadosPorDemonstracao,
} from './armazenamento-academico';
import { criarSeedAcademico } from './seed-academico';

const seedJson = () => JSON.stringify(criarSeedAcademico());
const legado = '{"versaoSeed":1,"dataVirtual":"2026-03-16","usuarios":[{"id":"u-ana","perfil":"aluno"}],"cursos":[]}';

describe('6.3 — [OA] Demonstração fictícia e restauração: inspeção separada da inicialização', () => {
  const casos: [string, Record<string, string>, ReturnType<typeof inspecionarArmazenamento>][] = [
    ['ausência de dados', {}, { situacao: 'ausente' }],
    ['versão legada (namespace anterior)', { [K.legadoDados]: legado, [K.legadoSessao]: 'u-ana' }, { situacao: 'legado' }],
    ['legado com conteúdo ilegível não é interpretado', { [K.legadoDados]: '{json inválido' }, { situacao: 'legado' }],
    ['JSON inválido no documento acadêmico', { [K.academico]: '{json inválido' }, { situacao: 'incompativel', motivo: 'json-invalido' }],
    ['valor que não é objeto', { [K.academico]: '42' }, { situacao: 'incompativel', motivo: 'versao-schema' }],
    ['esquema incompatível (versão futura)', { [K.academico]: JSON.stringify({ ...criarSeedAcademico(), versaoSchema: VERSAO_SCHEMA_ACADEMICO + 1 }) }, { situacao: 'incompativel', motivo: 'versao-schema' }],
    ['esquema ausente (documento do formato legado sob a chave nova)', { [K.academico]: legado }, { situacao: 'incompativel', motivo: 'versao-schema' }],
    ['formato incompleto', { [K.academico]: JSON.stringify({ versaoSchema: VERSAO_SCHEMA_ACADEMICO, revisao: 0, usuarios: [] }) }, { situacao: 'incompativel', motivo: 'formato' }],
    ['revisão inválida', { [K.academico]: JSON.stringify({ ...criarSeedAcademico(), revisao: -1 }) }, { situacao: 'incompativel', motivo: 'formato' }],
    ['leitura compatível', { [K.academico]: seedJson() }, { situacao: 'compativel' }],
    ['documento acadêmico tem precedência sobre o legado', { [K.academico]: seedJson(), [K.legadoDados]: legado }, { situacao: 'compativel' }],
  ];

  it.each(casos)('classifica %s sem escrever nem remover nada', (_nome, inicial, esperado) => {
    const storage = criarArmazenamentoEspiao(inicial); const antes = storage.retrato();
    expect(inspecionarArmazenamento(storage)).toEqual(esperado);
    expect(storage.chamadas).toEqual([]);
    expect(storage.retrato()).toEqual(antes);
  });

  it('a inspeção só precisa de leitura: funciona com um armazenamento que oferece apenas getItem', () => {
    expect(inspecionarArmazenamento({ getItem: () => null })).toEqual({ situacao: 'ausente' });
  });

  it('inicializa a demonstração somente sem dados, com uma única gravação', () => {
    const storage = criarArmazenamentoEspiao();
    inicializarDemonstracao(storage);
    expect(storage.chamadas.filter((c) => c.startsWith('set:'))).toEqual([`set:${K.academico}`]); // uma única gravação
    expect(storage.retrato()).toEqual({ [K.academico]: seedJson() });
    expect(inspecionarArmazenamento(storage)).toEqual({ situacao: 'compativel' });
  });

  it.each([
    ['dados legados', { [K.legadoDados]: legado }],
    ['dados incompatíveis', { [K.academico]: '{json inválido' }],
    ['dados compatíveis', { [K.academico]: seedJson() }],
  ])('recusa inicializar sobre %s, sem qualquer escrita', (_n, inicial) => {
    const storage = criarArmazenamentoEspiao(inicial); const antes = storage.retrato();
    expect(() => inicializarDemonstracao(storage)).toThrow(expect.objectContaining({ codigo: 'JA_EXISTENTE' }));
    expect(storage.chamadas).toEqual([]); expect(storage.retrato()).toEqual(antes);
  });
});

describe('6.4 — [OA] Demonstração fictícia e restauração; [PA] Entrada simulada no protótipo', () => {
  const cenarios = {
    legado: { [K.legadoDados]: legado, [K.legadoSessao]: 'u-ana', [K.sessaoAcademica]: 'u-ana' },
    incompativel: { [K.academico]: '{json inválido', [K.sessaoAcademica]: 'u-ana', [K.legadoDados]: legado, [K.legadoSessao]: 'u-ana' },
  };

  it.each(['legado', 'incompativel'] as const)('cancelar a substituição (%s) preserva todas as chaves e a sessão, sem escrever', (nome) => {
    for (const confirmacao of [false, undefined as unknown as boolean, 'true' as unknown as boolean, 1 as unknown as boolean]) {
      const storage = criarArmazenamentoEspiao(cenarios[nome]); const antes = storage.retrato();
      expect(substituirDadosPorDemonstracao(storage, confirmacao)).toEqual({ status: 'cancelado' });
      expect(storage.chamadas).toEqual([]); expect(storage.retrato()).toEqual(antes);
    }
  });

  it('cancelar a restauração preserva as alterações locais e a sessão', () => {
    const alterado = { ...criarSeedAcademico(), dataVirtual: '2026-12-01', revisao: 7 };
    const storage = criarArmazenamentoEspiao({ [K.academico]: JSON.stringify(alterado), [K.sessaoAcademica]: 'u-ana' }); const antes = storage.retrato();
    expect(restaurarDemonstracao(storage, false)).toEqual({ status: 'cancelado' });
    expect(storage.chamadas).toEqual([]); expect(storage.retrato()).toEqual(antes);
    expect(inspecionarArmazenamento(storage)).toEqual({ situacao: 'compativel' });
  });

  it.each(['legado', 'incompativel'] as const)('confirmar a substituição (%s) recupera o seed, encerra as sessões depois da gravação e preserva o legado', (nome) => {
    const storage = criarArmazenamentoEspiao(cenarios[nome]);
    expect(substituirDadosPorDemonstracao(storage, true)).toEqual({ status: 'concluido' });
    expect(storage.chamadas).toEqual([`set:${K.academico}`, `remove:${K.sessaoAcademica}`, `remove:${K.legadoSessao}`]);
    const depois = storage.retrato();
    expect(depois[K.academico]).toBe(seedJson());
    expect(depois[K.legadoDados]).toBe(legado); // cópia técnica de recuperação, sem migração
    expect(depois[K.sessaoAcademica]).toBeUndefined(); expect(depois[K.legadoSessao]).toBeUndefined();
    expect(inspecionarArmazenamento(storage)).toEqual({ situacao: 'compativel' });
  });

  it('confirmar a restauração descarta as alterações locais e a sessão', async () => {
    const storage = criarArmazenamentoEspiao({ [K.academico]: JSON.stringify({ ...criarSeedAcademico(), dataVirtual: '2026-12-01', revisao: 7 }) });
    const repo = criarRepositorioLocal(storage); await repo.entrar('u-renata');
    expect(storage.retrato()[K.sessaoAcademica]).toBe('u-renata');
    expect(restaurarDemonstracao(storage, true)).toEqual({ status: 'concluido' });
    expect(storage.retrato()[K.academico]).toBe(seedJson());
    expect(await repo.obterSessao()).toBeNull();
  });

  it('o seed restaurado é utilizável pelo repositório acadêmico (entrada sem senha) e a sessão antiga não persiste', async () => {
    const storage = criarArmazenamentoEspiao(cenarios.legado);
    substituirDadosPorDemonstracao(storage, true);
    const repo = criarRepositorioLocal(storage);
    expect(await repo.obterSessao()).toBeNull();
    expect(await repo.entrar('u-ana')).toMatchObject({ id: 'u-ana', funcoes: ['aluno'] });
    expect((await repo.consultarPainelAluno()).dados.length).toBeGreaterThan(0);
  });

  it.each([['substituição', 'legado'], ['restauração', 'legado'], ['substituição', 'incompativel'], ['restauração', 'incompativel']] as const)(
    'falha de gravação na %s (%s): erro, nenhuma chave alterada e sessão preservada', (operacao, nome) => {
      const storage = criarArmazenamentoEspiao(cenarios[nome], K.academico); const antes = storage.retrato();
      const executar = () => (operacao === 'substituição' ? substituirDadosPorDemonstracao : restaurarDemonstracao)(storage, true);
      expect(executar).toThrow(expect.objectContaining({ codigo: 'FALHA_GRAVACAO' }));
      expect(storage.chamadas).toEqual([`set:${K.academico}`]); // nenhuma remoção de sessão após a falha
      expect(storage.retrato()).toEqual(antes);
    });

  it('falha ao inicializar sem dados não deixa estado parcialmente inicializado', () => {
    const storage = criarArmazenamentoEspiao({}, K.academico);
    expect(() => inicializarDemonstracao(storage)).toThrow(ErroArmazenamentoAcademico);
    expect(storage.retrato()).toEqual({}); expect(inspecionarArmazenamento(storage)).toEqual({ situacao: 'ausente' });
  });

  it('substituir sem dados legados/incompatíveis é recusado sem escrita (use inicializar ou restaurar)', () => {
    for (const inicial of [{}, { [K.academico]: seedJson() }] as Record<string, string>[]) {
      const storage = criarArmazenamentoEspiao(inicial);
      expect(() => substituirDadosPorDemonstracao(storage, true)).toThrow(expect.objectContaining({ codigo: 'ESTADO_INVALIDO' }));
      expect(storage.chamadas).toEqual([]);
    }
  });

  it('o repositório sobre dados não inicializados ou incompatíveis não os repõe: erros explícitos e nenhuma escrita', async () => {
    const vazio = criarArmazenamentoEspiao(); const r1 = criarRepositorioLocal(vazio);
    await expect(r1.entrar('u-ana')).rejects.toMatchObject({ codigo: 'DADOS_NAO_INICIALIZADOS' });
    const ruim = criarArmazenamentoEspiao({ [K.academico]: legado }); const r2 = criarRepositorioLocal(ruim);
    await expect(r2.entrar('u-ana')).rejects.toMatchObject({ codigo: 'DADOS_INCOMPATIVEIS' });
    expect(vazio.chamadas).toEqual([]); expect(ruim.chamadas).toEqual([]);
  });
});
