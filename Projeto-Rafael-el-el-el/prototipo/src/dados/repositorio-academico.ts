import {
  pessoaAtiva, podeExecutar, type LeituraProfunda, type PedidoAutorizacao,
} from '../dominio/autorizacao';
import { VERSAO_SCHEMA_ACADEMICO, type DadosAcademicos, type Usuario } from '../dominio/tipos';
import type { ErrosAcademicos } from '../dominio/academico';

/** Adaptador interno: uma gravação deve substituir integralmente o documento ou falhar sem efeitos. */
export interface PersistenciaAcademica {
  ler(): string | null;
  gravar(documento: string): void;
}

/** A sessão guarda somente a identidade escolhida, nunca funções fornecidas pelo formulário. */
export interface SessaoAcademica {
  obterUsuarioId(): string | null;
  definirUsuarioId(usuarioId: string | null): void;
}

export type CodigoErroRepositorio =
  | 'DADOS_NAO_INICIALIZADOS' | 'DADOS_INCOMPATIVEIS' | 'SEM_SESSAO'
  | 'SESSAO_INVALIDA' | 'ACESSO_NEGADO' | 'OPERACAO_ASSINCRONA'
  | 'REVISAO_OBSOLETA' | 'VALIDACAO_REJEITADA' | 'FALHA_PERSISTENCIA' | 'ALTERACAO_REENTRANTE';

export class ErroRepositorioAcademico extends Error {
  constructor(
    readonly codigo: CodigoErroRepositorio, mensagem: string,
    readonly detalhes?: Readonly<ErrosAcademicos>,
  ) {
    super(mensagem);
    this.name = 'ErroRepositorioAcademico';
  }
}

/** Obrigatório em cada comando futuro; recebe o documento final inteiro, não apenas o payload. */
export type ValidadorCandidato = (
  candidato: LeituraProfunda<DadosAcademicos>, anterior: LeituraProfunda<DadosAcademicos>,
) => ErrosAcademicos;

export function exigirSincrono(valor: unknown): void {
  if (valor !== null && (typeof valor === 'object' || typeof valor === 'function')
    && typeof (valor as { then?: unknown }).then === 'function') {
    throw new ErroRepositorioAcademico('OPERACAO_ASSINCRONA', 'A operação interna deve ser síncrona.');
  }
}

export function congelarLeitura<T>(valor: T): LeituraProfunda<T> {
  if (valor !== null && typeof valor === 'object') {
    for (const item of Object.values(valor)) congelarLeitura(item);
    Object.freeze(valor);
  }
  return valor as LeituraProfunda<T>;
}

const COLECOES: (keyof DadosAcademicos)[] = [
  'usuarios', 'graduacoes', 'disciplinas', 'periodosLetivos', 'turmas', 'matriculas',
  'questoes', 'respostas', 'vinculosProfessor', 'vinculosCoordenador', 'vinculosResponsavel', 'revisoesTextuais',
];

/** Esquema e formato mínimos do documento acadêmico; usado também pela inspeção do armazenamento. */
export function ehDocumentoAcademicoCompativel(valor: unknown): valor is DadosAcademicos {
  const dados = valor as DadosAcademicos | null;
  return !!dados && typeof dados === 'object' && dados.versaoSchema === VERSAO_SCHEMA_ACADEMICO
    && Number.isSafeInteger(dados.revisao) && dados.revisao >= 0
    && COLECOES.every((campo) => Array.isArray(dados[campo]));
}

/** Base interna, sem comandos de cadastro ou consultas de negócio (tarefas 2.5+).
 * Não usa window/localStorage, chaves padrão, inicialização automática ou seed.
 * Callbacks protegidos são código do repositório, nunca entradas da interface.
 */
export abstract class RepositorioAcademico {
  private alteracaoEmAndamento = false;

  constructor(
    private readonly persistencia: PersistenciaAcademica,
    private readonly sessao: SessaoAcademica,
  ) {}

  private lerDocumento(): DadosAcademicos {
    const bruto = this.persistencia.ler();
    if (bruto === null) {
      throw new ErroRepositorioAcademico('DADOS_NAO_INICIALIZADOS', 'O documento acadêmico não foi inicializado.');
    }
    try {
      const dados = JSON.parse(bruto) as DadosAcademicos;
      if (!ehDocumentoAcademicoCompativel(dados)) throw new Error('Formato incompatível');
      return dados;
    } catch {
      throw new ErroRepositorioAcademico('DADOS_INCOMPATIVEIS', 'Documento incompatível; nenhuma reposição automática foi realizada.');
    }
  }

  async entrar(usuarioId: string): Promise<Usuario> {
    const usuario = pessoaAtiva(this.lerDocumento(), usuarioId);
    if (!usuario) throw new ErroRepositorioAcademico('SESSAO_INVALIDA', 'Pessoa inexistente, inativa ou sem funções válidas.');
    this.sessao.definirUsuarioId(usuarioId);
    return structuredClone(usuario) as Usuario;
  }

  /** Entrada simulada: pessoas ativas e válidas, só com identificação e funções (sem e-mail ou vínculos). */
  async listarPessoasEntrada(): Promise<{ id: string; nome: string; funcoes: Usuario['funcoes'] }[]> {
    const dados = this.lerDocumento();
    return dados.usuarios.filter((u) => pessoaAtiva(dados, u.id))
      .map((u) => ({ id: u.id, nome: u.nome, funcoes: [...u.funcoes] }));
  }

  async sair(): Promise<void> {
    this.sessao.definirUsuarioId(null);
  }

  async obterSessao(): Promise<LeituraProfunda<Usuario> | null> {
    const id = this.sessao.obterUsuarioId();
    if (id === null) return null;
    return structuredClone(pessoaAtiva(this.lerDocumento(), id) ?? null);
  }

  /** Deve ser a entrada de toda consulta/comando concreto futuro, sem autor no payload. */
  protected contextoAutorizado(pedidos: PedidoAutorizacao | readonly PedidoAutorizacao[]) {
    const dados = this.lerDocumento();
    const id = this.sessao.obterUsuarioId();
    if (id === null) throw new ErroRepositorioAcademico('SEM_SESSAO', 'Escolha uma pessoa de demonstração.');
    const autor = pessoaAtiva(dados, id);
    if (!autor) throw new ErroRepositorioAcademico('SESSAO_INVALIDA', 'A pessoa da sessão não está ativa ou válida.');
    const lista: readonly PedidoAutorizacao[] = Array.isArray(pedidos) ? pedidos : [pedidos as PedidoAutorizacao];
    if (lista.length === 0 || !lista.every((pedido) => podeExecutar(dados, id, pedido))) {
      throw new ErroRepositorioAcademico('ACESSO_NEGADO', 'Recurso fora do escopo, inexistente ou com referências incompatíveis.');
    }
    return { dados, autor };
  }

  protected async consultar<T>(
    pedidos: PedidoAutorizacao | readonly PedidoAutorizacao[],
    selecionar: (dados: LeituraProfunda<DadosAcademicos>, autor: LeituraProfunda<Usuario>) => T,
  ): Promise<T> {
    const { dados, autor } = this.contextoAutorizado(pedidos);
    const resultado = selecionar(congelarLeitura(dados), congelarLeitura(autor));
    exigirSincrono(resultado);
    return structuredClone(resultado);
  }

  /** Primitiva interna: nenhuma função de negócio ou validação de publicação é presumida aqui.
   * O futuro comando fornece transformação, permissões de todos os recursos e validação integral.
   * Não há await entre leitura, autorização, validação e gravação.
   */
  protected async alterar<T>(
    pedidos: PedidoAutorizacao | readonly PedidoAutorizacao[],
    revisaoOriginal: number,
    preparar: (candidato: DadosAcademicos, autor: LeituraProfunda<Usuario>) => T,
    validar: ValidadorCandidato,
  ): Promise<T> {
    if (this.alteracaoEmAndamento) {
      throw new ErroRepositorioAcademico('ALTERACAO_REENTRANTE', 'Uma alteração já está em andamento nesta instância.');
    }
    this.alteracaoEmAndamento = true;
    try {
      const { dados: anterior, autor } = this.contextoAutorizado(pedidos);
      if (!Number.isSafeInteger(revisaoOriginal) || revisaoOriginal !== anterior.revisao) {
        throw new ErroRepositorioAcademico('REVISAO_OBSOLETA', 'Recarregue os dados antes de salvar.');
      }
      if (typeof validar !== 'function') {
        throw new ErroRepositorioAcademico('VALIDACAO_REJEITADA', 'O comando exige validação integral do candidato.');
      }
      const candidato = structuredClone(anterior);
      const resultado = preparar(candidato, congelarLeitura(autor));
      exigirSincrono(resultado);
      if (candidato.revisao !== anterior.revisao || candidato.versaoSchema !== anterior.versaoSchema
        || candidato.versaoSeed !== anterior.versaoSeed || !Number.isSafeInteger(anterior.revisao + 1)) {
        throw new ErroRepositorioAcademico('VALIDACAO_REJEITADA', 'Metadados de esquema, seed e revisão não são editáveis pelo comando.');
      }
      // Destacar as referências retidas pela transformação: só esta cópia será validada e gravada.
      const final = structuredClone(candidato);
      const mudou = JSON.stringify(final) !== JSON.stringify(anterior);
      final.revisao = anterior.revisao + (mudou ? 1 : 0);
      const retorno = structuredClone(resultado);
      const erros = validar(congelarLeitura(final), congelarLeitura(anterior));
      exigirSincrono(erros);
      if (!erros || typeof erros !== 'object' || Array.isArray(erros)
        || Object.values(erros).some((mensagem) => typeof mensagem !== 'string')) {
        throw new ErroRepositorioAcademico('VALIDACAO_REJEITADA', 'O validador não devolveu um resultado válido.');
      }
      if (Object.keys(erros).length > 0) {
        throw new ErroRepositorioAcademico('VALIDACAO_REJEITADA', 'A alteração foi rejeitada integralmente.', congelarLeitura(structuredClone(erros)));
      }
      const serializado = JSON.stringify(final);
      // Revalidar também se algum callback interno mudou sessão, funções, vínculos ou documento.
      const atual = this.contextoAutorizado(pedidos);
      if (atual.autor.id !== autor.id) {
        throw new ErroRepositorioAcademico('SESSAO_INVALIDA', 'A pessoa da sessão mudou durante a operação.');
      }
      if (JSON.stringify(atual.dados) !== JSON.stringify(anterior)) {
        throw new ErroRepositorioAcademico('REVISAO_OBSOLETA', 'Os dados mudaram durante a operação.');
      }
      // Repetição idempotente continua exigindo sessão/revisão/validação, mas não grava nem avança revisão.
      if (!mudou) return retorno;
      try {
        this.persistencia.gravar(serializado);
      } catch {
        throw new ErroRepositorioAcademico('FALHA_PERSISTENCIA', 'Não foi possível gravar a alteração.');
      }
      return retorno;
    } finally {
      this.alteracaoEmAndamento = false;
    }
  }
}
