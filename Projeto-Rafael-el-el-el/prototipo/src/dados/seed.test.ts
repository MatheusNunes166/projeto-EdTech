import { describe, expect, it } from 'vitest';
import {
  validarDisciplina, validarGraduacao, validarMatricula, validarPeriodoLetivo, validarTurma,
  validarVinculoCoordenador, validarVinculoProfessor, validarVinculoResponsavel,
} from '../dominio/academico';
import { verificarPublicacaoDisciplina } from '../conteudo/regras-disciplina';
import { VERSAO_SCHEMA_ACADEMICO } from '../dominio/tipos';
import { validarUsuario } from '../dominio/usuarios';
import { DATA_INICIAL_ACADEMICA, SEED_ACADEMICO_VERSAO, criarSeedAcademico } from './seed-academico';

describe('6.1 — [OA] Demonstração fictícia e restauração; [GC] conteúdo da disciplina e publicação', () => {
  const seed = criarSeedAcademico();
  const doTurma = (id: string) => seed.turmas.find((t) => t.id === id)!;

  it('declara esquema, versão do seed, revisão inicial e data virtual determinística', () => {
    expect(seed).toMatchObject({ versaoSchema: VERSAO_SCHEMA_ACADEMICO, versaoSeed: SEED_ACADEMICO_VERSAO, revisao: 0, dataVirtual: DATA_INICIAL_ACADEMICA });
  });

  it('tem ao menos duas graduações, duas disciplinas por graduação e dois períodos', () => {
    expect(seed.graduacoes.length).toBeGreaterThanOrEqual(2);
    for (const g of seed.graduacoes) expect(seed.disciplinas.filter((d) => d.graduacaoId === g.id).length, g.nome).toBeGreaterThanOrEqual(2);
    expect(seed.periodosLetivos.length).toBeGreaterThanOrEqual(2);
  });

  it('tem turmas paralelas (mesma disciplina e período), turma vazia e a mesma disciplina em períodos distintos', () => {
    const paralelas = seed.turmas.filter((t) => seed.turmas.some((o) => o.id !== t.id && o.disciplinaId === t.disciplinaId && o.periodoLetivoId === t.periodoLetivoId));
    expect(paralelas.length).toBeGreaterThanOrEqual(2);
    const vazias = seed.turmas.filter((t) => !seed.matriculas.some((m) => m.turmaId === t.id));
    expect(vazias.length).toBeGreaterThanOrEqual(1);
    const periodosDeAlgoritmos = new Set(seed.turmas.filter((t) => t.disciplinaId === 'd-alg').map((t) => t.periodoLetivoId));
    expect(periodosDeAlgoritmos.size).toBeGreaterThanOrEqual(2);
  });

  it('tem uma pessoa Professor e Coordenador, além das demais funções ativas', () => {
    expect(seed.usuarios.some((u) => u.ativo && u.funcoes.includes('professor') && u.funcoes.includes('coordenador'))).toBe(true);
    for (const f of ['aluno', 'professor', 'coordenador', 'admin', 'responsavel'] as const) {
      expect(seed.usuarios.some((u) => u.ativo && u.funcoes.includes(f)), f).toBe(true);
    }
    expect(seed.usuarios.some((u) => !u.ativo)).toBe(true);
  });

  it('as disciplinas publicadas atendem à cobertura de publicação e existe um rascunho que não atende', () => {
    const publicadas = seed.disciplinas.filter((d) => d.status === 'publicado');
    expect(publicadas).toHaveLength(3);
    for (const d of publicadas) expect(verificarPublicacaoDisciplina(d, seed.questoes), d.nome).toMatchObject({ ok: true, faltantes: [] });
    const rascunhos = seed.disciplinas.filter((d) => d.status === 'rascunho');
    expect(rascunhos).toHaveLength(1);
    expect(verificarPublicacaoDisciplina(rascunhos[0], seed.questoes).ok).toBe(false);
  });

  it('conteúdo pertence à disciplina: toda questão referencia disciplina e tópico dela, com revisão 0 e gabarito válido', () => {
    for (const q of seed.questoes) {
      const d = seed.disciplinas.find((x) => x.id === q.disciplinaId)!;
      expect(d?.topicos.some((t) => t.id === q.topicoId), q.id).toBe(true);
      expect(q.revisao).toBe(0);
      expect(q.alternativas[q.correta]).toBeTruthy();
    }
  });

  it('todas as entidades e referências são válidas (IDs únicos, códigos, datas e vínculos)', () => {
    const ids = (itens: { id: string }[]) => itens.map((i) => i.id);
    for (const colecao of [seed.usuarios, seed.graduacoes, seed.disciplinas, seed.periodosLetivos, seed.turmas, seed.matriculas, seed.questoes]) {
      expect(new Set(ids(colecao)).size).toBe(colecao.length);
    }
    for (const g of seed.graduacoes) expect(validarGraduacao(g, seed.graduacoes)).toEqual({});
    for (const d of seed.disciplinas) expect(validarDisciplina(d, seed.graduacoes, seed.disciplinas), d.id).toEqual({});
    for (const p of seed.periodosLetivos) expect(validarPeriodoLetivo(p)).toEqual({});
    for (const t of seed.turmas) expect(validarTurma(t, seed.disciplinas, seed.periodosLetivos, seed.turmas), t.id).toEqual({});
    for (const u of seed.usuarios) expect(validarUsuario(u), u.id).toEqual({});
    seed.matriculas.forEach((m, i) => {
      const v = validarMatricula(m, seed.usuarios, seed.turmas, seed.matriculas.filter((_, j) => j !== i));
      expect(v, m.id).toEqual({ erros: {}, existente: undefined });
      expect(seed.usuarios.find((u) => u.id === m.alunoId)!.funcoes).toContain('aluno');
    });
    seed.vinculosProfessor.forEach((v, i) => {
      expect(validarVinculoProfessor(v, seed.usuarios, seed.turmas, seed.vinculosProfessor.filter((_, j) => j !== i))).toEqual({ erros: {}, existente: undefined });
      expect(seed.usuarios.find((u) => u.id === v.professorId)!.funcoes).toContain('professor');
    });
    seed.vinculosCoordenador.forEach((v, i) => {
      expect(validarVinculoCoordenador(v, seed.usuarios, seed.graduacoes, seed.vinculosCoordenador.filter((_, j) => j !== i))).toEqual({ erros: {}, existente: undefined });
      expect(seed.usuarios.find((u) => u.id === v.coordenadorId)!.funcoes).toContain('coordenador');
    });
    seed.vinculosResponsavel.forEach((v, i) => {
      expect(validarVinculoResponsavel(v, seed.usuarios, seed.vinculosResponsavel.filter((_, j) => j !== i))).toEqual({ erros: {}, existente: undefined });
      expect(seed.usuarios.find((u) => u.id === v.alunoId)!.funcoes).toContain('aluno');
    });
  });

  it('a data virtual está dentro de um período, e as matrículas e respostas não estão no futuro', () => {
    const periodo = seed.periodosLetivos.find((p) => p.dataInicio <= seed.dataVirtual && seed.dataVirtual <= p.dataFim);
    expect(periodo).toBeDefined();
    for (const m of seed.matriculas) expect(m.data <= seed.dataVirtual, m.id).toBe(true);
    for (const r of seed.respostas) expect(r.data <= seed.dataVirtual, r.id).toBe(true);
  });

  it('é determinístico e cada chamada devolve um documento independente', () => {
    expect(criarSeedAcademico()).toEqual(seed);
    expect(JSON.stringify(criarSeedAcademico())).toBe(JSON.stringify(seed));
    const outro = criarSeedAcademico(); outro.usuarios[0].nome = 'Alterado';
    expect(criarSeedAcademico().usuarios[0].nome).toBe(seed.usuarios[0].nome);
    void doTurma;
  });
});
