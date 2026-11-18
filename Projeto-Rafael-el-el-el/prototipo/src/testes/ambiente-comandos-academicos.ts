import { vi, expect } from 'vitest';
import type { DadosAcademicos } from '../dominio/tipos';
import { ComandosAcademicos } from '../dados/comandos-academicos';
import type { PersistenciaAcademica, SessaoAcademica } from '../dados/repositorio-academico';
import { criarFixtureAutorizacao } from './fixtures-autorizacao';

/** Armazenamento inteiramente em memória; nunca importa seed nem usa chaves da demonstração. */
export function ambienteComandos(preparar?: (dados: DadosAcademicos) => void) {
  const inicial = criarFixtureAutorizacao(); preparar?.(inicial);
  let bruto = JSON.stringify(inicial), usuarioId: string | null = null, sequencia = 0;
  const persistencia: PersistenciaAcademica = {
    ler: () => bruto,
    gravar: vi.fn((novo: string) => { bruto = novo; }),
  };
  const sessao: SessaoAcademica = {
    obterUsuarioId: () => usuarioId,
    definirUsuarioId: (id) => { usuarioId = id; },
  };
  const gerarId = vi.fn(() => `novo-${++sequencia}`);
  return {
    repo: new ComandosAcademicos(persistencia, sessao, gerarId), persistencia, sessao, gerarId,
    ler: () => JSON.parse(bruto) as DadosAcademicos,
    bruto: () => bruto,
  };
}

/** Toda recusa deve preservar os bytes completos, revisão e retratos já lidos. */
export async function recusaSemEfeitos(
  a: ReturnType<typeof ambienteComandos>, comando: () => Promise<unknown>, codigo?: string,
) {
  const antes = a.bruto(), retrato = a.ler(), copia = structuredClone(retrato);
  vi.mocked(a.persistencia.gravar).mockClear();
  if (codigo) await expect(comando()).rejects.toMatchObject({ codigo });
  else await expect(comando()).rejects.toThrow();
  expect(a.bruto()).toBe(antes); expect(a.ler().revisao).toBe(copia.revisao);
  expect(retrato).toEqual(copia); expect(a.persistencia.gravar).not.toHaveBeenCalled();
}

/** Publica a disciplina da matrícula com 2 tópicos e uma questão por dificuldade (sem respostas). */
export function prepararConteudoPublicado(dados: DadosAcademicos, matriculaId = 'm-ana-26') {
  const m = dados.matriculas.find((x) => x.id === matriculaId)!;
  const t = dados.turmas.find((x) => x.id === m.turmaId)!;
  const disciplina = dados.disciplinas.find((x) => x.id === t.disciplinaId)!;
  if (disciplina.topicos.length > 0) return disciplina;
  disciplina.status = 'publicado';
  disciplina.topicos = ['tp-1', 'tp-2'].map((id) => ({ id, titulo: id, materiais: [] }));
  for (const topico of disciplina.topicos) {
    for (const dificuldade of ['facil', 'medio', 'dificil'] as const) {
      dados.questoes.push({
        id: `${disciplina.id}-${topico.id}-${dificuldade}`, disciplinaId: disciplina.id, topicoId: topico.id,
        dificuldade, enunciado: 'Texto original', alternativas: ['Sim', 'Não'], correta: 0,
        explicacao: 'Explicação original', revisao: 0,
      });
    }
  }
  return disciplina;
}

/** Estado sintético para testes de preservação, não um fluxo/seed gerado pelo motor. */
export function adicionarHistoricoSintetico(dados: DadosAcademicos, matriculaId = 'm-ana-26') {
  const disciplina = prepararConteudoPublicado(dados, matriculaId);
  dados.respostas.push({
    id: `r-${matriculaId}`, matriculaId, topicoId: 'tp-1', questaoId: `${disciplina.id}-tp-1-dificil`,
    alternativa: 0, acertou: true, dificuldade: 'dificil', variacaoDominio: 80, xpConcedido: 30,
    versaoRegras: 1, data: '2026-11-16', momento: 1,
    conteudoOriginal: { enunciado: 'Texto original', alternativas: ['Sim', 'Não'], correta: 0, explicacao: 'Explicação original' },
  });
}
