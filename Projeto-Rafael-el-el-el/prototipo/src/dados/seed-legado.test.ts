import { describe, expect, it } from 'vitest';
import { verificarPublicacao } from '../conteudo/regras';
import { PERFIS } from '../dominio/tipos';
import { criarSeed } from './seed';

describe('seed de demonstração', () => {
  const seed = criarSeed();

  it('tem usuários dos 4 perfis', () => {
    for (const perfil of PERFIS) expect(seed.usuarios.some((u) => u.perfil === perfil && u.ativo)).toBe(true);
  });

  it('tem 3 cursos publicados e 1 rascunho', () => {
    expect(seed.cursos.filter((c) => c.status === 'publicado')).toHaveLength(3);
    expect(seed.cursos.filter((c) => c.status === 'rascunho')).toHaveLength(1);
  });

  it('cursos publicados atendem ao critério de publicação', () => {
    for (const curso of seed.cursos.filter((c) => c.status === 'publicado')) {
      expect(verificarPublicacao(curso, seed.questoes), curso.titulo).toMatchObject({ ok: true, faltantes: [] });
    }
  });

  it('o rascunho não atende ao critério (para demonstrar a publicação bloqueada)', () => {
    const rascunho = seed.cursos.find((c) => c.status === 'rascunho')!;
    expect(verificarPublicacao(rascunho, seed.questoes).ok).toBe(false);
  });

  it('tem vínculos e histórico parcial coerentes', () => {
    expect(seed.vinculosResponsavel.length).toBeGreaterThan(0);
    expect(seed.vinculosProfessor.length).toBeGreaterThan(0);
    expect(seed.respostas.length).toBeGreaterThan(0);
    for (const r of seed.respostas) {
      const q = seed.questoes.find((x) => x.id === r.questaoId)!;
      expect(q.cursoId).toBe(r.cursoId);
      expect(r.acertou).toBe(r.alternativa === q.correta);
      expect(seed.matriculas.some((m) => m.alunoId === r.alunoId && m.cursoId === r.cursoId)).toBe(true);
    }
  });

  it('é determinístico', () => {
    expect(criarSeed()).toEqual(seed);
  });
});
