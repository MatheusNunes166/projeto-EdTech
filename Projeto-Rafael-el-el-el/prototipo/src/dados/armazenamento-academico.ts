/**
 * Armazenamento local do documento acadêmico (design D8): inspeção SEM efeitos, inicialização e
 * substituição/restauração somente após confirmação. Nunca reinterpreta os dados legados.
 */
import { RepositorioApp } from './repositorio-app';
import {
  ehDocumentoAcademicoCompativel, type PersistenciaAcademica, type SessaoAcademica,
} from './repositorio-academico';
import { VERSAO_SCHEMA_ACADEMICO } from '../dominio/tipos';
import { criarSeedAcademico } from './seed-academico';

/** Chaves do namespace acadêmico (novas) e do legado (preservado como cópia técnica de recuperação). */
export const CHAVES_ARMAZENAMENTO = {
  academico: 'trilha-adaptativa:academico:dados',
  sessaoAcademica: 'trilha-adaptativa:academico:sessao',
  legadoDados: 'trilha-adaptativa:dados',
  legadoSessao: 'trilha-adaptativa:sessao',
} as const;

export type ArmazenamentoLeitura = Pick<Storage, 'getItem'>;
export type ArmazenamentoEscrita = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type MotivoIncompatibilidade = 'json-invalido' | 'versao-schema' | 'formato';
export type EstadoArmazenamento =
  | { situacao: 'ausente' }
  | { situacao: 'compativel' }
  | { situacao: 'legado' }
  | { situacao: 'incompativel'; motivo: MotivoIncompatibilidade };

/**
 * Classifica o que existe no navegador usando somente `getItem`: não grava, remove, converte nem repõe.
 * O documento acadêmico tem precedência; sem ele, a presença do namespace legado é 'legado'.
 */
export function inspecionarArmazenamento(storage: ArmazenamentoLeitura): EstadoArmazenamento {
  const bruto = storage.getItem(CHAVES_ARMAZENAMENTO.academico);
  if (bruto === null) {
    return storage.getItem(CHAVES_ARMAZENAMENTO.legadoDados) !== null ? { situacao: 'legado' } : { situacao: 'ausente' };
  }
  let valor: unknown;
  try { valor = JSON.parse(bruto); } catch { return { situacao: 'incompativel', motivo: 'json-invalido' }; }
  if (!valor || typeof valor !== 'object' || (valor as { versaoSchema?: unknown }).versaoSchema !== VERSAO_SCHEMA_ACADEMICO) {
    return { situacao: 'incompativel', motivo: 'versao-schema' };
  }
  return ehDocumentoAcademicoCompativel(valor) ? { situacao: 'compativel' } : { situacao: 'incompativel', motivo: 'formato' };
}

export class ErroArmazenamentoAcademico extends Error {
  constructor(readonly codigo: 'JA_EXISTENTE' | 'ESTADO_INVALIDO' | 'FALHA_GRAVACAO', mensagem: string) {
    super(mensagem);
    this.name = 'ErroArmazenamentoAcademico';
  }
}

export type ResultadoSubstituicao = { status: 'cancelado' } | { status: 'concluido' };

/** Sem dados anteriores: inicializa a demonstração nova. Com qualquer dado existente, recusa. */
export function inicializarDemonstracao(storage: ArmazenamentoEscrita): void {
  if (inspecionarArmazenamento(storage).situacao !== 'ausente') {
    throw new ErroArmazenamentoAcademico('JA_EXISTENTE', 'Há dados locais: use a substituição informada.');
  }
  gravarSeed(storage);
}

/**
 * Substitui dados legados ou incompatíveis pela demonstração nova. Só age com confirmação explícita
 * (`true`); o cancelamento não lê nem escreve nada. Os dados legados são preservados.
 */
export function substituirDadosPorDemonstracao(storage: ArmazenamentoEscrita, confirmado: boolean): ResultadoSubstituicao {
  if (confirmado !== true) return { status: 'cancelado' };
  const { situacao } = inspecionarArmazenamento(storage);
  if (situacao !== 'legado' && situacao !== 'incompativel') {
    throw new ErroArmazenamentoAcademico('ESTADO_INVALIDO', 'Não há dados legados ou incompatíveis a substituir.');
  }
  gravarSeed(storage);
  return { status: 'concluido' };
}

/** Restaura a demonstração inicial após confirmação; descarta alterações locais e encerra a sessão. */
export function restaurarDemonstracao(storage: ArmazenamentoEscrita, confirmado: boolean): ResultadoSubstituicao {
  if (confirmado !== true) return { status: 'cancelado' };
  gravarSeed(storage);
  return { status: 'concluido' };
}

/** Uma única gravação do documento; a sessão antiga só é encerrada depois de a gravação ter sucesso. */
function gravarSeed(storage: ArmazenamentoEscrita): void {
  const serializado = JSON.stringify(criarSeedAcademico());
  try {
    storage.setItem(CHAVES_ARMAZENAMENTO.academico, serializado);
  } catch {
    throw new ErroArmazenamentoAcademico('FALHA_GRAVACAO', 'Não foi possível gravar a demonstração; nada foi alterado.');
  }
  storage.removeItem(CHAVES_ARMAZENAMENTO.sessaoAcademica);
  storage.removeItem(CHAVES_ARMAZENAMENTO.legadoSessao);
}

export function criarPersistenciaLocal(storage: ArmazenamentoEscrita): PersistenciaAcademica {
  return {
    ler: () => storage.getItem(CHAVES_ARMAZENAMENTO.academico),
    gravar: (documento) => storage.setItem(CHAVES_ARMAZENAMENTO.academico, documento),
  };
}

export function criarSessaoLocal(storage: ArmazenamentoEscrita): SessaoAcademica {
  return {
    obterUsuarioId: () => storage.getItem(CHAVES_ARMAZENAMENTO.sessaoAcademica),
    definirUsuarioId: (id) => {
      if (id === null) storage.removeItem(CHAVES_ARMAZENAMENTO.sessaoAcademica);
      else storage.setItem(CHAVES_ARMAZENAMENTO.sessaoAcademica, id);
    },
  };
}

/** Repositório acadêmico sobre o armazenamento local, sem inicializar nem inspecionar por conta própria. */
export function criarRepositorioLocal(storage: ArmazenamentoEscrita): RepositorioApp {
  return new RepositorioApp(criarPersistenciaLocal(storage), criarSessaoLocal(storage));
}
