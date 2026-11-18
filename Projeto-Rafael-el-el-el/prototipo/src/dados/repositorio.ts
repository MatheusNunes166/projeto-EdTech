/**
 * Camada de repositório (design D3). Interface assíncrona para que o
 * localStorage possa ser trocado por uma API real no MVP sem mexer nas telas.
 */
import { verificarPublicacao, type VerificacaoPublicacao } from '../conteudo/regras';
import { somarDias } from '../dominio/datas';
import type { Curso, Dados, MatriculaLegada as Matricula, Questao, Resposta, UsuarioLegado as Usuario } from '../dominio/tipos';
import { SEED_VERSAO, criarSeed } from './seed';

const CHAVE_DADOS = 'trilha-adaptativa:dados';
const CHAVE_SESSAO = 'trilha-adaptativa:sessao';

export type NovaResposta = Omit<Resposta, 'id' | 'momento' | 'data' | 'acertou' | 'topicoId' | 'dificuldade'>;

/** Dados locais incompatíveis: nada foi alterado. */
export class ErroArmazenamentoLegado extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'ErroArmazenamentoLegado';
  }
}

let contadorIds = 0;
export function novoId(prefixo: string): string {
  contadorIds++;
  return `${prefixo}-${Date.now().toString(36)}-${contadorIds}`;
}

export class Repositorio {
  constructor(private readonly storage: Storage = window.localStorage) {}

  // ---- infraestrutura -------------------------------------------------

  /**
   * Primeira execução (sem dados) inicializa a demonstração; dados existentes incompatíveis NUNCA são
   * substituídos em silêncio: a substituição exige a confirmação do fluxo acadêmico (armazenamento-academico).
   */
  private ler(): Dados {
    const bruto = this.storage.getItem(CHAVE_DADOS);
    if (bruto === null) {
      const seed = criarSeed();
      this.gravar(seed);
      return seed;
    }
    try {
      const dados = JSON.parse(bruto) as Dados;
      if (dados.versaoSeed === SEED_VERSAO) return dados;
    } catch {
      /* JSON inválido: tratado como incompatível abaixo */
    }
    throw new ErroArmazenamentoLegado('Os dados locais são incompatíveis com esta versão; confirme a substituição para continuar.');
  }

  private gravar(dados: Dados): void {
    this.storage.setItem(CHAVE_DADOS, JSON.stringify(dados));
  }

  private async alterar<T>(fn: (dados: Dados) => T): Promise<T> {
    const dados = this.ler();
    const resultado = fn(dados);
    this.gravar(dados);
    return resultado;
  }

  /** Retrato completo e independente dos dados (as telas derivam o que precisam). */
  async obterDados(): Promise<Dados> {
    return structuredClone(this.ler());
  }

  async restaurarDemonstracao(): Promise<void> {
    this.gravar(criarSeed());
    this.storage.removeItem(CHAVE_SESSAO);
  }

  // ---- sessão simulada ------------------------------------------------

  async obterSessao(): Promise<Usuario | null> {
    const id = this.storage.getItem(CHAVE_SESSAO);
    if (!id) return null;
    const usuario = this.ler().usuarios.find((u) => u.id === id);
    return usuario && usuario.ativo ? structuredClone(usuario) : null;
  }

  async entrar(usuarioId: string): Promise<Usuario> {
    const usuario = this.ler().usuarios.find((u) => u.id === usuarioId);
    if (!usuario || !usuario.ativo) throw new Error('Usuário inexistente ou inativo.');
    this.storage.setItem(CHAVE_SESSAO, usuarioId);
    return structuredClone(usuario);
  }

  async sair(): Promise<void> {
    this.storage.removeItem(CHAVE_SESSAO);
  }

  // ---- data virtual ---------------------------------------------------

  async obterDataVirtual(): Promise<string> {
    return this.ler().dataVirtual;
  }

  async simularProximoDia(): Promise<string> {
    return this.alterar((d) => (d.dataVirtual = somarDias(d.dataVirtual, 1)));
  }

  // ---- usuários e vínculos -------------------------------------------

  async salvarUsuario(usuario: Omit<Usuario, 'id'> & { id?: string }): Promise<Usuario> {
    return this.alterar((d) => {
      const salvo: Usuario = { ...usuario, id: usuario.id ?? novoId('u') };
      const i = d.usuarios.findIndex((u) => u.id === salvo.id);
      if (i >= 0) d.usuarios[i] = salvo;
      else d.usuarios.push(salvo);
      return salvo;
    });
  }

  async definirAtivo(usuarioId: string, ativo: boolean): Promise<void> {
    await this.alterar((d) => {
      const u = d.usuarios.find((x) => x.id === usuarioId);
      if (u) u.ativo = ativo;
    });
  }

  async definirVinculoResponsavel(responsavelId: string, alunoId: string, vinculado: boolean): Promise<void> {
    await this.alterar((d) => {
      d.vinculosResponsavel = d.vinculosResponsavel.filter(
        (v) => !(v.responsavelId === responsavelId && v.alunoId === alunoId),
      );
      if (vinculado) d.vinculosResponsavel.push({ responsavelId, alunoId });
    });
  }

  async definirVinculoProfessor(professorId: string, cursoId: string, vinculado: boolean): Promise<void> {
    await this.alterar((d) => {
      d.vinculosProfessor = d.vinculosProfessor.filter((v) => !(v.professorId === professorId && v.cursoId === cursoId));
      if (vinculado) d.vinculosProfessor.push({ professorId, cursoId });
    });
  }

  // ---- cursos e questões ---------------------------------------------

  /** Cria (status rascunho, vinculado ao professor criador) ou atualiza um curso. */
  async salvarCurso(curso: Omit<Curso, 'id' | 'status'> & { id?: string }, criadorId?: string): Promise<Curso> {
    return this.alterar((d) => {
      const existente = curso.id ? d.cursos.find((c) => c.id === curso.id) : undefined;
      const salvo: Curso = { ...curso, id: existente?.id ?? novoId('c'), status: existente?.status ?? 'rascunho' };
      if (existente) d.cursos[d.cursos.indexOf(existente)] = salvo;
      else {
        d.cursos.push(salvo);
        const criador = d.usuarios.find((u) => u.id === criadorId);
        if (criador?.perfil === 'professor') d.vinculosProfessor.push({ professorId: criador.id, cursoId: salvo.id });
      }
      // questões de tópicos removidos deixam de existir
      const topicos = new Set(salvo.topicos.map((t) => t.id));
      d.questoes = d.questoes.filter((q) => q.cursoId !== salvo.id || topicos.has(q.topicoId));
      return salvo;
    });
  }

  async publicarCurso(cursoId: string): Promise<VerificacaoPublicacao> {
    return this.alterar((d) => {
      const curso = d.cursos.find((c) => c.id === cursoId);
      if (!curso) throw new Error('Curso não encontrado.');
      const verificacao = verificarPublicacao(curso, d.questoes);
      if (verificacao.ok) curso.status = 'publicado';
      return verificacao;
    });
  }

  async salvarQuestao(questao: Omit<Questao, 'id'> & { id?: string }): Promise<Questao> {
    return this.alterar((d) => {
      const salva: Questao = { ...questao, id: questao.id ?? novoId('q') };
      const i = d.questoes.findIndex((q) => q.id === salva.id);
      if (i >= 0) d.questoes[i] = salva;
      else d.questoes.push(salva);
      return salva;
    });
  }

  async removerQuestao(questaoId: string): Promise<void> {
    await this.alterar((d) => {
      d.questoes = d.questoes.filter((q) => q.id !== questaoId);
    });
  }

  // ---- matrícula e respostas -----------------------------------------

  /** Matricula o aluno; se já estiver matriculado, devolve a matrícula existente. */
  async matricular(alunoId: string, cursoId: string): Promise<Matricula> {
    return this.alterar((d) => {
      const existente = d.matriculas.find((m) => m.alunoId === alunoId && m.cursoId === cursoId);
      if (existente) return existente;
      const curso = d.cursos.find((c) => c.id === cursoId);
      if (!curso || curso.status !== 'publicado') throw new Error('Só é possível matricular em cursos publicados.');
      const matricula: Matricula = { id: novoId('mt'), alunoId, cursoId, data: d.dataVirtual };
      d.matriculas.push(matricula);
      return matricula;
    });
  }

  async registrarResposta(nova: NovaResposta): Promise<Resposta> {
    return this.alterar((d) => {
      const q = d.questoes.find((x) => x.id === nova.questaoId);
      if (!q) throw new Error('Questão não encontrada.');
      if (!d.matriculas.some((m) => m.alunoId === nova.alunoId && m.cursoId === nova.cursoId)) {
        throw new Error('Aluno não matriculado no curso.');
      }
      const momento = d.respostas.reduce((max, r) => Math.max(max, r.momento), 0) + 1;
      const resposta: Resposta = {
        ...nova,
        id: novoId('r'),
        topicoId: q.topicoId,
        dificuldade: q.dificuldade,
        acertou: nova.alternativa === q.correta,
        data: d.dataVirtual,
        momento,
      };
      d.respostas.push(resposta);
      return resposta;
    });
  }
}
