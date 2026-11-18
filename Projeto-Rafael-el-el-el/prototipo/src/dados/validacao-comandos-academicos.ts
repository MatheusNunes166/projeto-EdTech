import {
  validarGraduacao, validarPeriodoLetivo, validarDisciplina, validarTurma, validarMatricula,
  validarVinculoProfessor, validarVinculoCoordenador, validarVinculoResponsavel, type ErrosAcademicos,
} from '../dominio/academico';
import { pessoaAtiva, type LeituraProfunda } from '../dominio/autorizacao';
import { NIVEIS_CURSO, type DadosAcademicos, type Funcao } from '../dominio/tipos';
import { validarUsuario } from '../dominio/usuarios';
import { ErroRepositorioAcademico, type ValidadorCandidato } from './repositorio-academico';

export function rejeitar(campo: string, mensagem: string): never {
  throw new ErroRepositorioAcademico('VALIDACAO_REJEITADA', mensagem, { [campo]: mensagem });
}

/** Lista fechada em runtime, inclusive para chamadas que não passaram pelo TypeScript. */
export function conferirChaves(valor: object, campos: readonly string[]): void {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) rejeitar('payload', 'Informe os campos do comando.');
  for (const campo of Object.keys(valor)) {
    if (!campos.includes(campo)) rejeitar(campo, 'Campo não permitido neste comando.');
  }
}

export function conferirCampos(valor: object, campos: readonly string[]): void {
  conferirChaves(valor, campos);
  for (const campo of campos) {
    if (typeof (valor as Record<string, unknown>)[campo] !== 'string') rejeitar(campo, 'Informe um texto válido.');
  }
}

export function existente<T extends { id: string }>(lista: T[], id: string, campo: string): T {
  const item = lista.find((x) => x.id === id);
  if (!item) rejeitar(campo, 'Referência inexistente.');
  return item;
}

export function exigirPessoaAtiva(dados: DadosAcademicos, id: string, funcao: Funcao, campo: string): void {
  const pessoa = pessoaAtiva(dados, id);
  if (!pessoa?.funcoes.includes(funcao)) rejeitar(campo, `Exige pessoa ativa com função ${funcao}.`);
}

export function acumular(erros: ErrosAcademicos, prefixo: string, outros: ErrosAcademicos): void {
  for (const [campo, mensagem] of Object.entries(outros)) erros[`${prefixo}.${campo}`] = mensagem;
}

export function validarIds(erros: ErrosAcademicos, colecao: string, itens: readonly { readonly id: string }[]): void {
  const ids = new Set<string>();
  for (const item of itens) {
    if (typeof item.id !== 'string' || !item.id.trim() || ids.has(item.id)) erros[`${colecao}.id`] = 'Identificador inválido ou duplicado.';
    ids.add(item.id);
  }
}

/** Valida o estado final e impede efeitos fora da coleção do comando.
 * Conteúdo e histórico permanecem idênticos: sua edição exige comandos próprios.
 */
export function validadorDeColecao(
  colecao: keyof DadosAcademicos,
  validar: (dados: LeituraProfunda<DadosAcademicos>, anterior: LeituraProfunda<DadosAcademicos>) => ErrosAcademicos,
): ValidadorCandidato {
  return (dados, anterior) => {
    const erros = validar(dados, anterior);
    for (const campo of Object.keys(anterior) as (keyof DadosAcademicos)[]) {
      if (campo !== colecao && campo !== 'revisao' && JSON.stringify(dados[campo]) !== JSON.stringify(anterior[campo])) {
        erros[campo] = 'O comando não pode alterar estes dados.';
      }
    }
    return erros;
  };
}

export const validarGraduacoes = validadorDeColecao('graduacoes', (dados) => {
  const erros: ErrosAcademicos = {};
  validarIds(erros, 'graduacoes', dados.graduacoes);
  for (const g of dados.graduacoes) acumular(erros, g.id, validarGraduacao(g, dados.graduacoes));
  return erros;
});

export const validarPeriodos = validadorDeColecao('periodosLetivos', (dados) => {
  const erros: ErrosAcademicos = {};
  validarIds(erros, 'periodosLetivos', dados.periodosLetivos);
  for (const p of dados.periodosLetivos) acumular(erros, p.id, validarPeriodoLetivo(p));
  return erros;
});

function disciplinaComEstudo(dados: LeituraProfunda<DadosAcademicos>, disciplinaId: string): boolean {
  const turmas = new Set(dados.turmas.filter((t) => t.disciplinaId === disciplinaId).map((t) => t.id));
  return dados.matriculas.some((m) => turmas.has(m.turmaId))
    || dados.respostas.some((r) => dados.questoes.some((q) => q.id === r.questaoId && q.disciplinaId === disciplinaId));
}

export const validarDisciplinas = validadorDeColecao('disciplinas', (dados, anterior) => {
  const erros: ErrosAcademicos = {};
  // Os validadores do grupo 1 são puros; a cópia adapta os tipos mutáveis da sua assinatura.
  const copia = structuredClone(dados) as DadosAcademicos;
  validarIds(erros, 'disciplinas', dados.disciplinas);
  for (const d of copia.disciplinas) {
    acumular(erros, d.id, validarDisciplina(d, copia.graduacoes, copia.disciplinas));
    if (!NIVEIS_CURSO.includes(d.nivel)) erros[`${d.id}.nivel`] = 'Nível pedagógico inválido.';
    const original = anterior.disciplinas.find((x) => x.id === d.id);
    if (original) {
      if (original.status !== d.status || JSON.stringify(original.topicos) !== JSON.stringify(d.topicos)) {
        erros[`${d.id}.conteudo`] = 'Cadastro acadêmico não altera tópicos ou publicação.';
      }
      if (original.graduacaoId !== d.graduacaoId && disciplinaComEstudo(anterior, d.id)) {
        erros[`${d.id}.graduacaoId`] = 'Há matrícula ou resposta; crie outra oferta em vez de trocar a graduação.';
      }
    } else if (d.status !== 'rascunho' || d.topicos.length > 0) {
      erros[`${d.id}.conteudo`] = 'A disciplina deve iniciar em rascunho e sem tópicos.';
    }
  }
  return erros;
});

export const validarTurmas = validadorDeColecao('turmas', (dados, anterior) => {
  const erros: ErrosAcademicos = {};
  const copia = structuredClone(dados) as DadosAcademicos;
  validarIds(erros, 'turmas', dados.turmas);
  for (const t of copia.turmas) {
    acumular(erros, t.id, validarTurma(t, copia.disciplinas, copia.periodosLetivos, copia.turmas));
    const original = anterior.turmas.find((x) => x.id === t.id);
    const matriculas = anterior.matriculas.filter((m) => m.turmaId === t.id);
    const temEstudo = matriculas.length > 0 || anterior.respostas.some((r) => matriculas.some((m) => m.id === r.matriculaId));
    if (original && temEstudo && (original.disciplinaId !== t.disciplinaId || original.periodoLetivoId !== t.periodoLetivoId)) {
      erros[`${t.id}.oferta`] = 'Há matrícula ou resposta; crie outra turma em vez de trocar disciplina ou período.';
    }
  }
  return erros;
});

export const validarMatriculas = validadorDeColecao('matriculas', (dados, anterior) => {
  const erros: ErrosAcademicos = {};
  const copia = structuredClone(dados) as DadosAcademicos;
  validarIds(erros, 'matriculas', dados.matriculas);
  for (const m of copia.matriculas) {
    const outros = copia.matriculas.filter((x) => x.id !== m.id);
    const validacao = validarMatricula(m, copia.usuarios, copia.turmas, outros);
    acumular(erros, m.id, validacao.erros);
    if (validacao.existente) erros[`${m.id}.par`] = 'Matrícula duplicada.';
    if (!anterior.matriculas.some((x) => x.id === m.id)) {
      if (!pessoaAtiva(dados, m.alunoId)?.funcoes.includes('aluno')) erros[`${m.id}.alunoId`] = 'Exige aluno ativo.';
      if (m.data !== anterior.dataVirtual) erros[`${m.id}.data`] = 'Use a data virtual da demonstração.';
    }
  }
  for (const m of anterior.matriculas) {
    if (JSON.stringify(dados.matriculas.find((x) => x.id === m.id)) !== JSON.stringify(m)) {
      erros[`${m.id}.historico`] = 'Matrícula existente não pode ser removida ou substituída.';
    }
  }
  return erros;
});

export const validarDocentes = validadorDeColecao('vinculosProfessor', (dados, anterior) => {
  const erros: ErrosAcademicos = {};
  const copia = structuredClone(dados) as DadosAcademicos;
  copia.vinculosProfessor.forEach((v, i, todos) => {
    const validacao = validarVinculoProfessor(v, copia.usuarios, copia.turmas, todos.filter((_, j) => j !== i));
    acumular(erros, `vinculosProfessor.${i}`, validacao.erros);
    if (validacao.existente) erros[`vinculosProfessor.${i}.par`] = 'Vínculo docente duplicado.';
    const novo = !anterior.vinculosProfessor.some((x) => x.professorId === v.professorId && x.turmaId === v.turmaId);
    if (novo && !pessoaAtiva(dados, v.professorId)?.funcoes.includes('professor')) {
      erros[`vinculosProfessor.${i}.professorId`] = 'Atribuição exige Professor ativo.';
    }
  });
  return erros;
});

export const validarUsuarios = validadorDeColecao('usuarios', (dados) => {
  const erros: ErrosAcademicos = {};
  const copia = structuredClone(dados) as DadosAcademicos;
  validarIds(erros, 'usuarios', dados.usuarios);
  for (const u of copia.usuarios) {
    acumular(erros, u.id, validarUsuario(u));
    if (typeof u.nome !== 'string' || typeof u.email !== 'string' || typeof u.ativo !== 'boolean') {
      erros[`${u.id}.cadastro`] = 'Nome, e-mail ou atividade inválidos.';
    }
  }
  // Funções/atividade atuais não apagam nem invalidam estruturalmente vínculos históricos.
  return erros;
});

export const validarCoordenadores = validadorDeColecao('vinculosCoordenador', (dados, anterior) => {
  const erros: ErrosAcademicos = {};
  const copia = structuredClone(dados) as DadosAcademicos;
  copia.vinculosCoordenador.forEach((v, i, todos) => {
    const validacao = validarVinculoCoordenador(v, copia.usuarios, copia.graduacoes, todos.filter((_, j) => j !== i));
    acumular(erros, `vinculosCoordenador.${i}`, validacao.erros);
    if (validacao.existente) erros[`vinculosCoordenador.${i}.par`] = 'Vínculo de coordenação duplicado.';
    const novo = !anterior.vinculosCoordenador.some((x) => x.coordenadorId === v.coordenadorId && x.graduacaoId === v.graduacaoId);
    if (novo && !pessoaAtiva(dados, v.coordenadorId)?.funcoes.includes('coordenador')) {
      erros[`vinculosCoordenador.${i}.coordenadorId`] = 'Atribuição exige Coordenador ativo.';
    }
  });
  return erros;
});

export const validarResponsaveis = validadorDeColecao('vinculosResponsavel', (dados, anterior) => {
  const erros: ErrosAcademicos = {};
  const copia = structuredClone(dados) as DadosAcademicos;
  copia.vinculosResponsavel.forEach((v, i, todos) => {
    const validacao = validarVinculoResponsavel(v, copia.usuarios, todos.filter((_, j) => j !== i));
    acumular(erros, `vinculosResponsavel.${i}`, validacao.erros);
    if (validacao.existente) erros[`vinculosResponsavel.${i}.par`] = 'Vínculo Responsável–Aluno duplicado.';
    const novo = !anterior.vinculosResponsavel.some((x) => x.responsavelId === v.responsavelId && x.alunoId === v.alunoId);
    if (novo && (!pessoaAtiva(dados, v.responsavelId)?.funcoes.includes('responsavel')
      || !dados.usuarios.some((u) => u.id === v.alunoId && u.funcoes.includes('aluno')))) {
      erros[`vinculosResponsavel.${i}.funcoes`] = 'Atribuição exige Responsável ativo e destino com função Aluno.';
    }
  });
  return erros;
});

/** Respostas são append-only: as existentes ficam byte a byte iguais e as novas são coerentes. */
export const validarRespostas = validadorDeColecao('respostas', (dados, anterior) => {
  const erros: ErrosAcademicos = {};
  validarIds(erros, 'respostas', dados.respostas);
  anterior.respostas.forEach((original, i) => {
    if (JSON.stringify(dados.respostas[i]) !== JSON.stringify(original)) {
      erros[`${original.id}.historico`] = 'Resposta registrada não pode ser alterada ou removida.';
    }
  });
  let momento = Math.max(0, ...anterior.respostas.map((r) => r.momento));
  for (const r of dados.respostas.slice(anterior.respostas.length)) {
    if (!dados.matriculas.some((m) => m.id === r.matriculaId)) erros[`${r.id}.matriculaId`] = 'Matrícula inexistente.';
    if (r.data !== anterior.dataVirtual) erros[`${r.id}.data`] = 'Use a data virtual da demonstração.';
    if (r.momento <= momento) erros[`${r.id}.momento`] = 'A ordem das respostas deve ser crescente.';
    momento = Math.max(momento, r.momento);
    const c = r.conteudoOriginal;
    if (!Number.isInteger(r.alternativa) || r.alternativa < 0 || r.alternativa >= c.alternativas.length
      || r.acertou !== (r.alternativa === c.correta)) erros[`${r.id}.avaliacao`] = 'Avaliação inconsistente com o conteúdo apresentado.';
  }
  return erros;
});
