/**
 * Seed acadêmico fictício e determinístico (design D8). Todos os dados são inventados.
 * Conteúdo pedagógico reaproveita os materiais e questões já escritos para o seed legado,
 * agora pertencentes a disciplinas; os históricos são gerados pelo próprio motor adaptativo.
 * Incrementar SEED_ACADEMICO_VERSAO sempre que a estrutura ou o conteúdo mudar.
 */
import { resolverContextoEstudo } from '../adaptativo/contexto-estudo';
import { proximaQuestaoMatricula } from '../adaptativo/estudo';
import { criarRespostaAcademica } from '../adaptativo/respostas';
import { somarDias } from '../dominio/datas';
import {
  VERSAO_SCHEMA_ACADEMICO, type DadosAcademicos, type Disciplina, type QuestaoDisciplina,
  type RespostaAcademica, type Usuario,
} from '../dominio/tipos';
import { criarQuestoes, cursos } from './seed';

export const SEED_ACADEMICO_VERSAO = 1;
export const DATA_INICIAL_ACADEMICA = '2026-11-17';

const usuarios: Usuario[] = [
  { id: 'u-ana', nome: 'Ana Souza', email: 'ana@exemplo.com', funcoes: ['aluno'], ativo: true },
  { id: 'u-bruno', nome: 'Bruno Lima', email: 'bruno@exemplo.com', funcoes: ['aluno'], ativo: true },
  { id: 'u-elisa', nome: 'Elisa Prado', email: 'elisa@exemplo.com', funcoes: ['aluno'], ativo: true },
  { id: 'u-diego', nome: 'Diego Martins', email: 'diego@exemplo.com', funcoes: ['aluno'], ativo: true },
  { id: 'u-carla', nome: 'Carla Dias', email: 'carla@exemplo.com', funcoes: ['professor', 'coordenador'], ativo: true },
  { id: 'u-lucia', nome: 'Lúcia Ferraz', email: 'lucia@exemplo.com', funcoes: ['coordenador'], ativo: true },
  { id: 'u-marcos', nome: 'Marcos Silva', email: 'marcos@exemplo.com', funcoes: ['professor'], ativo: true },
  { id: 'u-julia', nome: 'Júlia Rocha', email: 'julia@exemplo.com', funcoes: ['professor'], ativo: true },
  { id: 'u-paulo', nome: 'Paulo Antunes', email: 'paulo@exemplo.com', funcoes: ['professor'], ativo: false },
  { id: 'u-renata', nome: 'Renata Alves', email: 'renata@exemplo.com', funcoes: ['admin'], ativo: true },
  { id: 'u-helena', nome: 'Helena Souza', email: 'helena@exemplo.com', funcoes: ['responsavel'], ativo: true },
  { id: 'u-roberto', nome: 'Roberto Lima', email: 'roberto@exemplo.com', funcoes: ['responsavel'], ativo: true },
];

/** Conteúdo legado → disciplina (id, graduação, código). */
const ORIGEM: Record<string, { id: string; graduacaoId: string; codigo: string; nome: string }> = {
  'c-log': { id: 'd-alg', graduacaoId: 'g-si', codigo: 'ALG', nome: 'Algoritmos' },
  'c-ing': { id: 'd-ing', graduacaoId: 'g-si', codigo: 'ING', nome: 'Inglês Inicial' },
  'c-mat': { id: 'd-mat', graduacaoId: 'g-lm', codigo: 'MAT', nome: 'Matemática Básica' },
  'c-geo': { id: 'd-geo', graduacaoId: 'g-lm', codigo: 'GEO', nome: 'Geometria Plana' },
};

function criarDisciplinas(): Disciplina[] {
  return cursos.map((c) => {
    const o = ORIGEM[c.id];
    return {
      id: o.id, graduacaoId: o.graduacaoId, codigo: o.codigo, nome: o.nome, descricaoCurta: c.descricaoCurta,
      descricao: c.descricao, nivel: c.nivel, status: c.status, topicos: structuredClone(c.topicos),
    };
  });
}

function criarQuestoesAcademicas(): QuestaoDisciplina[] {
  return criarQuestoes().map(({ cursoId, ...q }) => ({ ...q, disciplinaId: ORIGEM[cursoId].id, revisao: 0 }));
}

export type PlanoHistorico = [diasAtras: number, resultados: boolean[]][];
const V = true;
const F = false;

/**
 * Gera respostas de UMA matrícula usando o motor: a questão é a escolhida por `proximaQuestaoMatricula`
 * sobre o histórico já gerado, e a avaliação/efeitos são os de `criarRespostaAcademica`. Para quando a
 * trilha termina (não há próxima atividade).
 */
export function gerarHistoricoMatricula(
  base: DadosAcademicos, matriculaId: string, plano: PlanoHistorico, momento: { valor: number },
): RespostaAcademica[] {
  const inicial = resolverContextoEstudo(base, matriculaId);
  if (!inicial) throw new Error(`Matrícula inexistente: ${matriculaId}`);
  const respostas: RespostaAcademica[] = [];
  for (const [diasAtras, resultados] of plano) {
    for (const acertou of resultados) {
      const proxima = proximaQuestaoMatricula({ ...inicial, respostas });
      if (!proxima) return respostas;
      const q = proxima.questao;
      respostas.push(criarRespostaAcademica({
        id: `r-${++momento.valor}`, matriculaId, questao: q,
        alternativa: acertou ? q.correta : (q.correta + 1) % q.alternativas.length,
        data: somarDias(DATA_INICIAL_ACADEMICA, -diasAtras), momento: momento.valor,
      }));
    }
  }
  return respostas;
}

/** Sete acertos levam um tópico de 0 a 90: 4 Fáceis, 2 Médios e 1 Difícil. */
const diasSeguidos = (primeiroDia: number, porDia: number, dias: number): PlanoHistorico =>
  Array.from({ length: dias }, (_, i) => [primeiroDia - i, Array<boolean>(porDia).fill(V)] as [number, boolean[]]);

export const PLANOS_HISTORICO: Record<string, PlanoHistorico> = {
  // Ana: trilha em andamento em Algoritmos 2026.2; Algoritmos 2027.1 sem respostas.
  'm-ana-alg-a-262': [[3, [V, V, V, V]], [2, [V, F, V, V, V]], [1, [V, V, F, F, V]]],
  'm-ana-ing-a-262': [[6, [V, F, V]], [1, [V, V]]],
  // Bruno: dificuldade recente em Algoritmos B e início em Matemática.
  'm-bruno-alg-b-262': [[6, [V, V, F, V]], [4, [F, F, V, F]], [1, [F, V, F, F, V, F]]],
  'm-bruno-mat-a-262': [[5, [V, V, V]]],
  // Elisa: trilha concluída, com sete dias consecutivos de estudo.
  'm-elisa-alg-a-262': diasSeguidos(10, 3, 7),
};

export function criarSeedAcademico(): DadosAcademicos {
  const hoje = DATA_INICIAL_ACADEMICA;
  const base: DadosAcademicos = {
    versaoSchema: VERSAO_SCHEMA_ACADEMICO,
    versaoSeed: SEED_ACADEMICO_VERSAO,
    revisao: 0,
    dataVirtual: hoje,
    usuarios,
    graduacoes: [
      { id: 'g-si', codigo: 'SI', nome: 'Sistemas de Informação', area: 'Tecnologia',
        descricao: 'Formação em desenvolvimento e análise de sistemas.\n\nCurso fictício de demonstração.' },
      { id: 'g-lm', codigo: 'LM', nome: 'Licenciatura em Matemática', area: 'Exatas',
        descricao: 'Formação de professores de Matemática.\n\nCurso fictício de demonstração.' },
    ],
    disciplinas: criarDisciplinas(),
    periodosLetivos: [
      { id: 'p-2026-2', nome: '2026.2', dataInicio: '2026-08-03', dataFim: '2026-12-18' },
      { id: 'p-2027-1', nome: '2027.1', dataInicio: '2027-02-01', dataFim: '2027-06-30' },
    ],
    turmas: [
      { id: 't-alg-a-262', codigo: 'A', disciplinaId: 'd-alg', periodoLetivoId: 'p-2026-2' },
      { id: 't-alg-b-262', codigo: 'B', disciplinaId: 'd-alg', periodoLetivoId: 'p-2026-2' },
      { id: 't-alg-a-271', codigo: 'A', disciplinaId: 'd-alg', periodoLetivoId: 'p-2027-1' },
      { id: 't-ing-a-262', codigo: 'A', disciplinaId: 'd-ing', periodoLetivoId: 'p-2026-2' },
      { id: 't-mat-a-262', codigo: 'A', disciplinaId: 'd-mat', periodoLetivoId: 'p-2026-2' },
      { id: 't-mat-a-271', codigo: 'A', disciplinaId: 'd-mat', periodoLetivoId: 'p-2027-1' },
      { id: 't-geo-a-262', codigo: 'A', disciplinaId: 'd-geo', periodoLetivoId: 'p-2026-2' },
    ],
    matriculas: [
      { id: 'm-ana-alg-a-262', alunoId: 'u-ana', turmaId: 't-alg-a-262', data: somarDias(hoje, -40) },
      { id: 'm-ana-alg-a-271', alunoId: 'u-ana', turmaId: 't-alg-a-271', data: somarDias(hoje, -2) },
      { id: 'm-ana-ing-a-262', alunoId: 'u-ana', turmaId: 't-ing-a-262', data: somarDias(hoje, -38) },
      { id: 'm-bruno-alg-b-262', alunoId: 'u-bruno', turmaId: 't-alg-b-262', data: somarDias(hoje, -39) },
      { id: 'm-bruno-mat-a-262', alunoId: 'u-bruno', turmaId: 't-mat-a-262', data: somarDias(hoje, -37) },
      { id: 'm-elisa-alg-a-262', alunoId: 'u-elisa', turmaId: 't-alg-a-262', data: somarDias(hoje, -41) },
      { id: 'm-diego-alg-a-262', alunoId: 'u-diego', turmaId: 't-alg-a-262', data: somarDias(hoje, -5) },
    ],
    questoes: criarQuestoesAcademicas(),
    respostas: [],
    vinculosProfessor: [
      { professorId: 'u-marcos', turmaId: 't-alg-a-262' },
      { professorId: 'u-marcos', turmaId: 't-alg-b-262' },
      { professorId: 'u-marcos', turmaId: 't-alg-a-271' },
      { professorId: 'u-julia', turmaId: 't-ing-a-262' },
      { professorId: 'u-julia', turmaId: 't-geo-a-262' },
      { professorId: 'u-carla', turmaId: 't-mat-a-262' },
      { professorId: 'u-carla', turmaId: 't-mat-a-271' },
    ],
    vinculosCoordenador: [
      { coordenadorId: 'u-carla', graduacaoId: 'g-si' },
      { coordenadorId: 'u-lucia', graduacaoId: 'g-lm' },
    ],
    vinculosResponsavel: [
      { responsavelId: 'u-helena', alunoId: 'u-ana' },
      { responsavelId: 'u-roberto', alunoId: 'u-bruno' },
      { responsavelId: 'u-roberto', alunoId: 'u-elisa' },
    ],
    revisoesTextuais: [],
  };

  const momento = { valor: 0 };
  base.respostas = base.matriculas.flatMap((m) => {
    const plano = PLANOS_HISTORICO[m.id];
    return plano ? gerarHistoricoMatricula(base, m.id, plano, momento) : [];
  });
  return structuredClone(base);
}
