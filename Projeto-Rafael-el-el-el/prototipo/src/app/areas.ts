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

/** A seção pertence ao caminho atual, não a uma preferência persistida ou permissão nova. */
export function localizacaoDaPagina(caminho: string, area: Funcao) {
  const raiz = AREA_DA_FUNCAO[area];
  if (area === 'aluno') {
    if (caminho.startsWith('/aluno/catalogo')) return { principal: '/aluno/catalogo', titulo: caminho === '/aluno/catalogo' ? 'Catálogo' : 'Detalhe da disciplina' };
    return { principal: raiz, titulo: caminho.endsWith('/sessao') ? 'Sessão de estudo'
      : caminho.includes('/topicos/') ? 'Materiais' : caminho.endsWith('/desempenho') ? 'Desempenho' : caminho === raiz ? 'Minhas turmas' : 'Trilha' };
  }
  if (area === 'professor') return { principal: raiz, titulo: caminho.endsWith('/conteudo') ? 'Conteúdo da disciplina'
    : caminho.includes('/alunos/') ? 'Detalhe do aluno' : caminho.includes('/turmas/') ? 'Painel da turma' : 'Minhas turmas' };
  if (area === 'coordenador') return { principal: caminho.startsWith('/coordenacao/gestao') ? '/coordenacao/gestao' : caminho.startsWith('/coordenacao/cadastros') ? '/coordenacao/cadastros' : raiz,
    titulo: caminho.includes('/turmas/') ? 'Gestão da turma' : caminho.includes('/gestao') ? 'Gestão acadêmica' : caminho.includes('/cadastros') ? 'Cadastros' : 'Painel da coordenação' };
  if (area === 'admin') {
    const secoes: Record<string, string> = { usuarios: 'Pessoas', vinculos: 'Vínculos', graduacoes: 'Graduações e disciplinas', periodos: 'Períodos e turmas', gestao: 'Matrículas e docentes' };
    const secao = caminho.split('/')[2];
    return { principal: secao === 'disciplinas' ? '/admin/graduacoes' : secoes[secao] ? `/admin/${secao}` : raiz,
      titulo: caminho.endsWith('/conteudo') ? 'Conteúdo da disciplina' : caminho.includes('/turmas/') ? 'Gestão da turma' : secoes[secao] ?? 'Visão geral' };
  }
  return { principal: raiz, titulo: 'Painel do responsável' };
}
