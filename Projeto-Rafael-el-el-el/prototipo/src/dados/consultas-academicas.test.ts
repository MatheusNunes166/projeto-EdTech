import { describe, expect, it } from 'vitest';
import { ambienteConsultas } from '../testes/ambiente-consultas-academicas';
import { recusaSemEfeitos } from '../testes/ambiente-comandos-academicos';
import { podeExecutar } from '../dominio/autorizacao';
import type { PedidoCandidatos } from './contratos-consultas-academicas';

function semCampos(valor: unknown, proibidos: string[]) {
  if (valor && typeof valor === 'object') {
    for (const [campo, item] of Object.entries(valor)) {
      expect(proibidos).not.toContain(campo);
      semCampos(item, proibidos);
    }
  }
}
const privados = ['usuarios', 'respostas', 'questoes', 'correta', 'explicacao', 'alternativas', 'materiais', 'conteudoOriginal', 'email', 'versaoSeed', 'versaoSchema'];
const indicadores = ['progresso', 'dominio', 'xp', 'taxaAcertos', 'medias', 'sequenciaDias', 'conquistas'];

describe('2.10 — [CC] catálogo/metadados; [PA] escopo e minimização; D2/D7', () => {
  it('catálogo publicado e detalhes contêm somente metadados, professores e a própria condição de matrícula', async () => {
    const a = ambienteConsultas(); await a.repo.entrar('u-ana'); const antes = a.bruto();
    const catalogo = await a.repo.consultarCatalogo();
    expect(catalogo.dados.flatMap((g) => g.disciplinas.map((d) => d.id))).toEqual(['d-alg', 'd-dir']);
    const detalhe = await a.repo.consultarMetadadosDisciplina({ disciplinaId: 'd-alg', graduacaoId: 'g-si' });
    expect(detalhe.dados.topicos).toEqual([{ id: 'tp-1', titulo: 'tp-1' }, { id: 'tp-2', titulo: 'tp-2' }]);
    expect(detalhe.dados.ofertas.find((o) => o.turma.id === 't-26')!.professores).toEqual([{ id: 'u-carla', nome: 'Carla' }]);
    expect(detalhe.dados.ofertas.find((o) => o.turma.id === 't-b')!.professores).toEqual([]);
    expect((await a.repo.consultarMetadadosTurma({ turmaId: 't-26' })).dados.acesso).toEqual({ situacao: 'matriculado', matriculaId: 'm-ana-26' });
    await recusaSemEfeitos(a, () => a.repo.consultarMetadadosTurma({ turmaId: 't-psi' }), 'ACESSO_NEGADO');
    const grad = await a.repo.consultarMetadadosGraduacao('g-si');
    for (const retorno of [catalogo, detalhe, grad]) {
      semCampos(retorno, [...privados, ...indicadores]);
      expect(JSON.stringify(retorno)).not.toContain('RESPOSTA_PRIVADA_B');
      expect(JSON.stringify(retorno)).not.toContain('EMAIL_PRIVADO_B');
      expect(JSON.stringify(retorno)).not.toContain('u-bruno');
      expect(JSON.stringify(retorno)).not.toContain('MATERIAL_RESTRITO');
    }
    expect(a.bruto()).toBe(antes); expect(a.persistencia.gravar).not.toHaveBeenCalled();
  });

  it('oferta publicada sem matrícula informa ausência de matrícula sem criar vínculo', async () => {
    const a = ambienteConsultas((d) => { d.matriculas = d.matriculas.filter((m) => m.id !== 'm-ana-b'); });
    await a.repo.entrar('u-ana');
    expect((await a.repo.consultarMetadadosTurma({ turmaId: 't-b' })).dados.acesso).toEqual({ situacao: 'sem-matricula' });
    expect(a.persistencia.gravar).not.toHaveBeenCalled();
  });

  it('busca por graduação/disciplina combina área, nível e período e restringe as ofertas', async () => {
    const a = ambienteConsultas(); await a.repo.entrar('u-ana');
    const c = await a.repo.consultarCatalogo({ busca: 'algoritmos', area: 'Tecnologia', nivel: 'Iniciante', periodoLetivoId: 'p-27' });
    expect(c.dados).toHaveLength(1);
    expect(c.dados[0].disciplinas[0].ofertas.map((o) => o.turma.id)).toEqual(['t-27']);
    expect((await a.repo.consultarCatalogo({ busca: 'sistemas de informação' })).dados[0].disciplinas[0].id).toBe('d-alg');
    expect((await a.repo.consultarCatalogo({ busca: 'sem correspondência' })).dados).toEqual([]);
  });

  it('minhas turmas mantém ofertas separadas, inclusive rascunho, sem fabricar progresso/XP', async () => {
    const a = ambienteConsultas((d) => { d.disciplinas.find((x) => x.id === 'd-dir')!.status = 'rascunho'; });
    await a.repo.entrar('u-ana');
    const retorno = await a.repo.consultarMinhasTurmas();
    expect(retorno.dados.map((t) => t.matricula.id)).toEqual(['m-ana-26', 'm-ana-27', 'm-ana-b', 'm-ana-dir']);
    expect(retorno.dados.find((t) => t.turma.id === 't-dir')!.conteudoDisponivel).toBe(false);
    expect(retorno.dados.map((t) => t.periodoLetivo.id)).toContain('p-27');
    semCampos(retorno, [...privados, ...indicadores]);
    expect(JSON.stringify(retorno)).not.toContain('m-bruno-b');
    await a.repo.entrar('u-bruno');
    expect((await a.repo.consultarMinhasTurmas()).dados.map((t) => t.matricula.id)).toEqual(['m-bruno-b']);
  });

  it.each(['u-carla', 'u-admin', 'u-helena'])('catálogo e minhas turmas exigem função Aluno (%s)', async (id) => {
    const a = ambienteConsultas(); await a.repo.entrar(id);
    await recusaSemEfeitos(a, () => a.repo.consultarCatalogo(), 'ACESSO_NEGADO');
    await recusaSemEfeitos(a, () => a.repo.consultarMinhasTurmas(), 'ACESSO_NEGADO');
  });

  it('lista docente e matriculados exigem turma exata; autoria compartilhada não concede alunos/respostas de B', async () => {
    const a = ambienteConsultas(); await a.repo.entrar('u-carla');
    expect((await a.repo.consultarTurmasDocentes()).dados.map((t) => t.turma.id)).toEqual(['t-26']);
    expect((await a.repo.consultarMatriculados({ turmaId: 't-26' })).dados).toEqual([
      { matriculaId: 'm-ana-26', data: '2026-11-17', aluno: { id: 'u-ana', nome: 'Ana' } },
    ]);
    await recusaSemEfeitos(a, () => a.repo.consultarMatriculados({ turmaId: 't-b' }), 'ACESSO_NEGADO');
    const conteudo = await a.repo.consultarConteudoEditavel({ disciplinaId: 'd-alg' });
    expect(conteudo.dados.questoes).toHaveLength(6);
    expect(conteudo.dados.questoes[0].correta).toBe(0);
    expect(conteudo.dados.disciplina.topicos[0].materiais[0].conteudo).toBe('MATERIAL_RESTRITO');
    semCampos(conteudo, ['respostas', 'usuarios', 'matriculas', 'conteudoOriginal', 'revisoesTextuais']);
    expect(JSON.stringify(conteudo)).not.toContain('HISTORICO_PRIVADO_B');
    expect(podeExecutar(a.ler(), 'u-carla', { acao: 'consultar-historico-docente', recurso: { tipo: 'matricula', matriculaId: 'm-bruno-b' } })).toBe(false);
  });

  it('coordenação só recebe estrutura/matriculados do seu curso e não recebe autoria nem histórico por coordenar', async () => {
    const a = ambienteConsultas(); await a.repo.entrar('u-carla');
    const estrutura = await a.repo.consultarEstruturaAdministravel();
    expect(estrutura.dados.graduacoes.map((g) => g.id)).toEqual(['g-dir']);
    expect(estrutura.dados.disciplinas.map((d) => d.id)).toEqual(['d-dir']);
    expect(estrutura.dados.turmas.map((t) => t.turma.id)).toEqual(['t-dir']);
    semCampos(estrutura, [...privados, ...indicadores]);
    const matriculados = await a.repo.consultarMatriculados({ turmaId: 't-dir' });
    expect(matriculados.dados.map((m) => m.aluno.id)).toEqual(['u-ana']);
    semCampos(matriculados, [...privados, ...indicadores]);
    await recusaSemEfeitos(a, () => a.repo.consultarConteudoEditavel({ disciplinaId: 'd-dir' }), 'ACESSO_NEGADO');
    await recusaSemEfeitos(a, () => a.repo.consultarEstruturaAdministravel({ tipo: 'graduacao', graduacaoId: 'g-si' }), 'ACESSO_NEGADO');
    expect(podeExecutar(a.ler(), 'u-carla', { acao: 'consultar-historico-docente', recurso: { tipo: 'matricula', matriculaId: 'm-ana-dir' } })).toBe(false);
  });

  it('admin consulta estrutura global e conteúdo; Coordenador sem vínculo e Professor sem turma recebem listas vazias', async () => {
    const a = ambienteConsultas(); await a.repo.entrar('u-admin');
    expect((await a.repo.consultarEstruturaAdministravel()).dados.graduacoes).toHaveLength(3);
    expect((await a.repo.consultarConteudoEditavel({ disciplinaId: 'd-dir' })).dados.questoes).toHaveLength(6);
    await a.repo.entrar('u-coord');
    expect((await a.repo.consultarEstruturaAdministravel()).dados).toEqual({ graduacoes: [], disciplinas: [], turmas: [], periodosLetivos: [] });
    await a.repo.entrar('u-prof');
    expect((await a.repo.consultarTurmasDocentes()).dados).toEqual([]);
  });

  it('Responsável consulta somente alunos vinculados e suas ofertas, sem colegas, matrícula ou histórico', async () => {
    const a = ambienteConsultas(); await a.repo.entrar('u-helena');
    expect((await a.repo.consultarAlunosVinculados()).dados).toEqual([{ id: 'u-ana', nome: 'Ana' }]);
    const ofertas = await a.repo.consultarTurmasAlunoVinculado('u-ana');
    expect(ofertas.dados.map((t) => t.turma.id)).toEqual(['t-26', 't-27', 't-b', 't-dir']);
    semCampos(ofertas, [...privados, ...indicadores, 'matricula', 'matriculaId']);
    expect(JSON.stringify(ofertas)).not.toContain('u-bruno');
    await recusaSemEfeitos(a, () => a.repo.consultarTurmasAlunoVinculado('u-bruno'), 'ACESSO_NEGADO');
    await recusaSemEfeitos(a, () => a.repo.consultarMatriculados({ turmaId: 't-26' }), 'ACESSO_NEGADO');
  });

  it.each(['u-ana', 'u-admin', 'u-helena', 'u-carla'])('nega IDs aninhados incompatíveis e recursos inexistentes para %s', async (id) => {
    const a = ambienteConsultas(); await a.repo.entrar(id);
    await recusaSemEfeitos(a, () => a.repo.consultarMetadadosDisciplina({ disciplinaId: 'd-alg', graduacaoId: 'g-dir' }), 'ACESSO_NEGADO');
    await recusaSemEfeitos(a, () => a.repo.consultarMetadadosTurma({ turmaId: 't-26', disciplinaId: 'd-dir' }), 'ACESSO_NEGADO');
    await recusaSemEfeitos(a, () => a.repo.consultarMatriculados({ turmaId: 't-26', graduacaoId: 'g-dir' }), 'ACESSO_NEGADO');
    await recusaSemEfeitos(a, () => a.repo.consultarConteudoEditavel({ disciplinaId: 'inexistente' }), 'ACESSO_NEGADO');
    await recusaSemEfeitos(a, () => a.repo.consultarEstruturaAdministravel({ tipo: 'turma', turmaId: 't-dir', disciplinaId: 'd-alg' }), 'ACESSO_NEGADO');
  });

  it('conteúdo em rascunho é consultável pelo autor autorizado, mas não pelo catálogo', async () => {
    const a = ambienteConsultas(); await a.repo.entrar('u-admin');
    expect((await a.repo.consultarConteudoEditavel({ disciplinaId: 'd-psi' })).dados.disciplina.status).toBe('rascunho');
    await a.repo.entrar('u-ana');
    await recusaSemEfeitos(a, () => a.repo.consultarMetadadosDisciplina({ disciplinaId: 'd-psi' }), 'ACESSO_NEGADO');
  });

  it('retornos e revisão de consulta são cópias, não autorização reutilizável ou referências para mutar a base', async () => {
    const a = ambienteConsultas(); await a.repo.entrar('u-admin'); const antes = a.bruto();
    const leitura = await a.repo.consultarConteudoEditavel({ disciplinaId: 'd-alg' });
    leitura.dados.questoes[0].correta = 1;
    leitura.dados.disciplina.topicos[0].materiais[0].conteudo = 'MUDOU';
    leitura.revisao = 100;
    expect(a.bruto()).toBe(antes);
    expect((await a.repo.consultarConteudoEditavel({ disciplinaId: 'd-alg' })).dados.questoes[0].correta).toBe(0);
  });

  it('campos extras não permitem pedir histórico ou forjar função/autor nas consultas', async () => {
    const a = ambienteConsultas(); await a.repo.entrar('u-ana');
    await recusaSemEfeitos(a, () => a.repo.consultarCatalogo({ incluirQuestoes: true } as {}), 'VALIDACAO_REJEITADA');
    await recusaSemEfeitos(a, () => a.repo.consultarMetadadosTurma({ turmaId: 't-26', autorId: 'u-admin' } as { turmaId: string }), 'VALIDACAO_REJEITADA');
    await a.repo.entrar('u-carla');
    await recusaSemEfeitos(a, () => a.repo.consultarMatriculados({ turmaId: 't-26', incluirRespostas: true } as { turmaId: string }), 'VALIDACAO_REJEITADA');
  });

  it('todas as consultas exigem sessão e não gravam ao negar', async () => {
    const a = ambienteConsultas();
    const consultas = [() => a.repo.consultarCatalogo(), () => a.repo.consultarMinhasTurmas(),
      () => a.repo.consultarMetadadosGraduacao('g-si'), () => a.repo.consultarMetadadosDisciplina({ disciplinaId: 'd-alg' }),
      () => a.repo.consultarMetadadosTurma({ turmaId: 't-26' }), () => a.repo.consultarEstruturaAdministravel(),
      () => a.repo.consultarMatriculados({ turmaId: 't-26' }), () => a.repo.consultarTurmasDocentes(),
      () => a.repo.consultarAlunosVinculados(), () => a.repo.consultarTurmasAlunoVinculado('u-ana'),
      () => a.repo.consultarCandidatos({ finalidade: 'matricula', turma: { turmaId: 't-dir' } }),
      () => a.repo.consultarConteudoEditavel({ disciplinaId: 'd-alg' })];
    for (const consultar of consultas) await recusaSemEfeitos(a, consultar, 'SEM_SESSAO');
  });

  it('salvamento cadastral da disciplina não devolve materiais ao Coordenador', async () => {
    const a = ambienteConsultas(); await a.repo.entrar('u-carla');
    const d = (await a.repo.consultarEstruturaAdministravel()).dados.disciplinas[0];
    const { id: _id, status: _status, identidadeProtegida, ...campos } = d;
    expect(typeof identidadeProtegida).toBe("boolean");
    const salvo = await a.repo.editarDisciplina({ disciplinaId: d.id }, { ...campos, nome: 'Civil atualizada' }, 0);
    semCampos(salvo, [...privados, 'topicos']);
    expect(salvo.status).toBe('publicado');
    expect(a.ler().disciplinas.find((x) => x.id === d.id)!.topicos).toHaveLength(2);
  });
});

describe('2.10 — Candidatos elegíveis com finalidade e recurso autorizados; D2', () => {
  it.each([
    [{ finalidade: 'matricula', turma: { turmaId: 't-dir' } }, 'aluno', ['u-ana', 'u-bruno']],
    [{ finalidade: 'docencia', turma: { turmaId: 't-dir' } }, 'professor', ['u-carla', 'u-prof']],
    [{ finalidade: 'coordenacao', graduacaoId: 'g-dir' }, 'coordenador', ['u-carla', 'u-coord']],
    [{ finalidade: 'responsavel' }, 'responsavel', ['u-helena']],
  ] as const)('retorna apenas identidade e função pertinente a %j', async (pedido, funcao, ids) => {
    const a = ambienteConsultas(); await a.repo.entrar('u-admin');
    const candidatos = await a.repo.consultarCandidatos(pedido);
    expect(candidatos.dados.map((c) => c.id)).toEqual(ids);
    for (const c of candidatos.dados) {
      expect(Object.keys(c).sort()).toEqual(['funcoes', 'id', 'nome']);
      expect(c.funcoes).toEqual([funcao]);
    }
    semCampos(candidatos, [...privados, ...indicadores]);
  });

  it('candidatos a Aluno do Responsável acompanham a elegibilidade do comando, incluindo Aluno inativo', async () => {
    const a = ambienteConsultas(); await a.repo.entrar('u-admin');
    const retorno = await a.repo.consultarCandidatos({ finalidade: 'aluno-responsavel' });
    expect(retorno.dados.map((u) => u.id)).toEqual(['u-ana', 'u-bruno', 'u-inativo']);
  });

  it('Coordenador consulta alunos e professores elegíveis apenas para turmas de seu curso', async () => {
    const a = ambienteConsultas(); await a.repo.entrar('u-carla');
    expect((await a.repo.consultarCandidatos({ finalidade: 'matricula', turma: { turmaId: 't-dir' } })).dados).toHaveLength(2);
    expect((await a.repo.consultarCandidatos({ finalidade: 'docencia', turma: { turmaId: 't-dir' } })).dados).toHaveLength(2);
    for (const pedido of [
      { finalidade: 'docencia', turma: { turmaId: 't-26' } }, { finalidade: 'coordenacao', graduacaoId: 'g-dir' },
      { finalidade: 'responsavel' }, { finalidade: 'aluno-responsavel' },
    ] satisfies PedidoCandidatos[]) await recusaSemEfeitos(a, () => a.repo.consultarCandidatos(pedido), 'ACESSO_NEGADO');
  });

  it('nega candidatos em referência inexistente/incompatível e pedidos com campos excedentes', async () => {
    const a = ambienteConsultas(); await a.repo.entrar('u-admin');
    await recusaSemEfeitos(a, () => a.repo.consultarCandidatos({ finalidade: 'docencia', turma: { turmaId: 'inexistente' } }), 'ACESSO_NEGADO');
    await recusaSemEfeitos(a, () => a.repo.consultarCandidatos({ finalidade: 'docencia', turma: { turmaId: 't-dir', graduacaoId: 'g-si' } }), 'ACESSO_NEGADO');
    await recusaSemEfeitos(a, () => a.repo.consultarCandidatos({ finalidade: 'coordenacao', graduacaoId: 'inexistente' }), 'ACESSO_NEGADO');
    await recusaSemEfeitos(a, () => a.repo.consultarCandidatos({ finalidade: 'responsavel', incluirHistorico: true } as PedidoCandidatos), 'VALIDACAO_REJEITADA');
  });
});
