import type { ContextoTurma } from '../../dados/contratos-consultas-academicas';

export function selecaoDaOferta(oferta: ContextoTurma): URLSearchParams {
  return new URLSearchParams({
    graduacao: oferta.graduacao.id,
    disciplina: oferta.disciplina.id,
    periodo: oferta.periodoLetivo.id,
    turma: oferta.turma.id,
  });
}
