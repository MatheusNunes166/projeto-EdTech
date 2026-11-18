import type { ErrosAcademicos } from '../dominio/academico';
import type { LeituraProfunda } from '../dominio/autorizacao';
import {
  DIFICULDADES, type DadosAcademicos, type RevisaoTextual, type Topico,
} from '../dominio/tipos';
import { validarQuestao } from '../conteudo/regras';
import {
  alternativasReordenadas, diferencaTextualQuestao, diferencaTextualTopico, disciplinaTemResposta,
  errosDeCobertura, questaoRespondida, recursoTopico, topicoRespondido, verificarPublicacaoDisciplina,
  type DiferencaTextual,
} from '../conteudo/regras-disciplina';
import type { ValidadorCandidato } from './repositorio-academico';

type Documento = LeituraProfunda<DadosAcademicos>;
export type ModoConteudo = 'conteudo' | 'materiais' | 'publicacao';

const json = (v: unknown) => JSON.stringify(v);
const TIPOS_MATERIAL = ['texto', 'video', 'arquivo'];

interface Exigida { recursoId: string; revisaoOriginal: number; diferenca: DiferencaTextual[] }

/**
 * Valida o estado FINAL da edição de uma disciplina. Só a disciplina-alvo, seu banco de questões e as
 * confirmações novas podem mudar; dados dos alunos e demais cadastros permanecem idênticos.
 * Bloqueios de estudo, proteção de questões, confirmação textual e cobertura são cumulativos.
 */
export function validadorDeConteudo(
  disciplinaId: string, modo: ModoConteudo, autorId: () => string | undefined,
): ValidadorCandidato {
  return (final: Documento, anterior: Documento): ErrosAcademicos => {
    const erros: ErrosAcademicos = {};
    const livres = ['disciplinas', 'questoes', 'revisoesTextuais', 'revisao'];
    for (const campo of Object.keys(anterior) as (keyof DadosAcademicos)[]) {
      if (!livres.includes(campo) && json(final[campo]) !== json(anterior[campo])) erros[campo] = 'A edição de conteúdo não altera estes dados.';
    }
    const d = final.disciplinas.find((x) => x.id === disciplinaId);
    const antes = anterior.disciplinas.find((x) => x.id === disciplinaId);
    if (!d || !antes) { erros.disciplinaId = 'Referência inexistente.'; return erros; }

    if (json(final.disciplinas.filter((x) => x.id !== disciplinaId)) !== json(anterior.disciplinas.filter((x) => x.id !== disciplinaId))
      || final.disciplinas.length !== anterior.disciplinas.length) erros.disciplinas = 'Outras disciplinas não podem ser alteradas.';
    const { topicos: _t, status: _s, ...cadastroFinal } = d; const { topicos: _t2, status: _s2, ...cadastroAntes } = antes;
    if (json(cadastroFinal) !== json(cadastroAntes)) erros.cadastro = 'O cadastro acadêmico não é alterado pelo conteúdo.';
    if (modo === 'publicacao' ? antes.status === 'publicado' && d.status !== 'publicado' : d.status !== antes.status) {
      erros.status = 'A publicação só é alterada pelo comando de publicação.';
    }

    const questoes = final.questoes.filter((q) => q.disciplinaId === disciplinaId);
    const questoesAntes = anterior.questoes.filter((q) => q.disciplinaId === disciplinaId);
    if (json(final.questoes.filter((q) => q.disciplinaId !== disciplinaId)) !== json(anterior.questoes.filter((q) => q.disciplinaId !== disciplinaId))) {
      erros.questoes = 'Questões de outras disciplinas não podem ser alteradas.';
    }
    const novasRevisoes = final.revisoesTextuais.slice(anterior.revisoesTextuais.length);
    if (json(final.revisoesTextuais.slice(0, anterior.revisoesTextuais.length)) !== json(anterior.revisoesTextuais)) {
      erros.revisoesTextuais = 'Confirmações anteriores não podem ser alteradas.';
    }

    if (modo !== 'conteudo') {
      const ids = (ts: readonly Topico[] | readonly { id: string; titulo: string }[]) => json(ts.map((t) => [t.id, t.titulo]));
      if (ids(d.topicos) !== ids(antes.topicos)) erros.topicos = 'Esta operação não altera tópicos.';
      if (json(questoes) !== json(questoesAntes)) erros.questoes = 'Esta operação não altera questões.';
      if (novasRevisoes.length > 0) erros.revisoesTextuais = 'Esta operação não aceita confirmações.';
      if (modo === 'publicacao' && json(d.topicos) !== json(antes.topicos)) erros.topicos = 'A publicação não altera tópicos ou materiais.';
    }

    validarTopicos(erros, d.topicos);
    if (modo === 'conteudo') {
      const estudoIniciado = disciplinaTemResposta(anterior, disciplinaId);
      if (estudoIniciado && json(d.topicos.map((t) => t.id)) !== json(antes.topicos.map((t) => t.id))) {
        erros.topicos = 'O estudo já foi iniciado nesta disciplina; não é possível adicionar, remover ou reordenar tópicos.';
      }
      const exigidas = validarQuestoes(erros, final, anterior, d, questoes, questoesAntes);
      for (const t of d.topicos) {
        const original = antes.topicos.find((x) => x.id === t.id);
        if (original && original.titulo !== t.titulo && topicoRespondido(anterior, disciplinaId, t.id)) {
          exigidas.push({ recursoId: recursoTopico(disciplinaId, t.id), revisaoOriginal: anterior.revisao,
            diferenca: diferencaTextualTopico(original.titulo, t.titulo) });
        }
      }
      conferirConfirmacoes(erros, exigidas, novasRevisoes, anterior, autorId());
    }

    if (d.status === 'publicado') {
      Object.assign(erros, errosDeCobertura(verificarPublicacaoDisciplina(d, questoes)));
    }
    return erros;
  };
}

function validarTopicos(erros: ErrosAcademicos, topicos: LeituraProfunda<Topico[]>) {
  const ids = new Set<string>(), materiais = new Set<string>();
  topicos.forEach((t, i) => {
    if (typeof t.id !== 'string' || !t.id.trim() || ids.has(t.id)) erros[`topicos.${i}.id`] = 'Identificador de tópico inválido ou duplicado.';
    ids.add(t.id);
    if (typeof t.titulo !== 'string' || !t.titulo.trim()) erros[`topicos.${i}.titulo`] = 'Informe o título do tópico.';
    t.materiais.forEach((m, j) => {
      const campo = `topicos.${i}.materiais.${j}`;
      if (typeof m.id !== 'string' || !m.id.trim() || materiais.has(m.id)) erros[`${campo}.id`] = 'Identificador de material inválido ou duplicado.';
      materiais.add(m.id);
      if (!TIPOS_MATERIAL.includes(m.tipo)) erros[`${campo}.tipo`] = 'Tipo de material inválido.';
      if (typeof m.titulo !== 'string' || !m.titulo.trim()) erros[`${campo}.titulo`] = 'Informe o título do material.';
      if (typeof m.conteudo !== 'string' || !m.conteudo.trim()) erros[`${campo}.conteudo`] = 'Informe o conteúdo ou o link do material.';
    });
  });
}

function validarQuestoes(
  erros: ErrosAcademicos, final: Documento, anterior: Documento, d: LeituraProfunda<{ id: string; topicos: Topico[] }>,
  questoes: Documento['questoes'], questoesAntes: Documento['questoes'],
): Exigida[] {
  const exigidas: Exigida[] = [];
  const todosIds = new Set<string>();
  for (const q of final.questoes) {
    if (typeof q.id !== 'string' || !q.id.trim() || todosIds.has(q.id)) erros[`${q.id}.id`] = 'Identificador de questão inválido ou duplicado.';
    todosIds.add(q.id);
  }
  for (const q of questoes) {
    const chave = q.id;
    for (const mensagem of validarQuestao({ enunciado: q.enunciado, alternativas: [...q.alternativas], correta: q.correta, explicacao: q.explicacao })) {
      erros[`${chave}.conteudo`] = mensagem;
    }
    if (q.alternativas.some((a) => typeof a !== 'string' || !a.trim())) erros[`${chave}.alternativas`] = 'Preencha todas as alternativas.';
    if (!DIFICULDADES.includes(q.dificuldade)) erros[`${chave}.dificuldade`] = 'Dificuldade inválida.';
    if (!d.topicos.some((t) => t.id === q.topicoId)) erros[`${chave}.topicoId`] = 'O tópico não pertence a esta disciplina.';
    const original = questoesAntes.find((x) => x.id === q.id);
    if (!original) { if (q.revisao !== 0) erros[`${chave}.revisao`] = 'Questão nova inicia na revisão 0.'; continue; }
    if (json(original) === json(q)) continue;
    const respondida = questaoRespondida(anterior, q.id);
    if (!respondida) continue;
    if (original.topicoId !== q.topicoId || original.dificuldade !== q.dificuldade || original.correta !== q.correta
      || original.disciplinaId !== q.disciplinaId) {
      erros[`${chave}.protegida`] = 'Questão com respostas não pode mudar tópico, dificuldade ou gabarito, nem com confirmação.';
    }
    if (original.alternativas.length !== q.alternativas.length) {
      erros[`${chave}.alternativas`] = 'Questão com respostas não pode alterar a quantidade de alternativas.';
    } else if (alternativasReordenadas(original.alternativas, q.alternativas)) {
      erros[`${chave}.alternativas`] = 'Reordenar alternativas não é correção textual; a correspondência com as respostas seria alterada.';
    }
    const diferenca = diferencaTextualQuestao(original, q);
    if (diferenca.length > 0) exigidas.push({ recursoId: q.id, revisaoOriginal: original.revisao, diferenca });
  }
  for (const original of questoesAntes) {
    if (!questoes.some((q) => q.id === original.id) && questaoRespondida(anterior, original.id)) {
      erros[`${original.id}.exclusao`] = 'Questão com respostas não pode ser excluída.';
    }
  }
  return exigidas;
}

/** A confirmação precisa corresponder a recurso, revisão original, autor, data e diferença exatos. */
function conferirConfirmacoes(
  erros: ErrosAcademicos, exigidas: Exigida[], novas: readonly LeituraProfunda<RevisaoTextual>[],
  anterior: Documento, autorId: string | undefined,
) {
  const usadas = new Set<number>();
  for (const e of exigidas) {
    const indice = novas.findIndex((n, i) => !usadas.has(i) && n.recursoId === e.recursoId
      && n.revisaoOriginal === e.revisaoOriginal && n.confirmada === true && n.autorId === autorId
      && n.data === anterior.dataVirtual && json(n.diferenca) === json(e.diferenca));
    if (indice < 0) erros[`${e.recursoId}.confirmacao`] = 'Examine a diferença e confirme a correção textual antes de salvar.';
    else usadas.add(indice);
  }
  if (usadas.size !== novas.length) erros.revisoesTextuais = 'A confirmação não corresponde à diferença exata solicitada.';
}
