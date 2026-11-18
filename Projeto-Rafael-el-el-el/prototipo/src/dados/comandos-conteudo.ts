import type { Dificuldade, Material, QuestaoDisciplina, Topico } from '../dominio/tipos';
import type { DiferencaTextual } from '../conteudo/regras-disciplina';
import type { AlvoDisciplina } from './comandos-academicos';
import { ComandosEstudo } from './comandos-estudo';
import { validadorDeConteudo } from './validacao-conteudo';
import { conferirChaves, existente, rejeitar } from './validacao-comandos-academicos';

/** Questão proposta pelo editor; a disciplina e a revisão gravada são do repositório. */
export interface QuestaoCandidata {
  id: string; topicoId: string; enunciado: string; alternativas: string[]; correta: number;
  explicacao: string; dificuldade: Dificuldade;
  /** Revisão que o formulário leu; deve coincidir com a gravada (questão nova: 0). */
  revisao: number;
}
/** Conteúdo completo da disciplina: a ordem dos tópicos define a sequência de desbloqueio. */
export interface ConteudoCandidato { topicos: Topico[]; questoes: QuestaoCandidata[] }
/** Confirmação do próprio autor, ligada ao recurso, à revisão original e à diferença exata. */
export interface ConfirmacaoTextual { recursoId: string; revisaoOriginal: number; diferenca: DiferencaTextual[] }
export interface AjusteMateriais { topicoId: string; materiais: Material[] }
export interface ConteudoSalvo { topicos: Topico[]; questoes: QuestaoDisciplina[] }

const camposTopico = ['id', 'titulo', 'materiais'] as const;
const camposMaterial = ['id', 'tipo', 'titulo', 'conteudo'] as const;
const camposQuestao = ['id', 'topicoId', 'enunciado', 'alternativas', 'correta', 'explicacao', 'dificuldade', 'revisao'] as const;
const camposDiferenca = ['campo', 'original', 'proposto'] as const;

const texto = (v: unknown) => typeof v === 'string';
const lista = (v: unknown, campo: string): unknown[] => { if (!Array.isArray(v)) rejeitar(campo, 'Informe uma lista.'); return v; };

function conferirMaterial(m: Material) {
  conferirChaves(m, camposMaterial);
  if (!texto(m.id) || !texto(m.tipo) || !texto(m.titulo) || !texto(m.conteudo)) rejeitar('materiais', 'Material inválido.');
}
function conferirTopico(t: Topico) {
  conferirChaves(t, camposTopico);
  if (!texto(t.id) || !texto(t.titulo)) rejeitar('topicos', 'Tópico inválido.');
  lista(t.materiais, 'materiais').forEach((m) => conferirMaterial(m as Material));
}
function conferirQuestao(q: QuestaoCandidata) {
  conferirChaves(q, camposQuestao);
  if (!texto(q.id) || !texto(q.topicoId) || !texto(q.enunciado) || !texto(q.explicacao) || !texto(q.dificuldade)
    || !Number.isInteger(q.correta) || !Number.isInteger(q.revisao)) rejeitar('questoes', 'Questão inválida.');
  if (!lista(q.alternativas, 'alternativas').every(texto)) rejeitar('alternativas', 'Alternativas inválidas.');
}
function conferirConfirmacao(c: ConfirmacaoTextual) {
  conferirChaves(c, ['recursoId', 'revisaoOriginal', 'diferenca']);
  if (!texto(c.recursoId) || !Number.isInteger(c.revisaoOriginal)) rejeitar('confirmacoes', 'Confirmação inválida.');
  lista(c.diferenca, 'confirmacoes').forEach((x) => conferirChaves(x as object, camposDiferenca));
}

/** Atribui só o que muda, preservando a identidade e a ordem de chaves dos registros existentes. */
function atribuir<T extends object>(destino: T, valores: Partial<T>) {
  for (const [chave, valor] of Object.entries(valores)) {
    if (JSON.stringify((destino as Record<string, unknown>)[chave]) !== JSON.stringify(valor)) {
      (destino as Record<string, unknown>)[chave] = structuredClone(valor);
    }
  }
}

/** Comandos de conteúdo da disciplina, separados do cadastro acadêmico (design D4–D5). */
export class ComandosConteudo extends ComandosEstudo {
  /** Recebe o conteúdo completo desejado; salva tudo ou nada. Alunos e cadastro não fazem parte do payload. */
  salvarConteudo(
    alvo: AlvoDisciplina, candidato: ConteudoCandidato, revisao: number, confirmacoes: ConfirmacaoTextual[] = [],
  ): Promise<ConteudoSalvo> {
    let autor: string | undefined;
    return this.alterar({ acao: 'editar-conteudo', recurso: { tipo: 'disciplina', ...alvo } }, revisao, (dados, quem) => {
      autor = quem.id;
      conferirChaves(alvo, ['disciplinaId', 'graduacaoId']);
      conferirChaves(candidato, ['topicos', 'questoes']);
      lista(candidato.topicos, 'topicos').forEach((t) => conferirTopico(t as Topico));
      lista(candidato.questoes, 'questoes').forEach((q) => conferirQuestao(q as QuestaoCandidata));
      lista(confirmacoes, 'confirmacoes').forEach((c) => conferirConfirmacao(c as ConfirmacaoTextual));
      const d = existente(dados.disciplinas, alvo.disciplinaId, 'disciplinaId');

      const topicos = candidato.topicos.map((t) => {
        const atual = d.topicos.find((x) => x.id === t.id);
        if (!atual) return structuredClone(t);
        atribuir(atual, { titulo: t.titulo });
        atribuir(atual, { materiais: t.materiais });
        return atual;
      });
      d.topicos = topicos;

      const mantidas = new Set<string>();
      if (new Set(candidato.questoes.map((q) => q.id)).size !== candidato.questoes.length) {
        rejeitar('questoes', 'Identificador de questão inválido ou duplicado.');
      }
      for (const q of candidato.questoes) {
        const gravada = dados.questoes.find((x) => x.id === q.id);
        if (gravada && gravada.disciplinaId !== d.id) rejeitar(`${q.id}.id`, 'Identificador de questão inválido ou duplicado.');
        if (gravada) {
          if (q.revisao !== gravada.revisao) rejeitar(`${q.id}.revisao`, 'A questão mudou desde a leitura; recarregue e confirme novamente.');
          const antes = JSON.stringify(gravada);
          atribuir(gravada, { topicoId: q.topicoId, enunciado: q.enunciado, alternativas: q.alternativas,
            correta: q.correta, explicacao: q.explicacao, dificuldade: q.dificuldade });
          if (JSON.stringify(gravada) !== antes) gravada.revisao += 1;
        } else {
          dados.questoes.push({
            id: q.id, disciplinaId: d.id, topicoId: q.topicoId, dificuldade: q.dificuldade, enunciado: q.enunciado,
            alternativas: [...q.alternativas], correta: q.correta, explicacao: q.explicacao, revisao: q.revisao,
          });
        }
        mantidas.add(q.id);
      }
      // Questões removidas saem aqui; a validação do estado final decide se a remoção é permitida.
      dados.questoes = dados.questoes.filter((x) => x.disciplinaId !== d.id || mantidas.has(x.id));
      for (const c of confirmacoes) {
        dados.revisoesTextuais.push({
          id: this.gerarId(), autorId: quem.id, data: dados.dataVirtual, recursoId: c.recursoId,
          revisaoOriginal: c.revisaoOriginal, diferenca: structuredClone(c.diferenca), confirmada: true,
        });
      }
      return { topicos: structuredClone(d.topicos), questoes: structuredClone(dados.questoes.filter((x) => x.disciplinaId === d.id)) };
    }, validadorDeConteudo(alvo.disciplinaId, 'conteudo', () => autor));
  }

  /** Ajusta somente materiais de tópicos existentes, inclusive após o início do estudo. */
  salvarMateriais(alvo: AlvoDisciplina, ajustes: AjusteMateriais[], revisao: number): Promise<ConteudoSalvo> {
    return this.alterar({ acao: 'editar-conteudo', recurso: { tipo: 'disciplina', ...alvo } }, revisao, (dados) => {
      conferirChaves(alvo, ['disciplinaId', 'graduacaoId']);
      lista(ajustes, 'ajustes').forEach((a) => {
        conferirChaves(a as object, ['topicoId', 'materiais']);
        lista((a as AjusteMateriais).materiais, 'materiais').forEach((m) => conferirMaterial(m as Material));
      });
      const d = existente(dados.disciplinas, alvo.disciplinaId, 'disciplinaId');
      for (const ajuste of ajustes) {
        const topico = d.topicos.find((t) => t.id === ajuste.topicoId);
        if (!topico) rejeitar('topicoId', 'O tópico não pertence a esta disciplina.');
        atribuir(topico, { materiais: ajuste.materiais });
      }
      return { topicos: structuredClone(d.topicos), questoes: structuredClone(dados.questoes.filter((x) => x.disciplinaId === d.id)) };
    }, validadorDeConteudo(alvo.disciplinaId, 'materiais', () => undefined));
  }

  /** Publica se houver ao menos um tópico e cada tópico tiver as três dificuldades; senão lista o que falta. */
  publicarConteudo(alvo: AlvoDisciplina, revisao: number): Promise<{ status: 'publicado' }> {
    return this.alterar({ acao: 'publicar-conteudo', recurso: { tipo: 'disciplina', ...alvo } }, revisao, (dados) => {
      conferirChaves(alvo, ['disciplinaId', 'graduacaoId']);
      existente(dados.disciplinas, alvo.disciplinaId, 'disciplinaId').status = 'publicado';
      return { status: 'publicado' as const };
    }, validadorDeConteudo(alvo.disciplinaId, 'publicacao', () => undefined));
  }
}
