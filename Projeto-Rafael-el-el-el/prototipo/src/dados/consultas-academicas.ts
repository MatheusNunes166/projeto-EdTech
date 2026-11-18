import { disciplinaTemResposta, questaoRespondida } from '../conteudo/regras-disciplina';
import { disciplinaComEstudo, turmaComEstudo } from './validacao-comandos-academicos';
import {
  pessoaAtiva, podeExecutar, type LeituraProfunda, type PedidoAutorizacao, type RecursoAcademico,
} from '../dominio/autorizacao';
import { FUNCOES, NIVEIS_CURSO, type DadosAcademicos, type Funcao, type Disciplina } from '../dominio/tipos';
import { CONFIG } from '../adaptativo/config';
import { calcularEstadoMatricula, resolverContextoEstudo } from '../adaptativo/contexto-estudo';
import {
  calcularMediasTurma, contextosDaTurma, indicadoresDaMatricula, situacaoDoAluno, ultimaAtividadeMatricula,
} from '../desempenho/indicadores-academicos';
import type { AlvoDisciplina, AlvoTurma } from './comandos-academicos';
import { ComandosConteudo } from './comandos-conteudo';
import { conferirAlvoMatricula, type AlvoMatricula } from './comandos-estudo';
import type {
  CandidatoVinculo, ConsultaAcademica, ConteudoEditavel, ContextoTurma, DetalheDisciplina,
  DetalheGraduacao, DisciplinaAdministravel, HistoricoMatricula, DisciplinaCatalogo, EstruturaAdministravel,
  FiltrosCatalogo, GraduacaoCatalogo, IdentidadePessoa, MatriculadoTurma, MinhaTurma,
  OfertaCatalogo, PedidoCandidatos, IndicadoresAdministracao, IndicadoresCoordenacao, IndicadoresDocenciaTurma,
  IndicadoresPainelAluno, IndicadoresResponsavel,
} from './contratos-consultas-academicas';
import { conferirChaves, rejeitar } from './validacao-comandos-academicos';

type Documento = LeituraProfunda<DadosAcademicos>;
export type EscopoEstrutura = Extract<RecursoAcademico, { tipo: 'graduacao' | 'disciplina' | 'turma' }>;
const institucional = (acao: PedidoAutorizacao['acao']): PedidoAutorizacao => ({ acao, recurso: { tipo: 'instituicao' } });
const recursoTurma = (alvo: AlvoTurma): RecursoAcademico => ({
  tipo: 'turma', turmaId: alvo.turmaId, disciplinaId: alvo.disciplinaId, graduacaoId: alvo.graduacaoId,
});
const recursoDisciplina = (alvo: AlvoDisciplina): RecursoAcademico => ({
  tipo: 'disciplina', disciplinaId: alvo.disciplinaId, graduacaoId: alvo.graduacaoId,
});

function achar<T extends { readonly id: string }>(lista: readonly T[], id: string): T {
  const valor = lista.find((x) => x.id === id);
  if (!valor) rejeitar('referencia', 'Relação acadêmica inexistente.');
  return valor;
}
function graduacaoDTO(g: Documento['graduacoes'][number]) {
  return { id: g.id, codigo: g.codigo, nome: g.nome, descricao: g.descricao, area: g.area };
}
function periodoDTO(p: Documento['periodosLetivos'][number]) {
  return { id: p.id, nome: p.nome, dataInicio: p.dataInicio, dataFim: p.dataFim };
}
function conferirAlvo(alvo: object, campos: readonly string[]) {
  conferirChaves(alvo, campos);
  for (const valor of Object.values(alvo)) if (typeof valor !== 'string') rejeitar('recurso', 'Identificador inválido.');
}
function identidade(u: IdentidadePessoa): IdentidadePessoa { return { id: u.id, nome: u.nome }; }
function disciplinaDTO(d: Documento['disciplinas'][number]): DisciplinaAdministravel {
  return { id: d.id, graduacaoId: d.graduacaoId, codigo: d.codigo, nome: d.nome,
    descricaoCurta: d.descricaoCurta, descricao: d.descricao, nivel: d.nivel, status: d.status };
}
function contextoTurma(dados: Documento, turmaId: string): ContextoTurma {
  const t = achar(dados.turmas, turmaId), d = achar(dados.disciplinas, t.disciplinaId);
  const g = achar(dados.graduacoes, d.graduacaoId), p = achar(dados.periodosLetivos, t.periodoLetivoId);
  return {
    turma: { id: t.id, codigo: t.codigo }, periodoLetivo: { id: p.id, nome: p.nome },
    disciplina: { id: d.id, codigo: d.codigo, nome: d.nome, nivel: d.nivel, status: d.status },
    graduacao: { id: g.id, codigo: g.codigo, nome: g.nome },
  };
}
function professores(dados: Documento, turmaId: string): IdentidadePessoa[] {
  return dados.vinculosProfessor.filter((v) => v.turmaId === turmaId).map((v) => identidade(achar(dados.usuarios, v.professorId)));
}
function oferta(dados: Documento, turmaId: string, alunoId: string): OfertaCatalogo {
  const m = dados.matriculas.find((x) => x.turmaId === turmaId && x.alunoId === alunoId);
  return { ...contextoTurma(dados, turmaId), professores: professores(dados, turmaId),
    acesso: m ? { situacao: 'matriculado', matriculaId: m.id } : { situacao: 'sem-matricula' } };
}
function disciplinaCatalogo(dados: Documento, d: LeituraProfunda<Disciplina>, alunoId: string, periodoId?: string): DisciplinaCatalogo {
  return {
    id: d.id, codigo: d.codigo, nome: d.nome, descricaoCurta: d.descricaoCurta, nivel: d.nivel, numeroTopicos: d.topicos.length,
    ofertas: dados.turmas.filter((t) => t.disciplinaId === d.id && (periodoId === undefined || t.periodoLetivoId === periodoId))
      .map((t) => oferta(dados, t.id, alunoId)),
  };
}
function conferirFiltros(filtros: FiltrosCatalogo) {
  conferirChaves(filtros, ['busca', 'area', 'nivel', 'periodoLetivoId']);
  for (const valor of Object.values(filtros)) if (typeof valor !== 'string') rejeitar('filtros', 'Filtro inválido.');
  if (filtros.nivel !== undefined && !NIVEIS_CURSO.includes(filtros.nivel)) rejeitar('nivel', 'Nível pedagógico inválido.');
}

/** Fachada isolada de consultas e comandos. Toda projeção enumera os campos de seu DTO.
 * Não expõe obterDados(), seletores públicos ou históricos; não inicializa persistência.
 */
export class ConsultasAcademicas extends ComandosConteudo {
  consultarCatalogo(filtros: FiltrosCatalogo = {}): Promise<ConsultaAcademica<GraduacaoCatalogo[]>> {
    return this.consultar(institucional('consultar-catalogo'), (dados, autor) => {
      conferirFiltros(filtros);
      if (filtros.periodoLetivoId !== undefined) achar(dados.periodosLetivos, filtros.periodoLetivoId);
      const busca = (filtros.busca ?? '').trim().toLocaleLowerCase('pt-BR');
      const resultado: GraduacaoCatalogo[] = [];
      for (const g of dados.graduacoes) {
        if (filtros.area !== undefined && filtros.area !== g.area) continue;
        const nomeGrad = g.nome.toLocaleLowerCase('pt-BR').includes(busca);
        const disciplinas = dados.disciplinas.filter((d) => d.graduacaoId === g.id && d.status === 'publicado'
          && (nomeGrad || d.nome.toLocaleLowerCase('pt-BR').includes(busca))
          && (filtros.nivel === undefined || d.nivel === filtros.nivel)
          && (filtros.periodoLetivoId === undefined || dados.turmas.some((t) => t.disciplinaId === d.id && t.periodoLetivoId === filtros.periodoLetivoId)))
          .map((d) => disciplinaCatalogo(dados, d, autor.id, filtros.periodoLetivoId));
        if (disciplinas.length || (nomeGrad && filtros.nivel === undefined && filtros.periodoLetivoId === undefined)) {
          resultado.push({ id: g.id, codigo: g.codigo, nome: g.nome, area: g.area,
            descricaoCurta: g.descricao.split(/\r?\n\s*\r?\n/)[0], disciplinas });
        }
      }
      return { revisao: dados.revisao, dados: resultado };
    });
  }

  consultarMetadadosGraduacao(graduacaoId: string): Promise<ConsultaAcademica<DetalheGraduacao>> {
    return this.consultar({ acao: 'consultar-metadados-catalogo', recurso: { tipo: 'graduacao', graduacaoId } }, (dados, autor) => ({
      revisao: dados.revisao, dados: {
        graduacao: graduacaoDTO(achar(dados.graduacoes, graduacaoId)),
        disciplinas: dados.disciplinas.filter((d) => d.graduacaoId === graduacaoId && d.status === 'publicado')
          .map((d) => disciplinaCatalogo(dados, d, autor.id)),
      },
    }));
  }

  consultarMetadadosDisciplina(alvo: AlvoDisciplina): Promise<ConsultaAcademica<DetalheDisciplina>> {
    return this.consultar({ acao: 'consultar-metadados-catalogo', recurso: recursoDisciplina(alvo) }, (dados, autor) => {
      conferirAlvo(alvo, ['disciplinaId', 'graduacaoId']);
      const d = achar(dados.disciplinas, alvo.disciplinaId), g = achar(dados.graduacoes, d.graduacaoId);
      const { ofertas, ...resumo } = disciplinaCatalogo(dados, d, autor.id);
      return { revisao: dados.revisao, dados: {
        graduacao: { id: g.id, codigo: g.codigo, nome: g.nome }, disciplina: { ...resumo, descricao: d.descricao },
        topicos: d.topicos.map((t) => ({ id: t.id, titulo: t.titulo })), ofertas,
      } };
    });
  }

  consultarMetadadosTurma(alvo: AlvoTurma): Promise<ConsultaAcademica<OfertaCatalogo>> {
    return this.consultar({ acao: 'consultar-metadados-catalogo', recurso: recursoTurma(alvo) },
      (dados, autor) => {
        conferirAlvo(alvo, ['turmaId', 'disciplinaId', 'graduacaoId']);
        return { revisao: dados.revisao, dados: oferta(dados, alvo.turmaId, autor.id) };
      });
  }

  consultarMinhasTurmas(): Promise<ConsultaAcademica<MinhaTurma[]>> {
    return this.consultar(institucional('consultar-minhas-turmas'), (dados, autor) => ({
      revisao: dados.revisao, dados: dados.matriculas.filter((m) => m.alunoId === autor.id).map((m) => {
        const contexto = contextoTurma(dados, m.turmaId);
        return { ...contexto, matricula: { id: m.id, data: m.data }, conteudoDisponivel: contexto.disciplina.status === 'publicado' };
      }),
    }));
  }

  consultarEstruturaAdministravel(escopo?: EscopoEstrutura): Promise<ConsultaAcademica<EstruturaAdministravel>> {
    const pedidos = [institucional('listar-estrutura-administravel')];
    if (escopo) pedidos.push({ acao: 'consultar-estrutura', recurso: escopo });
    return this.consultar(pedidos, (dados, autor) => {
      if (escopo) conferirAlvo(escopo, escopo.tipo === 'graduacao' ? ['tipo', 'graduacaoId']
        : escopo.tipo === 'disciplina' ? ['tipo', 'disciplinaId', 'graduacaoId'] : ['tipo', 'turmaId', 'disciplinaId', 'graduacaoId']);
      // Mesmo na lista sem filtro, cada graduação é autorizada sobre o vínculo atual.
      const graduacoes = dados.graduacoes.filter((g) => podeExecutar(dados, autor.id,
        { acao: 'consultar-estrutura', recurso: { tipo: 'graduacao', graduacaoId: g.id } }));
      const dEscopo = escopo?.tipo === 'disciplina' ? escopo.disciplinaId
        : escopo?.tipo === 'turma' ? achar(dados.turmas, escopo.turmaId).disciplinaId : undefined;
      const gEscopo = escopo?.tipo === 'graduacao' ? escopo.graduacaoId
        : dEscopo ? achar(dados.disciplinas, dEscopo).graduacaoId : undefined;
      const visiveis = graduacoes.filter((g) => gEscopo === undefined || g.id === gEscopo);
      const disciplinas = dados.disciplinas.filter((d) => visiveis.some((g) => g.id === d.graduacaoId)
        && (dEscopo === undefined || d.id === dEscopo));
      const turmas = dados.turmas.filter((t) => disciplinas.some((d) => d.id === t.disciplinaId)
        && (escopo?.tipo !== 'turma' || t.id === escopo.turmaId));
      return { revisao: dados.revisao, dados: {
        graduacoes: visiveis.map(graduacaoDTO), disciplinas: disciplinas.map((d) => ({ ...disciplinaDTO(d), identidadeProtegida: disciplinaComEstudo(dados, d.id) })),
        turmas: turmas.map((t) => ({ ...contextoTurma(dados, t.id), professores: professores(dados, t.id), identidadeProtegida: turmaComEstudo(dados, t.id) })),
        periodosLetivos: visiveis.length || autor.funcoes.includes('admin') ? dados.periodosLetivos.map(periodoDTO) : [],
      } };
    });
  }

  consultarTurmasDocentes(): Promise<ConsultaAcademica<ContextoTurma[]>> {
    return this.consultar(institucional('listar-turmas-docentes'), (dados, autor) => ({
      revisao: dados.revisao, dados: dados.turmas.filter((t) => podeExecutar(dados, autor.id,
        { acao: 'consultar-turma-docente', recurso: { tipo: 'turma', turmaId: t.id } })).map((t) => contextoTurma(dados, t.id)),
    }));
  }

  consultarMatriculados(alvo: AlvoTurma): Promise<ConsultaAcademica<MatriculadoTurma[]>> {
    return this.consultar({ acao: 'consultar-matriculados', recurso: recursoTurma(alvo) }, (dados) => {
      conferirAlvo(alvo, ['turmaId', 'disciplinaId', 'graduacaoId']);
      return { revisao: dados.revisao, dados: dados.matriculas.filter((m) => m.turmaId === alvo.turmaId)
        .map((m) => ({ matriculaId: m.id, data: m.data, aluno: identidade(achar(dados.usuarios, m.alunoId)) })) };
    });
  }

  consultarAlunosVinculados(): Promise<ConsultaAcademica<IdentidadePessoa[]>> {
    return this.consultar(institucional('listar-alunos-responsavel'), (dados, autor) => ({
      revisao: dados.revisao, dados: dados.usuarios.filter((u) => podeExecutar(dados, autor.id,
        { acao: 'consultar-painel-responsavel', recurso: { tipo: 'aluno', alunoId: u.id } })).map(identidade),
    }));
  }

  consultarTurmasAlunoVinculado(alunoId: string): Promise<ConsultaAcademica<ContextoTurma[]>> {
    return this.consultar({ acao: 'consultar-painel-responsavel', recurso: { tipo: 'aluno', alunoId } }, (dados) => ({
      revisao: dados.revisao, dados: dados.matriculas.filter((m) => m.alunoId === alunoId).map((m) => contextoTurma(dados, m.turmaId)),
    }));
  }

  consultarCandidatos(pedido: PedidoCandidatos): Promise<ConsultaAcademica<CandidatoVinculo[]>> {
    let autorizacoes: PedidoAutorizacao[], funcao: Funcao, exigeAtivo = true;
    switch (pedido.finalidade) {
      case 'matricula': case 'docencia':
        autorizacoes = [{ acao: pedido.finalidade === 'matricula' ? 'matricular' : 'gerir-docentes', recurso: recursoTurma(pedido.turma) }];
        funcao = pedido.finalidade === 'matricula' ? 'aluno' : 'professor'; break;
      case 'coordenacao':
        autorizacoes = [institucional('gerir-coordenadores'), { acao: 'editar-graduacao', recurso: { tipo: 'graduacao', graduacaoId: pedido.graduacaoId } }];
        funcao = 'coordenador'; break;
      case 'responsavel': case 'aluno-responsavel':
        autorizacoes = [institucional('gerir-responsaveis')];
        funcao = pedido.finalidade === 'responsavel' ? 'responsavel' : 'aluno';
        exigeAtivo = pedido.finalidade === 'responsavel'; break;
      default:
        // Negação autenticada antes de tratar pedido com finalidade inválida.
        return this.consultar(institucional('consultar-administracao'), () => rejeitar('finalidade', 'Finalidade inválida.'));
    }
    return this.consultar(autorizacoes, (dados) => {
      conferirChaves(pedido, pedido.finalidade === 'coordenacao' ? ['finalidade', 'graduacaoId']
        : ['matricula', 'docencia'].includes(pedido.finalidade) ? ['finalidade', 'turma'] : ['finalidade']);
      if ('turma' in pedido) conferirAlvo(pedido.turma, ['turmaId', 'disciplinaId', 'graduacaoId']);
      return { revisao: dados.revisao, dados: dados.usuarios.filter((u) => u.funcoes.includes(funcao)
        && (!exigeAtivo || pessoaAtiva(dados, u.id)))
        .map((u) => ({ id: u.id, nome: u.nome, funcoes: [funcao] })),
      };
    });
  }

  consultarConteudoEditavel(alvo: AlvoDisciplina): Promise<ConsultaAcademica<ConteudoEditavel>> {
    return this.consultar({ acao: 'editar-conteudo', recurso: recursoDisciplina(alvo) }, (dados) => {
      conferirAlvo(alvo, ['disciplinaId', 'graduacaoId']);
      const d = achar(dados.disciplinas, alvo.disciplinaId), g = achar(dados.graduacoes, d.graduacaoId);
      return { revisao: dados.revisao, dados: {
        graduacao: { id: g.id, codigo: g.codigo, nome: g.nome },
        disciplina: { ...disciplinaDTO(d), topicos: d.topicos.map((t) => ({ id: t.id, titulo: t.titulo,
          materiais: t.materiais.map((m) => ({ id: m.id, tipo: m.tipo, titulo: m.titulo, conteudo: m.conteudo })) })) },
        protecoes: { estudoIniciado: disciplinaTemResposta(dados, d.id),
          questoesRespondidas: dados.questoes.filter((q) => q.disciplinaId === d.id && questaoRespondida(dados, q.id)).map((q) => q.id) },
        questoes: dados.questoes.filter((q) => q.disciplinaId === d.id).map((q) => ({
          id: q.id, disciplinaId: q.disciplinaId, topicoId: q.topicoId, revisao: q.revisao, enunciado: q.enunciado,
          alternativas: [...q.alternativas], correta: q.correta, explicacao: q.explicacao, dificuldade: q.dificuldade,
        })),
      } };
    });
  }

  /** Trilha da turma atual: indicadores, XP, sequência e conquistas apenas dessa matrícula do aluno da sessão. */
  consultarIndicadoresAluno(alvo: AlvoMatricula): Promise<ConsultaAcademica<IndicadoresPainelAluno>> {
    return this.consultar({ acao: 'consultar-estudo', recurso: { tipo: 'matricula', ...alvo } }, (dados) => {
      conferirAlvoMatricula(alvo);
      const contexto = resolverContextoEstudo(dados, alvo.matriculaId);
      if (!contexto) rejeitar('matriculaId', 'Matrícula inexistente.');
      return { revisao: dados.revisao, dados: { ...indicadoresDaMatricula(contexto, dados.dataVirtual), contexto: contextoTurma(dados, contexto.turmaId) } };
    });
  }

  /** Painel do aluno: indicadores próprios de cada matrícula com conteúdo publicado, por oferta. */
  consultarPainelAluno(): Promise<ConsultaAcademica<IndicadoresPainelAluno[]>> {
    return this.consultar(institucional('consultar-minhas-turmas'), (dados, autor) => ({
      revisao: dados.revisao, dados: dados.matriculas.filter((m) => m.alunoId === autor.id).flatMap((m) => {
        const contexto = resolverContextoEstudo(dados, m.id);
        const oferta = contexto && contextoTurma(dados, m.turmaId);
        return contexto && oferta?.disciplina.status === 'publicado'
          ? [{ ...indicadoresDaMatricula(contexto, dados.dataVirtual), contexto: oferta }] : [];
      }),
    }));
  }

  /** Painel do professor numa turma vinculada: matriculados (todos) com indicadores e médias da turma. */
  consultarIndicadoresDocencia(alvo: AlvoTurma): Promise<ConsultaAcademica<IndicadoresDocenciaTurma>> {
    return this.consultar({ acao: 'consultar-turma-docente', recurso: recursoTurma(alvo) }, (dados) => {
      conferirAlvo(alvo, ['turmaId', 'disciplinaId', 'graduacaoId']);
      const contextos = contextosDaTurma(dados, alvo.turmaId);
      return { revisao: dados.revisao, dados: {
        turmaId: alvo.turmaId, contexto: contextoTurma(dados, alvo.turmaId),
        quantidadeMatriculados: contextos.length,
        matriculados: contextos.map((c) => ({
          ...identidade(achar(dados.usuarios, c.alunoId)), ...indicadoresDaMatricula(c, dados.dataVirtual), situacao: situacaoDoAluno(c),
        })),
        medias: calcularMediasTurma(contextos),
      } };
    });
  }

  /** Coordenação: uma linha por turma dos cursos vinculados; sem média global e sem respostas detalhadas. */
  consultarIndicadoresCoordenacao(escopo?: EscopoEstrutura): Promise<ConsultaAcademica<IndicadoresCoordenacao>> {
    const pedidos = [institucional('listar-estrutura-administravel')];
    if (escopo) pedidos.push({ acao: 'consultar-painel-coordenacao', recurso: escopo });
    return this.consultar(pedidos, (dados, autor) => {
      if (escopo) conferirAlvo(escopo, escopo.tipo === 'graduacao' ? ['tipo', 'graduacaoId']
        : escopo.tipo === 'disciplina' ? ['tipo', 'disciplinaId', 'graduacaoId'] : ['tipo', 'turmaId', 'disciplinaId', 'graduacaoId']);
      const noEscopo = (t: Documento['turmas'][number]) => {
        if (!escopo) return true;
        const d = achar(dados.disciplinas, t.disciplinaId);
        return escopo.tipo === 'graduacao' ? d.graduacaoId === escopo.graduacaoId
          : escopo.tipo === 'disciplina' ? t.disciplinaId === escopo.disciplinaId : t.id === escopo.turmaId;
      };
      return { revisao: dados.revisao, dados: { turmas: dados.turmas
        .filter((t) => noEscopo(t) && podeExecutar(dados, autor.id, { acao: 'consultar-painel-coordenacao', recurso: { tipo: 'turma', turmaId: t.id } }))
        .map((t) => {
          const contextos = contextosDaTurma(dados, t.id);
          return { turmaId: t.id, contexto: contextoTurma(dados, t.id), quantidadeMatriculados: contextos.length, medias: calcularMediasTurma(contextos) };
        }) } };
    });
  }

  /** Responsável: só alunos vinculados; por oferta, progresso, sequência e última atividade (sem histórico). */
  consultarIndicadoresResponsavel(alunoId: string): Promise<ConsultaAcademica<IndicadoresResponsavel>> {
    return this.consultar({ acao: 'consultar-painel-responsavel', recurso: { tipo: 'aluno', alunoId } }, (dados) => ({
      revisao: dados.revisao, dados: { alunoId, turmas: dados.matriculas.filter((m) => m.alunoId === alunoId).flatMap((m) => {
        const c = resolverContextoEstudo(dados, m.id);
        if (!c) return [];
        const i = indicadoresDaMatricula(c, dados.dataVirtual);
        return [{ turmaId: m.turmaId, contexto: contextoTurma(dados, m.turmaId), progresso: i.progresso,
          sequenciaDias: i.sequenciaDias, ultimaAtividade: ultimaAtividadeMatricula(c) }];
      }) },
    }));
  }

  /** Totais administrativos: pessoas distintas (ativas ou não), por função e contagens de entidades. */
  consultarIndicadoresAdministracao(): Promise<ConsultaAcademica<IndicadoresAdministracao>> {
    return this.consultar(institucional('consultar-administracao'), (dados) => ({
      revisao: dados.revisao, dados: {
        pessoas: {
          total: new Set(dados.usuarios.map((u) => u.id)).size,
          porFuncao: Object.fromEntries(FUNCOES.map((f) => [f, dados.usuarios.filter((u) => u.funcoes.includes(f)).length])) as Record<Funcao, number>,
        },
        graduacoes: dados.graduacoes.length,
        disciplinas: {
          rascunho: dados.disciplinas.filter((d) => d.status === 'rascunho').length,
          publicadas: dados.disciplinas.filter((d) => d.status === 'publicado').length,
        },
        periodosLetivos: dados.periodosLetivos.length, turmas: dados.turmas.length, matriculas: dados.matriculas.length,
      },
    }));
  }

  /** Retomada do próprio aluno: estado reconstituído e conteúdo originalmente apresentado. */
  consultarHistoricoEstudo(alvo: AlvoMatricula): Promise<ConsultaAcademica<HistoricoMatricula>> {
    return this.consultar({ acao: 'consultar-estudo', recurso: { tipo: 'matricula', ...alvo } },
      (dados) => ({ revisao: dados.revisao, dados: historicoDTO(dados, alvo) }));
  }

  /** Detalhe docente: exige vínculo com a turma da matrícula, não apenas a mesma disciplina ou aluno. */
  consultarHistoricoAlunoDocente(alvo: AlvoMatricula): Promise<ConsultaAcademica<HistoricoMatricula>> {
    return this.consultar({ acao: 'consultar-historico-docente', recurso: { tipo: 'matricula', ...alvo } },
      (dados) => ({ revisao: dados.revisao, dados: historicoDTO(dados, alvo, CONFIG.atencao.ultimasRespostas) }));
  }
}

/** Usa a cópia gravada em cada resposta; nunca reavalia contra o cadastro corrente. */
function historicoDTO(dados: Documento, alvo: AlvoMatricula, ultimas?: number): HistoricoMatricula {
  conferirAlvoMatricula(alvo);
  const contexto = resolverContextoEstudo(dados, alvo.matriculaId);
  if (!contexto) rejeitar('matriculaId', 'Matrícula inexistente.');
  const trilha = calcularEstadoMatricula(contexto);
  return {
    matriculaId: contexto.matriculaId,
    aluno: identidade(achar(dados.usuarios, contexto.alunoId)),
    contexto: contextoTurma(dados, contexto.turmaId),
    trilha: { topicos: trilha.topicos.map((t) => ({ ...t })), progresso: trilha.progresso, concluido: trilha.concluido },
    respostas: (ultimas === undefined ? contexto.respostas : contexto.respostas.slice(-ultimas)).map((r) => ({
      id: r.id, topicoId: r.topicoId, questaoId: r.questaoId, alternativa: r.alternativa, acertou: r.acertou,
      dificuldade: r.dificuldade, variacaoDominio: r.variacaoDominio, xpConcedido: r.xpConcedido,
      data: r.data, momento: r.momento, enunciado: r.conteudoOriginal.enunciado,
      alternativas: [...r.conteudoOriginal.alternativas], correta: r.conteudoOriginal.correta,
      explicacao: r.conteudoOriginal.explicacao,
    })),
  };
}
