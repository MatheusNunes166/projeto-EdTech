/** Fachada usada pelas telas: consultas e comandos acadêmicos mais as operações de aplicação (design D7). */
import { calcularEstadoMatricula, resolverContextoEstudo } from '../adaptativo/contexto-estudo';
import { feedbackDaResposta, proximaQuestaoMatricula } from '../adaptativo/estudo';
import type { ErrosAcademicos } from '../dominio/academico';
import { somarDias } from '../dominio/datas';
import { conquistasMatricula, sequenciaDiasMatricula, xpMatricula } from '../gamificacao/gamificacao';
import { ConsultasAcademicas } from './consultas-academicas';
import { conferirAlvoMatricula, type AlvoMatricula, type EscolhaResposta } from './comandos-estudo';
import type {
  ConsultaAcademica, PessoasAdministracao, ResultadoResposta, TrilhaMatricula,
} from './contratos-consultas-academicas';
import { validadorDeColecao } from './validacao-comandos-academicos';

const institucional = { tipo: 'instituicao' as const };
const validarData = validadorDeColecao('dataVirtual', (dados, anterior): ErrosAcademicos =>
  dados.dataVirtual === somarDias(anterior.dataVirtual, 1) ? {} : { dataVirtual: 'A data virtual só avança um dia por vez.' });

export class RepositorioApp extends ConsultasAcademicas {
  consultarDataVirtual(): Promise<ConsultaAcademica<string>> {
    return this.consultar({ acao: 'simular-data', recurso: institucional }, (dados) => ({ revisao: dados.revisao, dados: dados.dataVirtual }));
  }

  /** Controle da demonstração: qualquer pessoa ativa avança a data virtual em um dia. */
  avancarDataVirtual(revisao: number): Promise<string> {
    return this.alterar({ acao: 'simular-data', recurso: institucional }, revisao, (dados) => {
      dados.dataVirtual = somarDias(dados.dataVirtual, 1);
      return dados.dataVirtual;
    }, validarData);
  }

  consultarPessoas(): Promise<ConsultaAcademica<PessoasAdministracao>> {
    return this.consultar({ acao: 'consultar-administracao', recurso: institucional }, (dados) => ({
      revisao: dados.revisao, dados: {
        pessoas: dados.usuarios.map((u) => ({ id: u.id, nome: u.nome, email: u.email, funcoes: [...u.funcoes], ativo: u.ativo })),
        coordenacao: dados.vinculosCoordenador.map((v) => ({ coordenadorId: v.coordenadorId, graduacaoId: v.graduacaoId })),
        responsaveis: dados.vinculosResponsavel.map((v) => ({ responsavelId: v.responsavelId, alunoId: v.alunoId })),
        graduacoes: dados.graduacoes.map((g) => ({ id: g.id, codigo: g.codigo, nome: g.nome })),
      },
    }));
  }

  /** Trilha da matrícula do aluno da sessão; a próxima questão nunca inclui gabarito nem explicação. */
  consultarTrilha(alvo: AlvoMatricula): Promise<ConsultaAcademica<TrilhaMatricula>> {
    return this.consultar({ acao: 'consultar-estudo', recurso: { tipo: 'matricula', ...alvo } }, (dados) => {
      conferirAlvoMatricula(alvo);
      const contexto = resolverContextoEstudo(dados, alvo.matriculaId)!;
      const estado = calcularEstadoMatricula(contexto);
      const proxima = proximaQuestaoMatricula(contexto, estado);
      const turma = dados.turmas.find((t) => t.id === contexto.turmaId)!;
      const g = dados.graduacoes.find((x) => x.id === contexto.disciplina.graduacaoId)!;
      const p = dados.periodosLetivos.find((x) => x.id === turma.periodoLetivoId)!;
      return { revisao: dados.revisao, dados: {
        matriculaId: contexto.matriculaId,
        contexto: {
          graduacao: { id: g.id, codigo: g.codigo, nome: g.nome },
          disciplina: { id: contexto.disciplina.id, codigo: contexto.disciplina.codigo, nome: contexto.disciplina.nome, nivel: contexto.disciplina.nivel, status: contexto.disciplina.status },
          turma: { id: turma.id, codigo: turma.codigo }, periodoLetivo: { id: p.id, nome: p.nome },
        },
        trilha: {
          topicos: estado.topicos.map((t) => ({ ...t, materiais: contexto.disciplina.topicos.find((x) => x.id === t.topicoId)!.materiais
            .map((m) => ({ id: m.id, tipo: m.tipo, titulo: m.titulo, conteudo: m.conteudo })) })),
          progresso: estado.progresso, concluido: estado.concluido,
        },
        gamificacao: {
          xp: xpMatricula(contexto), sequenciaDias: sequenciaDiasMatricula(contexto, dados.dataVirtual),
          conquistas: conquistasMatricula(contexto).map((c) => ({ id: c.id, nome: c.nome, data: c.data })),
        },
        proxima: proxima && {
          questaoId: proxima.questao.id, topicoId: proxima.topicoId, dificuldade: proxima.questao.dificuldade,
          topicoTitulo: estado.topicos.find((t) => t.topicoId === proxima.topicoId)!.titulo,
          enunciado: proxima.questao.enunciado, alternativas: [...proxima.questao.alternativas],
        },
      } };
    });
  }

  /** Registra a resposta (comando atômico) e devolve o feedback calculado sobre o conteúdo gravado. */
  async responderQuestao(alvo: AlvoMatricula, escolha: EscolhaResposta, revisao: number): Promise<ResultadoResposta> {
    const antes = await this.consultar({ acao: 'consultar-estudo', recurso: { tipo: 'matricula', ...alvo } }, (dados) => {
      conferirAlvoMatricula(alvo);
      const contexto = resolverContextoEstudo(dados, alvo.matriculaId)!;
      return { contexto: structuredClone(contexto), conquistas: conquistasMatricula(contexto).map((c) => c.id), estado: calcularEstadoMatricula(contexto) };
    });
    const resposta = await this.registrarResposta(alvo, escolha, revisao);
    const feedback = feedbackDaResposta(antes.contexto, resposta);
    const contextoDepois = { ...antes.contexto, respostas: [...antes.contexto.respostas, resposta] };
    const depois = calcularEstadoMatricula(contextoDepois);
    const titulo = (id: string) => depois.topicos.find((t) => t.topicoId === id)!.titulo;
    const desbloqueado = depois.topicos.find((t, i) => t.desbloqueado && !antes.estado.topicos[i].desbloqueado);
    return {
      acertou: feedback.acertou, explicacao: feedback.explicacao, alternativaCorreta: feedback.alternativaCorreta,
      topicoTitulo: titulo(feedback.topicoId), dominioAnterior: feedback.dominioAnterior, dominioAtual: feedback.dominioAtual,
      variacao: feedback.variacao, xpConcedido: resposta.xpConcedido, topicoDominado: feedback.topicoDominado,
      topicoDesbloqueado: desbloqueado ? desbloqueado.titulo : null,
      novasConquistas: conquistasMatricula(contextoDepois).filter((c) => !antes.conquistas.includes(c.id))
        .map((c) => ({ id: c.id, nome: c.nome, data: c.data })),
      sugerirRevisao: feedback.sugerirRevisao, concluido: feedback.concluido, progresso: feedback.progresso,
    };
  }
}
