import { beforeEach, describe, expect, it } from 'vitest';
import readme from '../../README.md?raw';
import { NOME_FUNCAO } from '../dominio/tipos';
import {
  CHAVES_ARMAZENAMENTO as K, criarRepositorioLocal, inspecionarArmazenamento, substituirDadosPorDemonstracao,
} from './armazenamento-academico';
import { Repositorio } from './repositorio';
import { criarSeed } from './seed';
import { criarSeedAcademico } from './seed-academico';

const linhas = (cabecalho: string) => {
  const inicio = readme.indexOf(`| ${cabecalho}`);
  expect(inicio, cabecalho).toBeGreaterThanOrEqual(0);
  const todas = readme.slice(inicio).split('\n').slice(2);
  const fim = todas.findIndex((l) => !l.startsWith('|')); // a tabela termina na primeira linha em branco
  return todas.slice(0, fim < 0 ? undefined : fim).map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));
};

describe('6.5 — [OA] Demonstração fictícia e restauração: README conferido contra o seed', () => {
  const seed = criarSeedAcademico();

  it('as pessoas, e-mails e funções do README correspondem exatamente ao seed', () => {
    const tabela = linhas('Nome | E-mail');
    expect(tabela).toHaveLength(seed.usuarios.length);
    for (const [nome, email, funcoes] of tabela) {
      const u = seed.usuarios.find((x) => x.email === email)!;
      expect(u, email).toBeDefined(); expect(u.nome).toBe(nome);
      const esperadas = u.funcoes.map((f) => NOME_FUNCAO[f]).sort();
      const doReadme = funcoes.replace(/\(inativo\)/, '').split(',').map((f) => f.trim()).sort();
      expect(doReadme, nome).toEqual(esperadas);
      expect(funcoes.includes('(inativo)'), nome).toBe(!u.ativo);
    }
  });

  it('graduações, disciplinas, períodos e turmas do README correspondem ao seed', () => {
    for (const [grad, disc, estado] of linhas('Graduação | Disciplina')) {
      const d = seed.disciplinas.find((x) => disc.startsWith(x.nome))!;
      expect(d, disc).toBeDefined();
      expect(grad).toContain(seed.graduacoes.find((g) => g.id === d.graduacaoId)!.nome);
      expect(disc).toContain(`(${d.codigo})`);
      expect(estado.startsWith(d.status === 'publicado' ? 'publicado' : 'rascunho')).toBe(true);
    }
    const periodos = linhas('Período | Início');
    expect(periodos).toEqual(seed.periodosLetivos.map((p) => [p.nome, p.dataInicio, p.dataFim]));
    const turmas = linhas('Disciplina | Turma');
    expect(turmas).toHaveLength(seed.turmas.length);
    for (const [codigoDisc, codigoTurma, periodo, situacao] of turmas) {
      const t = seed.turmas.find((x) => seed.disciplinas.find((d) => d.id === x.disciplinaId)!.codigo === codigoDisc
        && x.codigo === codigoTurma && seed.periodosLetivos.find((p) => p.id === x.periodoLetivoId)!.nome === periodo)!;
      expect(t, `${codigoDisc} ${codigoTurma} ${periodo}`).toBeDefined();
      const vazia = !seed.matriculas.some((m) => m.turmaId === t.id);
      expect(situacao.includes('vazia'), situacao).toBe(vazia);
    }
  });

  it('declara a data virtual inicial, o aviso de perda de histórico, a restauração e o limite do rollback', () => {
    expect(readme).toContain(seed.dataVirtual);
    expect(readme).toMatch(/será apagado\/substituído e não é migrado/);
    expect(readme).toMatch(/Restaurar a demonstração/);
    expect(readme).toMatch(/Cancelar.*não altera nenhuma chave/);
    expect(readme).toMatch(/Limite do rollback entre esquemas/);
    expect(readme).toMatch(/não\*\* consome o documento acadêmico/);
    expect(readme).toContain(K.academico.replace(':dados', ':*'));
    expect(readme).toContain(K.legadoDados);
  });

  it('os exemplos narrados existem: Elisa concluiu a trilha e Carla tem duas funções em cursos diferentes', () => {
    const carla = seed.usuarios.find((u) => u.id === 'u-carla')!;
    expect(carla.funcoes).toEqual(['professor', 'coordenador']);
    const leciona = seed.vinculosProfessor.filter((v) => v.professorId === 'u-carla').map((v) => seed.turmas.find((t) => t.id === v.turmaId)!.disciplinaId);
    const coordena = seed.vinculosCoordenador.filter((v) => v.coordenadorId === 'u-carla').map((v) => v.graduacaoId);
    const gradDocente = new Set(leciona.map((d) => seed.disciplinas.find((x) => x.id === d)!.graduacaoId));
    expect([...gradDocente].some((g) => coordena.includes(g))).toBe(false);
  });
});

describe('6.5 — namespace legado lido pela versão correspondente, sem reinterpretação acadêmica', () => {
  beforeEach(() => localStorage.clear());

  it('a versão anterior continua lendo seu namespace; o repositório acadêmico não o interpreta', async () => {
    const legado = new Repositorio(localStorage);
    await legado.restaurarDemonstracao();
    expect(await legado.obterDados()).toEqual(criarSeed());
    expect(inspecionarArmazenamento(localStorage)).toEqual({ situacao: 'legado' });
    await expect(criarRepositorioLocal(localStorage).entrar('u-ana')).rejects.toMatchObject({ codigo: 'DADOS_NAO_INICIALIZADOS' });
    expect(localStorage.getItem(K.academico)).toBeNull();
  });

  it('após a substituição confirmada o legado segue intacto, sem ser convertido, e o novo documento é independente', async () => {
    const legado = new Repositorio(localStorage);
    await legado.restaurarDemonstracao();
    const bruto = localStorage.getItem(K.legadoDados);
    substituirDadosPorDemonstracao(localStorage, true);
    expect(localStorage.getItem(K.legadoDados)).toBe(bruto);
    expect(await legado.obterDados()).toEqual(criarSeed());
    const novo = JSON.parse(localStorage.getItem(K.academico)!);
    expect(novo).toEqual(criarSeedAcademico());
    expect(novo.cursos).toBeUndefined(); // o antigo Curso não virou graduação
    expect(novo.graduacoes.map((g: { nome: string }) => g.nome)).not.toContain('Matemática Básica');
  });
});
