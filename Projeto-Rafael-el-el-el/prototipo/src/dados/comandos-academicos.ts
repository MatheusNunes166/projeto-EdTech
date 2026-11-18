import { criarDisciplina as comporDisciplina } from '../dominio/academico';
import type {
  Disciplina, Graduacao, Matricula, PeriodoLetivo, Turma, Usuario,
  VinculoProfessor, VinculoCoordenador, VinculoResponsavel,
} from '../dominio/tipos';
import {
  RepositorioAcademico, type PersistenciaAcademica, type SessaoAcademica,
} from './repositorio-academico';
import {
  conferirCampos, existente, exigirPessoaAtiva, validarGraduacoes, validarPeriodos,
  validarDisciplinas, validarTurmas, validarMatriculas, validarDocentes, rejeitar,
  conferirChaves, validarUsuarios, validarCoordenadores, validarResponsaveis,
} from './validacao-comandos-academicos';

export type CadastroGraduacao = Omit<Graduacao, 'id'>;
export type CadastroPeriodo = Omit<PeriodoLetivo, 'id'>;
export type CadastroDisciplina = Omit<Disciplina, 'id' | 'topicos' | 'status'>;
export type DisciplinaCadastral = Omit<Disciplina, 'topicos'>;
export type CadastroTurma = Omit<Turma, 'id'>;
export type CadastroUsuario = Omit<Usuario, 'id'>;
export interface AlvoDisciplina { disciplinaId: string; graduacaoId?: string }
export interface AlvoTurma { turmaId: string; disciplinaId?: string; graduacaoId?: string }
export interface ResultadoMatricula { matricula: Matricula; jaExistia: boolean }
export interface ResultadoVinculo<T> { vinculo: T; vinculado: boolean; alterado: boolean }

function recursoDisciplina(alvo: AlvoDisciplina) {
  return { tipo: 'disciplina' as const, disciplinaId: alvo.disciplinaId, graduacaoId: alvo.graduacaoId };
}
function recursoTurma(alvo: AlvoTurma) {
  return { tipo: 'turma' as const, turmaId: alvo.turmaId, disciplinaId: alvo.disciplinaId, graduacaoId: alvo.graduacaoId };
}

function conferirUsuario(campos: CadastroUsuario): void {
  conferirChaves(campos, ['nome', 'email', 'ativo', 'funcoes']);
  if (typeof campos.nome !== 'string' || typeof campos.email !== 'string'
    || typeof campos.ativo !== 'boolean' || !Array.isArray(campos.funcoes)) {
    rejeitar('usuario', 'Informe nome, e-mail, atividade e funções válidos.');
  }
}
const camposGraduacao = ['codigo', 'nome', 'descricao', 'area'] as const;
const camposPeriodo = ['nome', 'dataInicio', 'dataFim'] as const;
const camposDisciplina = ['graduacaoId', 'codigo', 'nome', 'descricaoCurta', 'descricao', 'nivel'] as const;
const camposTurma = ['codigo', 'disciplinaId', 'periodoLetivoId'] as const;

/** Comandos acadêmicos sem adaptador padrão, seed ou integração com as telas legadas. */
export class ComandosAcademicos extends RepositorioAcademico {
  constructor(
    persistencia: PersistenciaAcademica, sessao: SessaoAcademica,
    protected readonly gerarId: () => string = () => crypto.randomUUID(),
  ) { super(persistencia, sessao); }

  criarGraduacao(campos: CadastroGraduacao, revisao: number): Promise<Graduacao> {
    return this.alterar({ acao: 'criar-graduacao', recurso: { tipo: 'instituicao' } }, revisao, (dados) => {
      conferirCampos(campos, camposGraduacao);
      const nova = { id: this.gerarId(), codigo: campos.codigo, nome: campos.nome, descricao: campos.descricao, area: campos.area };
      dados.graduacoes.push(nova);
      return nova;
    }, validarGraduacoes);
  }

  editarGraduacao(graduacaoId: string, campos: CadastroGraduacao, revisao: number): Promise<Graduacao> {
    return this.alterar({ acao: 'editar-graduacao', recurso: { tipo: 'graduacao', graduacaoId } }, revisao, (dados) => {
      conferirCampos(campos, camposGraduacao);
      const g = existente(dados.graduacoes, graduacaoId, 'graduacaoId');
      g.codigo = campos.codigo; g.nome = campos.nome; g.descricao = campos.descricao; g.area = campos.area;
      return g;
    }, validarGraduacoes);
  }

  criarPeriodoLetivo(campos: CadastroPeriodo, revisao: number): Promise<PeriodoLetivo> {
    return this.alterar({ acao: 'administrar-periodos', recurso: { tipo: 'instituicao' } }, revisao, (dados) => {
      conferirCampos(campos, camposPeriodo);
      const novo = { id: this.gerarId(), nome: campos.nome, dataInicio: campos.dataInicio, dataFim: campos.dataFim };
      dados.periodosLetivos.push(novo);
      return novo;
    }, validarPeriodos);
  }

  editarPeriodoLetivo(periodoId: string, campos: CadastroPeriodo, revisao: number): Promise<PeriodoLetivo> {
    return this.alterar({ acao: 'administrar-periodos', recurso: { tipo: 'instituicao' } }, revisao, (dados) => {
      conferirCampos(campos, camposPeriodo);
      const p = existente(dados.periodosLetivos, periodoId, 'periodoLetivoId');
      p.nome = campos.nome; p.dataInicio = campos.dataInicio; p.dataFim = campos.dataFim;
      return p;
    }, validarPeriodos);
  }

  criarDisciplina(campos: CadastroDisciplina, revisao: number): Promise<Disciplina> {
    return this.alterar({ acao: 'criar-disciplina', recurso: { tipo: 'graduacao', graduacaoId: campos.graduacaoId } }, revisao, (dados) => {
      conferirCampos(campos, camposDisciplina);
      const nova = comporDisciplina({
        id: this.gerarId(), graduacaoId: campos.graduacaoId, codigo: campos.codigo, nome: campos.nome,
        descricaoCurta: campos.descricaoCurta, descricao: campos.descricao, nivel: campos.nivel,
      });
      dados.disciplinas.push(nova);
      return nova;
    }, validarDisciplinas);
  }

  editarDisciplina(alvo: AlvoDisciplina, campos: CadastroDisciplina, revisao: number): Promise<DisciplinaCadastral> {
    return this.alterar([
      { acao: 'editar-disciplina', recurso: recursoDisciplina(alvo) },
      { acao: 'criar-disciplina', recurso: { tipo: 'graduacao', graduacaoId: campos.graduacaoId } },
    ], revisao, (dados) => {
      conferirCampos(campos, camposDisciplina);
      const d = existente(dados.disciplinas, alvo.disciplinaId, 'disciplinaId');
      d.graduacaoId = campos.graduacaoId; d.codigo = campos.codigo; d.nome = campos.nome;
      d.descricaoCurta = campos.descricaoCurta; d.descricao = campos.descricao; d.nivel = campos.nivel;
      return {
        id: d.id, graduacaoId: d.graduacaoId, codigo: d.codigo, nome: d.nome,
        descricaoCurta: d.descricaoCurta, descricao: d.descricao, nivel: d.nivel, status: d.status,
      };
    }, validarDisciplinas);
  }

  criarTurma(campos: CadastroTurma, revisao: number): Promise<Turma> {
    return this.alterar({ acao: 'criar-turma', recurso: { tipo: 'disciplina', disciplinaId: campos.disciplinaId } }, revisao, (dados) => {
      conferirCampos(campos, camposTurma);
      const nova = { id: this.gerarId(), codigo: campos.codigo, disciplinaId: campos.disciplinaId, periodoLetivoId: campos.periodoLetivoId };
      dados.turmas.push(nova);
      return nova;
    }, validarTurmas);
  }

  editarTurma(alvo: AlvoTurma, campos: CadastroTurma, revisao: number): Promise<Turma> {
    return this.alterar([
      { acao: 'editar-turma', recurso: recursoTurma(alvo) },
      { acao: 'criar-turma', recurso: { tipo: 'disciplina', disciplinaId: campos.disciplinaId } },
    ], revisao, (dados) => {
      conferirCampos(campos, camposTurma);
      const t = existente(dados.turmas, alvo.turmaId, 'turmaId');
      t.codigo = campos.codigo; t.disciplinaId = campos.disciplinaId; t.periodoLetivoId = campos.periodoLetivoId;
      return t;
    }, validarTurmas);
  }

  matricular(alvo: AlvoTurma, campos: { alunoId: string }, revisao: number): Promise<ResultadoMatricula> {
    return this.alterar({ acao: 'matricular', recurso: recursoTurma(alvo) }, revisao, (dados) => {
      conferirCampos(campos, ['alunoId']);
      exigirPessoaAtiva(dados, campos.alunoId, 'aluno', 'alunoId');
      const atual = dados.matriculas.find((m) => m.alunoId === campos.alunoId && m.turmaId === alvo.turmaId);
      if (atual) return { matricula: atual, jaExistia: true };
      const matricula = { id: this.gerarId(), alunoId: campos.alunoId, turmaId: alvo.turmaId, data: dados.dataVirtual };
      dados.matriculas.push(matricula);
      return { matricula, jaExistia: false };
    }, validarMatriculas);
  }

  definirVinculoProfessor(
    alvo: AlvoTurma, campos: { professorId: string }, vinculado: boolean, revisao: number,
  ): Promise<ResultadoVinculo<VinculoProfessor>> {
    return this.alterar({ acao: 'gerir-docentes', recurso: recursoTurma(alvo) }, revisao, (dados) => {
      conferirCampos(campos, ['professorId']);
      if (typeof vinculado !== 'boolean') rejeitar('vinculado', 'Informe atribuição ou remoção.');
      existente(dados.usuarios, campos.professorId, 'professorId');
      if (vinculado) exigirPessoaAtiva(dados, campos.professorId, 'professor', 'professorId');
      const vinculo = { professorId: campos.professorId, turmaId: alvo.turmaId };
      const indice = dados.vinculosProfessor.findIndex((v) => v.professorId === vinculo.professorId && v.turmaId === vinculo.turmaId);
      if (vinculado && indice < 0) dados.vinculosProfessor.push(vinculo);
      if (!vinculado && indice >= 0) dados.vinculosProfessor.splice(indice, 1);
      return { vinculo, vinculado, alterado: vinculado ? indice < 0 : indice >= 0 };
    }, validarDocentes);
  }

  criarUsuario(campos: CadastroUsuario, revisao: number): Promise<Usuario> {
    return this.alterar({ acao: 'administrar-usuarios', recurso: { tipo: 'instituicao' } }, revisao, (dados) => {
      conferirUsuario(campos);
      const novo = { id: this.gerarId(), nome: campos.nome, email: campos.email, ativo: campos.ativo, funcoes: [...campos.funcoes] };
      dados.usuarios.push(novo);
      return novo;
    }, validarUsuarios);
  }

  editarUsuario(usuarioId: string, campos: CadastroUsuario, revisao: number): Promise<Usuario> {
    return this.alterar({ acao: 'administrar-usuarios', recurso: { tipo: 'instituicao' } }, revisao, (dados) => {
      conferirUsuario(campos);
      const u = existente(dados.usuarios, usuarioId, 'usuarioId');
      u.nome = campos.nome; u.email = campos.email; u.ativo = campos.ativo; u.funcoes = [...campos.funcoes];
      return u;
    }, validarUsuarios);
  }

  definirAtivo(usuarioId: string, ativo: boolean, revisao: number): Promise<Usuario> {
    return this.alterar({ acao: 'administrar-usuarios', recurso: { tipo: 'instituicao' } }, revisao, (dados) => {
      if (typeof ativo !== 'boolean') rejeitar('ativo', 'Informe atividade válida.');
      const u = existente(dados.usuarios, usuarioId, 'usuarioId');
      u.ativo = ativo;
      return u;
    }, validarUsuarios);
  }

  definirVinculoCoordenador(
    campos: VinculoCoordenador, vinculado: boolean, revisao: number,
  ): Promise<ResultadoVinculo<VinculoCoordenador>> {
    return this.alterar({ acao: 'gerir-coordenadores', recurso: { tipo: 'instituicao' } }, revisao, (dados) => {
      conferirCampos(campos, ['coordenadorId', 'graduacaoId']);
      if (typeof vinculado !== 'boolean') rejeitar('vinculado', 'Informe atribuição ou remoção.');
      existente(dados.graduacoes, campos.graduacaoId, 'graduacaoId');
      existente(dados.usuarios, campos.coordenadorId, 'coordenadorId');
      if (vinculado) exigirPessoaAtiva(dados, campos.coordenadorId, 'coordenador', 'coordenadorId');
      const vinculo = { coordenadorId: campos.coordenadorId, graduacaoId: campos.graduacaoId };
      const indice = dados.vinculosCoordenador.findIndex((v) => v.coordenadorId === vinculo.coordenadorId && v.graduacaoId === vinculo.graduacaoId);
      if (vinculado && indice < 0) dados.vinculosCoordenador.push(vinculo);
      if (!vinculado && indice >= 0) dados.vinculosCoordenador.splice(indice, 1);
      return { vinculo, vinculado, alterado: vinculado ? indice < 0 : indice >= 0 };
    }, validarCoordenadores);
  }

  definirVinculoResponsavel(
    campos: VinculoResponsavel, vinculado: boolean, revisao: number,
  ): Promise<ResultadoVinculo<VinculoResponsavel>> {
    return this.alterar({ acao: 'gerir-responsaveis', recurso: { tipo: 'instituicao' } }, revisao, (dados) => {
      conferirCampos(campos, ['responsavelId', 'alunoId']);
      if (typeof vinculado !== 'boolean') rejeitar('vinculado', 'Informe atribuição ou remoção.');
      existente(dados.usuarios, campos.responsavelId, 'responsavelId');
      const aluno = existente(dados.usuarios, campos.alunoId, 'alunoId');
      if (vinculado) {
        exigirPessoaAtiva(dados, campos.responsavelId, 'responsavel', 'responsavelId');
        if (!aluno.funcoes.includes('aluno')) rejeitar('alunoId', 'O destino deve ter função Aluno.');
      }
      const vinculo = { responsavelId: campos.responsavelId, alunoId: campos.alunoId };
      const indice = dados.vinculosResponsavel.findIndex((v) => v.responsavelId === vinculo.responsavelId && v.alunoId === vinculo.alunoId);
      if (vinculado && indice < 0) dados.vinculosResponsavel.push(vinculo);
      if (!vinculado && indice >= 0) dados.vinculosResponsavel.splice(indice, 1);
      return { vinculo, vinculado, alterado: vinculado ? indice < 0 : indice >= 0 };
    }, validarResponsaveis);
  }
}
