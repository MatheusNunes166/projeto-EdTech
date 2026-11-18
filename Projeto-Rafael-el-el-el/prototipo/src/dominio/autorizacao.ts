import { FUNCOES, type DadosAcademicos, type Funcao, type Usuario } from './tipos';

export type LeituraProfunda<T> = T extends readonly (infer Item)[]
  ? readonly LeituraProfunda<Item>[]
  : T extends object ? { readonly [Campo in keyof T]: LeituraProfunda<T[Campo]> } : T;

export type AcaoAcademica =
  | 'criar-graduacao' | 'administrar-periodos' | 'administrar-usuarios'
  | 'gerir-coordenadores' | 'gerir-responsaveis' | 'consultar-administracao'
  | 'consultar-catalogo' | 'consultar-estrutura' | 'editar-graduacao'
  | 'criar-disciplina' | 'editar-disciplina' | 'criar-turma' | 'editar-turma'
  | 'matricular' | 'gerir-docentes' | 'editar-conteudo' | 'publicar-conteudo'
  | 'consultar-turma-docente' | 'consultar-historico-docente'
  | 'consultar-painel-coordenacao' | 'consultar-painel-responsavel'
  | 'consultar-estudo' | 'responder'
  | 'consultar-metadados-catalogo' | 'consultar-minhas-turmas' | 'listar-estrutura-administravel'
  | 'listar-turmas-docentes' | 'listar-alunos-responsavel' | 'consultar-matriculados'
  | 'simular-data';

/** Pais opcionais vêm, por exemplo, de uma URL aninhada: devem corresponder ao recurso real. */
export type RecursoAcademico =
  | { tipo: 'instituicao' }
  | { tipo: 'graduacao'; graduacaoId: string }
  | { tipo: 'disciplina'; disciplinaId: string; graduacaoId?: string }
  | { tipo: 'turma'; turmaId: string; disciplinaId?: string; graduacaoId?: string }
  | { tipo: 'matricula'; matriculaId: string; turmaId?: string; disciplinaId?: string; graduacaoId?: string }
  | { tipo: 'aluno'; alunoId: string };

export interface PedidoAutorizacao {
  acao: AcaoAcademica;
  recurso: RecursoAcademico;
}

interface RecursoResolvido {
  tipo: RecursoAcademico['tipo'];
  graduacaoId?: string;
  disciplinaId?: string;
  turmaId?: string;
  alunoId?: string;
}

export function pessoaAtiva(
  dados: LeituraProfunda<DadosAcademicos>,
  pessoaId: string | null,
): LeituraProfunda<Usuario> | undefined {
  const pessoa = dados.usuarios.find((u) => u.id === pessoaId);
  if (!pessoa?.ativo || !Array.isArray(pessoa.funcoes) || pessoa.funcoes.length === 0
    || pessoa.funcoes.some((f) => !FUNCOES.includes(f))
    || new Set(pessoa.funcoes).size !== pessoa.funcoes.length) return undefined;
  return pessoa;
}

function resolverRecurso(
  dados: LeituraProfunda<DadosAcademicos>, recurso: RecursoAcademico,
): RecursoResolvido | undefined {
  if (recurso.tipo === 'instituicao') return { tipo: recurso.tipo };
  if (recurso.tipo === 'aluno') {
    return dados.usuarios.some((u) => u.id === recurso.alunoId)
      ? { tipo: recurso.tipo, alunoId: recurso.alunoId } : undefined;
  }
  if (recurso.tipo === 'graduacao') {
    return dados.graduacoes.some((g) => g.id === recurso.graduacaoId)
      ? { tipo: recurso.tipo, graduacaoId: recurso.graduacaoId } : undefined;
  }
  const matricula = recurso.tipo === 'matricula'
    ? dados.matriculas.find((m) => m.id === recurso.matriculaId) : undefined;
  if (recurso.tipo === 'matricula' && (!matricula
    || !dados.usuarios.some((u) => u.id === matricula.alunoId))) return undefined;
  const turmaId = matricula?.turmaId ?? (recurso.tipo === 'turma' ? recurso.turmaId : undefined);
  const turma = turmaId === undefined ? undefined : dados.turmas.find((t) => t.id === turmaId);
  if (turmaId !== undefined && (!turma
    || !dados.periodosLetivos.some((p) => p.id === turma.periodoLetivoId))) return undefined;
  const disciplinaId = turma?.disciplinaId ?? (recurso.tipo === 'disciplina' ? recurso.disciplinaId : undefined);
  const disciplina = dados.disciplinas.find((d) => d.id === disciplinaId);
  if (!disciplina || !dados.graduacoes.some((g) => g.id === disciplina.graduacaoId)) return undefined;
  if (recurso.graduacaoId !== undefined && recurso.graduacaoId !== disciplina.graduacaoId) return undefined;
  if (recurso.disciplinaId !== undefined && recurso.disciplinaId !== disciplina.id) return undefined;
  if (recurso.tipo === 'matricula' && recurso.turmaId !== undefined && recurso.turmaId !== turmaId) return undefined;
  return { tipo: recurso.tipo, graduacaoId: disciplina.graduacaoId, disciplinaId, turmaId, alunoId: matricula?.alunoId };
}

/** Só decide autorização. Validações de payload, publicação e estudo pertencem aos comandos. */
export function podeExecutar(
  dados: LeituraProfunda<DadosAcademicos>, autorId: string | null, pedido: PedidoAutorizacao,
): boolean {
  const autor = pessoaAtiva(dados, autorId);
  const recurso = resolverRecurso(dados, pedido.recurso);
  if (!autor || !recurso) return false;
  const tem = (funcao: Funcao) => autor.funcoes.includes(funcao);
  const admin = tem('admin');
  const coordena = tem('coordenador') && dados.vinculosCoordenador.some((v) =>
    v.coordenadorId === autor.id && v.graduacaoId === recurso.graduacaoId);
  const lecionaTurma = tem('professor') && dados.vinculosProfessor.some((v) =>
    v.professorId === autor.id && v.turmaId === recurso.turmaId);
  const lecionaDisciplina = tem('professor') && dados.vinculosProfessor.some((v) =>
    v.professorId === autor.id && dados.turmas.some((t) =>
      t.id === v.turmaId && t.disciplinaId === recurso.disciplinaId
      && dados.periodosLetivos.some((p) => p.id === t.periodoLetivoId)));

  switch (pedido.acao) {
    case 'criar-graduacao': case 'administrar-periodos': case 'administrar-usuarios':
    case 'gerir-coordenadores': case 'gerir-responsaveis': case 'consultar-administracao':
      return recurso.tipo === 'instituicao' && admin;
    case 'simular-data':
      return recurso.tipo === 'instituicao';
    case 'consultar-catalogo':
      return recurso.tipo === 'instituicao' && tem('aluno');
    case 'consultar-metadados-catalogo':
      return tem('aluno') && (recurso.tipo === 'graduacao'
        || (['disciplina', 'turma'].includes(recurso.tipo)
          && dados.disciplinas.some((d) => d.id === recurso.disciplinaId && d.status === 'publicado')));
    case 'consultar-minhas-turmas':
      return recurso.tipo === 'instituicao' && tem('aluno');
    case 'listar-estrutura-administravel':
      return recurso.tipo === 'instituicao' && (admin || tem('coordenador'));
    case 'listar-turmas-docentes':
      return recurso.tipo === 'instituicao' && tem('professor');
    case 'listar-alunos-responsavel':
      return recurso.tipo === 'instituicao' && tem('responsavel');
    case 'consultar-matriculados':
      return recurso.tipo === 'turma' && (admin || coordena || lecionaTurma);
    case 'consultar-estrutura': case 'consultar-painel-coordenacao':
      return ['graduacao', 'disciplina', 'turma'].includes(recurso.tipo) && (admin || coordena);
    case 'editar-graduacao': case 'criar-disciplina':
      return recurso.tipo === 'graduacao' && (admin || coordena);
    case 'editar-disciplina': case 'criar-turma':
      return recurso.tipo === 'disciplina' && (admin || coordena);
    case 'editar-turma': case 'matricular': case 'gerir-docentes':
      return recurso.tipo === 'turma' && (admin || coordena);
    case 'editar-conteudo': case 'publicar-conteudo':
      return recurso.tipo === 'disciplina' && (admin || lecionaDisciplina);
    case 'consultar-turma-docente':
      return recurso.tipo === 'turma' && lecionaTurma;
    case 'consultar-historico-docente':
      return recurso.tipo === 'matricula' && lecionaTurma;
    case 'consultar-painel-responsavel':
      return recurso.tipo === 'aluno' && tem('responsavel') && dados.vinculosResponsavel.some((v) =>
        v.responsavelId === autor.id && v.alunoId === recurso.alunoId);
    case 'consultar-estudo': case 'responder':
      return recurso.tipo === 'matricula' && tem('aluno') && recurso.alunoId === autor.id
        && dados.disciplinas.some((d) => d.id === recurso.disciplinaId && d.status === 'publicado');
    default:
      return false;
  }
}
