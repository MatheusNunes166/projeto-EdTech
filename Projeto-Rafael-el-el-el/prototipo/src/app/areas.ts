import { FUNCOES, NOME_FUNCAO, type Funcao } from '../dominio/tipos';

export const AREA_DA_FUNCAO: Record<Funcao, string> = {
  aluno: '/aluno', professor: '/professor', coordenador: '/coordenacao', admin: '/admin', responsavel: '/responsavel',
};

export const ROTULO_AREA: Record<Funcao, string> = {
  aluno: 'Área do Aluno', professor: 'Área do Professor', coordenador: 'Área da Coordenação',
  admin: 'Área do Administrador', responsavel: 'Área do Responsável',
};

/** Primeira área das funções da pessoa, na ordem canônica; cada função dá acesso à sua própria área. */
export function areaInicial(funcoes: readonly Funcao[]): string {
  const funcao = FUNCOES.find((f) => funcoes.includes(f));
  return funcao ? AREA_DA_FUNCAO[funcao] : '/';
}

export const nomesDasFuncoes = (funcoes: readonly Funcao[]) => funcoes.map((f) => NOME_FUNCAO[f]).join(', ');
