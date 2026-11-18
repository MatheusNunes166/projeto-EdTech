import { describe, expect, it } from 'vitest';
import { recusaSemEfeitos } from '../testes/ambiente-comandos-academicos';
import { ambienteEstudo, questao, responderComo } from '../testes/ambiente-estudo';

const Q = questao('tp-1', 'facil');
type Amb = ReturnType<typeof ambienteEstudo>;
const erros = async (a: Amb, aluno: string, matricula: string, n: number) => { for (let i = 0; i < n; i++) await responderComo(a, aluno, matricula, Q, 1); };

describe('5.9 — [AC] Painéis por função; [PA] Acesso restrito por função e vínculo', () => {
  describe('aluno na própria turma', () => {
    it('painel por oferta, com progressos separados para o mesmo aluno e disciplina em períodos distintos', async () => {
      const a = ambienteEstudo();
      await responderComo(a, 'u-ana', 'm-ana-26', questao('tp-1', 'dificil'));
      const { dados, revisao } = await a.repo.consultarPainelAluno();
      expect(revisao).toBe(a.ler().revisao);
      expect(dados.map((i) => [i.contexto.turma.id, i.contexto.periodoLetivo.nome, i.totalRespostas, i.xp])).toEqual([['t-26', '2026.2', 1, 30], ['t-27', '2027.1', 0, 0]]);
      expect(dados[1]).toMatchObject({ progresso: 0, taxaAcertos: 0, totalRespostas: 0, sequenciaDias: 0, ultimaAtividade: null, conquistas: [] });
      expect(dados[0].contexto).toMatchObject({ graduacao: { nome: 'Sistemas de Informação' }, disciplina: { nome: 'Algoritmos' } });
    });

    it('indicadores de uma matrícula; matrícula de outra pessoa é negada', async () => {
      const a = ambienteEstudo(); await responderComo(a, 'u-ana', 'm-ana-26', Q);
      const { dados } = await a.repo.consultarIndicadoresAluno({ matriculaId: 'm-ana-26' });
      expect(dados).toMatchObject({ matriculaId: 'm-ana-26', xp: 10, totalRespostas: 1, taxaAcertos: 100, conquistas: [expect.objectContaining({ id: 'primeira-questao' })] });
      await a.repo.entrar('u-bruno');
      await recusaSemEfeitos(a, () => a.repo.consultarIndicadoresAluno({ matriculaId: 'm-ana-26' }), 'ACESSO_NEGADO');
    });

    it('turma com conteúdo em rascunho não entra no painel; só Aluno consulta', async () => {
      const a = ambienteEstudo((d) => { d.disciplinas.find((x) => x.id === 'd-alg')!.status = 'rascunho'; });
      await a.repo.entrar('u-ana');
      expect((await a.repo.consultarPainelAluno()).dados).toEqual([]);
      for (const quem of ['u-carla', 'u-admin', 'u-helena']) { await a.repo.entrar(quem); await recusaSemEfeitos(a, () => a.repo.consultarPainelAluno(), 'ACESSO_NEGADO'); }
    });
  });

  describe('professor nas suas turmas', () => {
    it('lista todos os matriculados (inclusive sem respostas) com indicadores, situação e médias da turma', async () => {
      const a = ambienteEstudo(); await erros(a, 'u-ana', 'm-ana-26', 3);
      await a.repo.entrar('u-carla');
      const { dados } = await a.repo.consultarIndicadoresDocencia({ turmaId: 't-26' });
      expect(dados).toMatchObject({ turmaId: 't-26', quantidadeMatriculados: 2, contexto: { disciplina: { nome: 'Algoritmos' }, periodoLetivo: { nome: '2026.2' } } });
      expect(dados.matriculados.map((m) => [m.nome, m.situacao, m.totalRespostas, m.taxaAcertos])).toEqual([['Ana', 'precisa-de-atencao', 3, 0], ['Bruno', 'sem-atividade', 0, 0]]);
      expect(dados.medias).toMatchObject({ situacao: 'calculadas', progressoMedio: 0 });
    });

    it('turma vazia: zero matrículas e médias Sem dados, sem dados de outra turma da mesma disciplina', async () => {
      const a = ambienteEstudo(); await erros(a, 'u-ana', 'm-ana-26', 1);
      await a.repo.entrar('u-prof2');
      const { dados } = await a.repo.consultarIndicadoresDocencia({ turmaId: 't-b' });
      expect(dados).toMatchObject({ quantidadeMatriculados: 0, matriculados: [], medias: { situacao: 'sem-dados' } });
    });

    it('nega turma não vinculada, mesmo com a mesma disciplina, e papéis sem docência', async () => {
      const a = ambienteEstudo();
      await a.repo.entrar('u-prof2');
      await recusaSemEfeitos(a, () => a.repo.consultarIndicadoresDocencia({ turmaId: 't-26' }), 'ACESSO_NEGADO');
      for (const quem of ['u-ana', 'u-helena', 'u-coord', 'u-prof']) { await a.repo.entrar(quem); await recusaSemEfeitos(a, () => a.repo.consultarIndicadoresDocencia({ turmaId: 't-26' }), 'ACESSO_NEGADO'); }
      await a.repo.entrar('u-carla');
      await recusaSemEfeitos(a, () => a.repo.consultarIndicadoresDocencia({ turmaId: 't-26', disciplinaId: 'd-dir' }), 'ACESSO_NEGADO');
    });

    it('detalhe docente traz só as últimas até 10 respostas; o aluno vê todo o próprio histórico', async () => {
      const a = ambienteEstudo(); await erros(a, 'u-ana', 'm-ana-26', 12);
      const proprio = await a.repo.consultarHistoricoEstudo({ matriculaId: 'm-ana-26' });
      expect(proprio.dados.respostas).toHaveLength(12);
      await a.repo.entrar('u-carla');
      const docente = (await a.repo.consultarHistoricoAlunoDocente({ matriculaId: 'm-ana-26' })).dados.respostas;
      expect(docente.map((r) => r.momento)).toEqual(proprio.dados.respostas.slice(2).map((r) => r.momento));
    });
  });

  describe('coordenador nos cursos vinculados', () => {
    const prep = (d: import('../dominio/tipos').DadosAcademicos) => { d.matriculas.push({ id: 'm-ana-dir', alunoId: 'u-ana', turmaId: 't-dir', data: d.dataVirtual }); };

    it('Carla professora de SI e coordenadora de Direito: painéis distintos, cada um no seu escopo', async () => {
      const a = ambienteEstudo(prep); await a.repo.entrar('u-carla');
      expect((await a.repo.consultarTurmasDocentes()).dados.map((t) => t.turma.id)).toEqual(['t-26']);
      const { dados } = await a.repo.consultarIndicadoresCoordenacao();
      expect(dados.turmas.map((t) => t.turmaId)).toEqual(['t-dir']);
      expect(dados.turmas[0]).toMatchObject({ quantidadeMatriculados: 1, contexto: { graduacao: { nome: 'Direito' } }, medias: { situacao: 'calculadas', progressoMedio: 0 } });
    });

    it('oferta vazia da coordenação mostra Sem dados; filtros por graduação/disciplina/turma mantêm uma linha por turma', async () => {
      const a = ambienteEstudo((d) => { d.vinculosCoordenador.push({ coordenadorId: 'u-carla', graduacaoId: 'g-si' }); });
      await a.repo.entrar('u-carla');
      const todas = (await a.repo.consultarIndicadoresCoordenacao()).dados.turmas;
      const oferta = todas.find((t) => t.turmaId === 't-26')!;
      expect(oferta.topicos.length).toBeGreaterThan(0);
      expect(oferta.topicos.every((t) => typeof t.titulo === 'string' && Object.keys(t).length === 2)).toBe(true);
      expect(todas.map((t) => t.turmaId).sort()).toEqual(['t-27', 't-26', 't-b', 't-dir'].sort());
      expect(todas.find((t) => t.turmaId === 't-dir')!.medias).toEqual({ situacao: 'sem-dados' });
      expect(Object.keys((await a.repo.consultarIndicadoresCoordenacao()).dados)).toEqual(['turmas']); // sem média global
      expect((await a.repo.consultarIndicadoresCoordenacao({ tipo: 'graduacao', graduacaoId: 'g-si' })).dados.turmas.map((t) => t.turmaId).sort()).toEqual(['t-26', 't-27', 't-b']);
      expect((await a.repo.consultarIndicadoresCoordenacao({ tipo: 'disciplina', disciplinaId: 'd-alg' })).dados.turmas).toHaveLength(3);
      expect((await a.repo.consultarIndicadoresCoordenacao({ tipo: 'turma', turmaId: 't-26' })).dados.turmas.map((t) => t.turmaId)).toEqual(['t-26']);
    });

    it('não expõe respostas, enunciados nem indicadores individuais; nega curso não coordenado', async () => {
      const a = ambienteEstudo(prep); await erros(a, 'u-ana', 'm-ana-26', 2);
      await a.repo.entrar('u-carla');
      const bruto = JSON.stringify(await a.repo.consultarIndicadoresCoordenacao());
      for (const proibido of ['Texto original', 'conteudoOriginal', 'respostas', 'Ana', 'xp', 'taxaAcertos']) expect(bruto).not.toContain(proibido);
      await recusaSemEfeitos(a, () => a.repo.consultarIndicadoresCoordenacao({ tipo: 'graduacao', graduacaoId: 'g-si' }), 'ACESSO_NEGADO');
      await recusaSemEfeitos(a, () => a.repo.consultarIndicadoresCoordenacao({ tipo: 'turma', turmaId: 't-26' }), 'ACESSO_NEGADO');
      for (const quem of ['u-ana', 'u-prof2', 'u-helena']) { await a.repo.entrar(quem); await recusaSemEfeitos(a, () => a.repo.consultarIndicadoresCoordenacao(), 'ACESSO_NEGADO'); }
    });

    it('a coordenação sem vínculo docente não obtém o painel docente', async () => {
      const a = ambienteEstudo(); await a.repo.entrar('u-coord');
      await recusaSemEfeitos(a, () => a.repo.consultarIndicadoresDocencia({ turmaId: 't-26' }), 'ACESSO_NEGADO');
    });
  });

  describe('responsável nos alunos vinculados', () => {
    it('duas ofertas separadas, sem histórico detalhado; sem respostas: progresso e sequência zero, última atividade ausente', async () => {
      const a = ambienteEstudo(); await responderComo(a, 'u-ana', 'm-ana-26', questao('tp-1', 'dificil'));
      await a.repo.entrar('u-helena');
      const { dados } = await a.repo.consultarIndicadoresResponsavel('u-ana');
      expect(dados.turmas.map((t) => [t.contexto.periodoLetivo.nome, t.progresso, t.sequenciaDias, t.ultimaAtividade])).toEqual([
        ['2026.2', 0, 1, a.ler().dataVirtual], ['2027.1', 0, 0, null]]);
      const bruto = JSON.stringify(dados);
      for (const proibido of ['Texto original', 'conteudoOriginal', 'enunciado', 'xpConcedido', 'u-bruno']) expect(bruto).not.toContain(proibido);
    });

    it('nega aluno não vinculado, funções sem vínculo e outra pessoa', async () => {
      const a = ambienteEstudo(); await a.repo.entrar('u-helena');
      await recusaSemEfeitos(a, () => a.repo.consultarIndicadoresResponsavel('u-bruno'), 'ACESSO_NEGADO');
      for (const quem of ['u-ana', 'u-carla', 'u-admin']) { await a.repo.entrar(quem); await recusaSemEfeitos(a, () => a.repo.consultarIndicadoresResponsavel('u-ana'), 'ACESSO_NEGADO'); }
    });
  });

  describe('totais administrativos', () => {
    it('pessoas distintas e por função (função cumulativa conta uma vez no total e uma em cada função); entidades', async () => {
      const a = ambienteEstudo(); await a.repo.entrar('u-admin');
      const { dados } = await a.repo.consultarIndicadoresAdministracao();
      expect(dados.pessoas).toEqual({ total: 8, porFuncao: { aluno: 2, professor: 3, coordenador: 2, admin: 1, responsavel: 1 } });
      expect(dados).toMatchObject({ graduacoes: 3, disciplinas: { publicadas: 1, rascunho: 2 }, periodosLetivos: 2, turmas: 5, matriculas: 3 });
      expect(Object.keys(dados.disciplinas)).toEqual(['rascunho', 'publicadas']); // graduação não é rascunho/publicada
    });

    it('Carla com duas funções soma 1 pessoa e 2 funções; só o Administrador consulta', async () => {
      const a = ambienteEstudo((d) => { d.usuarios = d.usuarios.filter((u) => ['u-ana', 'u-carla', 'u-admin'].includes(u.id)); d.vinculosResponsavel = []; d.vinculosProfessor = d.vinculosProfessor.filter((v) => v.professorId === 'u-carla'); d.matriculas = d.matriculas.filter((m) => m.alunoId === 'u-ana'); });
      await a.repo.entrar('u-admin');
      expect((await a.repo.consultarIndicadoresAdministracao()).dados.pessoas).toEqual({ total: 3, porFuncao: { aluno: 1, professor: 1, coordenador: 1, admin: 1, responsavel: 0 } });
      for (const quem of ['u-carla', 'u-ana']) { await a.repo.entrar(quem); await recusaSemEfeitos(a, () => a.repo.consultarIndicadoresAdministracao(), 'ACESSO_NEGADO'); }
    });
  });
});
