/**
 * Motor adaptativo — funções puras, sem React (design D4).
 *
 * O estado da trilha é sempre derivado das respostas de um único par
 * aluno + curso. Por isso respostas de um curso nunca alteram outro curso.
 */
import type { Curso, Dificuldade, Questao, Resposta } from '../dominio/tipos';
import { CONFIG } from './config';

export interface EstadoTopico {
  topicoId: string;
  titulo: string;
  dominio: number;
  desbloqueado: boolean;
  dominado: boolean;
}

export interface EstadoTrilha {
  cursoId: string;
  topicos: EstadoTopico[];
  /** Porcentagem (0–100) de tópicos dominados. */
  progresso: number;
  concluido: boolean;
}

export function limitarDominio(valor: number): number {
  return Math.min(CONFIG.dominioMaximo, Math.max(CONFIG.dominioMinimo, valor));
}

export function variacaoDominio(dificuldade: Dificuldade, acertou: boolean): number {
  return acertou ? CONFIG.variacao.acerto[dificuldade] : CONFIG.variacao.erro[dificuldade];
}

export function atualizarDominio(dominio: number, dificuldade: Dificuldade, acertou: boolean): number {
  return limitarDominio(dominio + variacaoDominio(dificuldade, acertou));
}

export function faixaDificuldade(dominio: number): Dificuldade {
  if (dominio < CONFIG.faixas.facilAte) return 'facil';
  if (dominio < CONFIG.faixas.medioAte) return 'medio';
  return 'dificil';
}

export function ordenarRespostas(respostas: Resposta[]): Resposta[] {
  return [...respostas].sort((a, b) => a.momento - b.momento);
}

/**
 * Desbloqueio: o 1º tópico está sempre desbloqueado; cada tópico seguinte é
 * desbloqueado quando o anterior (desbloqueado) foi dominado.
 */
export function aplicarDesbloqueios(curso: { readonly topicos: readonly { readonly id: string }[] }, dominados: ReadonlySet<string>): Set<string> {
  const desbloqueados = new Set<string>();
  curso.topicos.forEach((t, i) => {
    if (i === 0) {
      desbloqueados.add(t.id);
      return;
    }
    const anterior = curso.topicos[i - 1];
    if (desbloqueados.has(anterior.id) && dominados.has(anterior.id)) desbloqueados.add(t.id);
  });
  return desbloqueados;
}

/** Reconstrói o estado da trilha do par aluno + curso a partir das respostas. */
export function calcularEstado(curso: Curso, respostas: Resposta[]): EstadoTrilha {
  const dominios = new Map<string, number>(curso.topicos.map((t) => [t.id, CONFIG.dominioMinimo]));
  const dominados = new Set<string>();

  for (const r of ordenarRespostas(respostas)) {
    if (r.cursoId !== curso.id || !dominios.has(r.topicoId)) continue;
    const novo = atualizarDominio(dominios.get(r.topicoId)!, r.dificuldade, r.acertou);
    dominios.set(r.topicoId, novo);
    if (novo >= CONFIG.limiarDominado) dominados.add(r.topicoId);
  }

  const desbloqueados = aplicarDesbloqueios(curso, dominados);
  const topicos = curso.topicos.map((t) => ({
    topicoId: t.id,
    titulo: t.titulo,
    dominio: dominios.get(t.id)!,
    desbloqueado: desbloqueados.has(t.id),
    dominado: dominados.has(t.id),
  }));
  return { cursoId: curso.id, topicos, ...progressoCurso(topicos) };
}

export function progressoCurso(topicos: EstadoTopico[]): { progresso: number; concluido: boolean } {
  const total = topicos.length;
  const dominados = topicos.filter((t) => t.dominado).length;
  return {
    progresso: total === 0 ? 0 : Math.round((dominados / total) * 100),
    concluido: total > 0 && dominados === total,
  };
}

export interface ProximaAtividade {
  questao: Questao;
  topicoId: string;
  dificuldade: Dificuldade;
}

/**
 * Escolhe a próxima questão: tópico desbloqueado e não dominado de menor
 * domínio; dificuldade pela faixa do domínio; prefere questões inéditas e
 * evita repetir a última respondida. Sem inédita, reutiliza a menos recente.
 */
export function proximaQuestao(
  estado: EstadoTrilha,
  questoes: Questao[],
  respostas: Resposta[],
): ProximaAtividade | null {
  const candidatos = estado.topicos
    .map((t, ordem) => ({ ...t, ordem }))
    .filter((t) => t.desbloqueado && !t.dominado)
    .sort((a, b) => a.dominio - b.dominio || a.ordem - b.ordem);

  const doCurso = ordenarRespostas(respostas.filter((r) => r.cursoId === estado.cursoId));
  const ultima = doCurso.length > 0 ? doCurso[doCurso.length - 1].questaoId : undefined;
  const ultimoUso = new Map<string, number>();
  for (const r of doCurso) ultimoUso.set(r.questaoId, r.momento);

  for (const topico of candidatos) {
    const dificuldade = faixaDificuldade(topico.dominio);
    const doTopico = questoes.filter((q) => q.cursoId === estado.cursoId && q.topicoId === topico.topicoId);
    let pool = doTopico.filter((q) => q.dificuldade === dificuldade);
    if (pool.length === 0) pool = doTopico;
    if (pool.length === 0) continue;

    const semUltima = pool.length > 1 ? pool.filter((q) => q.id !== ultima) : pool;
    const inedita = semUltima.find((q) => !ultimoUso.has(q.id));
    const questao =
      inedita ?? [...semUltima].sort((a, b) => (ultimoUso.get(a.id) ?? 0) - (ultimoUso.get(b.id) ?? 0))[0];
    return { questao, topicoId: topico.topicoId, dificuldade: questao.dificuldade };
  }
  return null;
}

/** Número de erros consecutivos mais recentes do aluno no tópico. */
export function errosSeguidosNoTopico(respostas: Resposta[], topicoId: string): number {
  const doTopico = ordenarRespostas(respostas.filter((r) => r.topicoId === topicoId));
  let erros = 0;
  for (let i = doTopico.length - 1; i >= 0 && !doTopico[i].acertou; i--) erros++;
  return erros;
}

export function deveSugerirRevisao(respostas: Resposta[], topicoId: string): boolean {
  return errosSeguidosNoTopico(respostas, topicoId) >= CONFIG.errosParaRevisao;
}
