import { act, screen, waitFor, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { gerarHistoricoMatricula } from '../dados/seed-academico';
import type { DadosAcademicos } from '../dominio/tipos';
import { RepositorioApp } from '../dados/repositorio-app';
import { renderizarApp, T_ALG_A } from './renderizar';

describe('7.8 — [CC] Catálogo de graduações e disciplinas publicadas, Busca e filtro, Detalhe acadêmico e ofertas, Acesso às turmas sem automatrícula', () => {
  it('lista graduações e disciplinas publicadas; o rascunho fica oculto, inclusive na busca', async () => {
    const { usuario } = await renderizarApp('/aluno/catalogo', 'u-ana');
    expect(await screen.findByRole('link', { name: 'Algoritmos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Matemática Básica' })).toBeInTheDocument();
    expect(screen.queryByText('Geometria Plana')).toBeNull();
    await usuario.type(screen.getByLabelText('Buscar'), 'geometria');
    expect(await screen.findByText(/Nenhuma graduação ou disciplina encontrada/)).toBeInTheDocument();
  });

  it('busca por nome, busca vazia e filtros de área, nível e período', async () => {
    const { usuario } = await renderizarApp('/aluno/catalogo', 'u-ana');
    await screen.findByRole('link', { name: 'Algoritmos' });
    await usuario.type(screen.getByLabelText('Buscar'), 'inglês');
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Algoritmos' })).toBeNull());
    expect(screen.getByRole('link', { name: 'Inglês Inicial' })).toBeInTheDocument();
    await usuario.clear(screen.getByLabelText('Buscar')); await usuario.type(screen.getByLabelText('Buscar'), 'zzzz');
    expect(await screen.findByText(/Nenhuma graduação ou disciplina encontrada/)).toBeInTheDocument();
    await usuario.clear(screen.getByLabelText('Buscar'));
    await usuario.selectOptions(screen.getByLabelText('Área'), 'Exatas');
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Algoritmos' })).toBeNull());
    expect(screen.getByRole('link', { name: 'Matemática Básica' })).toBeInTheDocument();
    await usuario.selectOptions(screen.getByLabelText('Área'), 'Todas');
    await usuario.selectOptions(screen.getByLabelText('Nível'), 'Avançado');
    expect(await screen.findByText(/Nenhuma graduação ou disciplina encontrada/)).toBeInTheDocument();
    await usuario.selectOptions(screen.getByLabelText('Nível'), 'Todos');
    await usuario.selectOptions(screen.getByLabelText('Período'), '2027.1');
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Inglês Inicial' })).toBeNull()); // só ALG e MAT têm turma em 2027.1
    expect(screen.getByRole('link', { name: 'Algoritmos' })).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(await screen.findByRole('link', { name: 'Inglês Inicial' })).toBeVisible();
    expect(screen.getByLabelText('Período')).toHaveValue('');
  });

  it('detalhe: tópicos e ofertas; Continuar só nas ofertas matriculadas, sem botão de matrícula e sem questões', async () => {
    const { usuario, container } = await renderizarApp('/aluno/catalogo', 'u-bruno');
    await usuario.click(await screen.findByRole('link', { name: 'Algoritmos' }));
    expect(await screen.findByRole('heading', { name: 'Algoritmos' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').map((l) => l.textContent).join('|')).toContain('Variáveis');
    expect(screen.queryByRole('button', { name: /Matricular/ })).toBeNull();
    const ofertas = screen.getAllByRole('listitem').filter((l) => /Turma [AB]/.test(l.textContent ?? '') && /20\d\d\.\d/.test(l.textContent ?? ''));
    const turmaB = ofertas.find((o) => o.textContent!.includes('Turma B'))!;
    expect(within(turmaB).getByRole('link', { name: 'Continuar' })).toBeInTheDocument();
    for (const o of ofertas.filter((x) => !x.textContent!.includes('Turma B'))) {
      expect(within(o).queryByRole('link', { name: 'Continuar' })).toBeNull();
      expect(o).toHaveTextContent('Você não está matriculado nesta turma');
    }
    for (const proibido of ['Uma variável serve para', 'guardar um valor', 'Explicação']) expect(container.textContent).not.toContain(proibido);
  });

  it('professor ausente é indicado na oferta', async () => {
    const { usuario } = await renderizarApp('/aluno/catalogo', 'u-ana', (d) => { d.vinculosProfessor = d.vinculosProfessor.filter((v) => v.turmaId !== 't-alg-b-262'); });
    await usuario.click(await screen.findByRole('link', { name: 'Algoritmos' }));
    expect(await screen.findByText(/ainda não atribuído/)).toBeInTheDocument();
  });

  it('disciplina em rascunho não tem detalhe de catálogo, nem por endereço direto', async () => {
    await renderizarApp('/aluno/catalogo/disciplinas/d-geo', 'u-ana');
    expect(await screen.findByRole('heading', { name: 'Acesso negado' })).toBeInTheDocument();
  });
});

describe('7.9 — [CC] Minhas turmas; [AC] Painel do aluno', () => {
  it('identifica graduação, disciplina, turma e período; ofertas da mesma disciplina têm progressos separados', async () => {
    await renderizarApp('/aluno', 'u-ana');
    const antiga = await screen.findByRole('article', { name: 'Algoritmos turma A 2026.2' });
    const nova = screen.getByRole('article', { name: 'Algoritmos turma A 2027.1' });
    expect(antiga).toHaveTextContent('Sistemas de Informação · Turma A · 2026.2');
    expect(await within(antiga).findByRole('progressbar')).not.toHaveAttribute('aria-valuenow', '0');
    expect(await within(nova).findByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(within(nova).getByText('Sem atividade')).toBeInTheDocument();
    expect(within(antiga).queryByText('Sem atividade')).toBeNull();
  });

  it('matrícula sem respostas mostra progresso zero e Sem atividade, com ação de estudo', async () => {
    await renderizarApp('/aluno', 'u-diego');
    const card = await screen.findByRole('article', { name: 'Algoritmos turma A 2026.2' });
    expect(await within(card).findByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(within(card).getByText('Sem atividade')).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: 'Começar trilha' })).toBeInTheDocument();
  });

  it('turma com conteúdo em rascunho aparece sem ação de estudo', async () => {
    await renderizarApp('/aluno', 'u-bruno', (d) => { d.matriculas.push({ id: 'm-bruno-geo', alunoId: 'u-bruno', turmaId: 't-geo-a-262', data: d.dataVirtual }); });
    const card = await screen.findByRole('article', { name: 'Geometria Plana turma A 2026.2' });
    expect(card).toHaveTextContent('Conteúdo em preparação');
    expect(within(card).queryByRole('link')).toBeNull();
  });

  it('quem não tem matrícula vê a orientação, sem automatrícula', async () => {
    await renderizarApp('/aluno', 'u-ana', (d) => { d.matriculas = d.matriculas.filter((m) => m.alunoId !== 'u-ana'); d.respostas = d.respostas.filter((r) => d.matriculas.some((m) => m.id === r.matriculaId)); });
    expect(await screen.findByText(/A matrícula é feita pela coordenação ou administração/)).toBeInTheDocument();
  });

  it('painel de desempenho da turma: progresso, taxa de acertos, XP e domínio por tópico com a oferta identificada', async () => {
    await renderizarApp(`${T_ALG_A}/desempenho`, 'u-ana');
    expect(await screen.findByRole('heading', { name: 'Desempenho em Algoritmos' })).toBeInTheDocument();
    expect(screen.getByText(/Sistemas de Informação · Turma A · 2026\.2/)).toBeInTheDocument();
    expect(screen.getByText(/Taxa de acertos:/)).toBeInTheDocument();
    expect(screen.getByText('Domínio por tópico')).toBeInTheDocument();
    const dominio = screen.getByRole('list', { name: 'Domínio por tópico' });
    const topicos = within(dominio).getAllByRole('listitem');
    expect(topicos).toHaveLength(3);
    for (const t of topicos) expect(t).toHaveTextContent(/Domínio: \d+/);
    expect(topicos[0]).toHaveTextContent('Variáveis');
  });

  it('desempenho sem respostas indica Sem atividade e taxa zero', async () => {
    await renderizarApp('/aluno/disciplinas/d-alg/turmas/t-alg-a-262/desempenho', 'u-diego');
    expect(await screen.findByText('(Sem atividade)')).toBeInTheDocument();
    expect(screen.getByText(/Taxa de acertos:/)).toHaveTextContent('Taxa de acertos: 0%');
  });
});

describe('Frontend 4 — ação por matrícula, estados e indicadores parciais', () => {
  it.each([
    ['u-diego', 'Começar trilha', 'Sem atividade'], ['u-ana', 'Continuar trilha', 'Em andamento'], ['u-elisa', 'Ver trilha', 'Trilha concluída'],
  ])('%s abre a própria trilha por %s e mantém Desempenho secundário', async (id, acao, estado) => {
    const a = await renderizarApp('/aluno', id);
    const card = await screen.findByRole('article', { name: 'Algoritmos turma A 2026.2' });
    expect(await within(card).findByText(estado)).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: 'Desempenho' })).toHaveAttribute('href', `${T_ALG_A}/desempenho`);
    const antes = JSON.stringify(a.dados());
    await a.usuario.click(within(card).getByRole('link', { name: acao }));
    expect(a.rotaAtual()).toBe(T_ALG_A);
    expect(JSON.stringify(a.dados())).toBe(antes);
  });

  it('respostas erradas com 0% mantêm Em andamento e indicam atividade no desempenho', async () => {
    const a = await renderizarApp('/aluno', 'u-diego', (d) => {
      d.respostas.push(...gerarHistoricoMatricula(d, 'm-diego-alg-a-262', [[1, [false, false]]], { valor: 1000 }));
    });
    const card = await screen.findByRole('article', { name: 'Algoritmos turma A 2026.2' });
    expect(await within(card).findByText('Em andamento')).toBeInTheDocument();
    expect(within(card).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(within(card).getByRole('link', { name: 'Continuar trilha' })).toBeInTheDocument();
    expect(within(card).queryByText('Sem atividade')).toBeNull();
    await a.usuario.click(within(card).getByRole('link', { name: 'Desempenho' }));
    expect(await screen.findByText(/2 respostas registradas/)).toBeInTheDocument();
    expect(screen.getByText(/Taxa de acertos:/)).toHaveTextContent('0%');
    expect(screen.queryByText('(Sem atividade)')).toBeNull();
    await a.usuario.click(screen.getByRole('link', { name: 'Voltar à trilha' }));
    expect(a.rotaAtual()).toBe(T_ALG_A);
  });

  it('carregamento dos indicadores não inventa zero, início ou estado sem atividade', async () => {
    const original = RepositorioApp.prototype.consultarPainelAluno;
    const liberar: (() => Promise<void>)[] = [];
    const sonda = vi.spyOn(RepositorioApp.prototype, 'consultarPainelAluno').mockImplementation(function (this: RepositorioApp) {
      const real = original.call(this);
      return new Promise((resolve) => { liberar.push(async () => resolve(await real)); });
    });
    try {
      await renderizarApp('/aluno', 'u-diego');
      const card = await screen.findByRole('article', { name: 'Algoritmos turma A 2026.2' });
      expect(within(card).getByRole('status')).toHaveTextContent('Carregando indicadores');
      expect(within(card).queryByRole('progressbar')).toBeNull();
      expect(within(card).queryByRole('link', { name: 'Começar trilha' })).toBeNull();
      expect(within(card).queryByText('Sem atividade')).toBeNull();
      await act(async () => { await Promise.all(liberar.map((f) => f())); });
      expect(await within(card).findByRole('link', { name: 'Começar trilha' })).toBeInTheDocument();
    } finally { sonda.mockRestore(); }
  });

  it('falha de indicadores é um erro, sem zero ou ação principal presumidos', async () => {
    const sonda = vi.spyOn(RepositorioApp.prototype, 'consultarPainelAluno').mockRejectedValue(new Error('Consulta indisponível'));
    try {
      await renderizarApp('/aluno', 'u-diego');
      const card = await screen.findByRole('article', { name: 'Algoritmos turma A 2026.2' });
      expect(await within(card).findByRole('alert')).toHaveTextContent('Consulta indisponível');
      expect(within(card).queryByRole('progressbar')).toBeNull();
      expect(within(card).queryByText('Sem atividade')).toBeNull();
      expect(within(card).queryByRole('link', { name: 'Começar trilha' })).toBeNull();
    } finally { sonda.mockRestore(); }
  });
});

describe('Frontend 5 — orientação da trilha e conquistas sob demanda', () => {
  it.each([[60, 30, 't-cond'], [30, 30, 't-var']] as const)('recomendação usa proxima.topicoId, conserva ordem com domínios %s/%s', async (primeiro, segundo, recomendado) => {
    const original = RepositorioApp.prototype.consultarTrilha;
    const sonda = vi.spyOn(RepositorioApp.prototype, 'consultarTrilha').mockImplementation(async function (this: RepositorioApp, alvo) {
      const real = await original.call(this, alvo);
      const topicos = real.dados.trilha.topicos.map((t, i) => ({ ...t, desbloqueado: i < 2, dominado: false, dominio: i === 0 ? primeiro : i === 1 ? segundo : 0 }));
      return { ...real, dados: { ...real.dados, trilha: { ...real.dados.trilha, topicos }, proxima: { ...real.dados.proxima!, topicoId: recomendado, topicoTitulo: topicos.find((t) => t.topicoId === recomendado)!.titulo } } };
    });
    try {
      const a = await renderizarApp(T_ALG_A, 'u-diego');
      const lista = await screen.findByRole('list', { name: 'Tópicos da disciplina' });
      const itens = within(lista).getAllByRole('listitem');
      expect(itens.map((e) => within(e).getByText(/Variáveis|Condicionais|Laços/, { selector: 'strong' }).textContent)).toEqual(['Variáveis', 'Condicionais', 'Laços de repetição']);
      const tag = within(lista).getByText('Próximo recomendado');
      expect(tag.closest('li')).toHaveTextContent(recomendado === 't-var' ? 'Variáveis' : 'Condicionais');
      expect(within(itens[2]).queryByRole('link', { name: 'Materiais' })).toBeNull();
      expect(within(itens[0]).getByRole('link', { name: 'Materiais' })).toBeInTheDocument();
      expect(a.dados().respostas.filter((r) => r.matriculaId === 'm-diego-alg-a-262')).toEqual([]);
    } finally { sonda.mockRestore(); }
  });

  it('ausência de próxima atividade sem conclusão não inventa recomendação ou Estudar', async () => {
    const original = RepositorioApp.prototype.consultarTrilha;
    const sonda = vi.spyOn(RepositorioApp.prototype, 'consultarTrilha').mockImplementation(async function (this: RepositorioApp, alvo) {
      const real = await original.call(this, alvo); return { ...real, dados: { ...real.dados, proxima: null } };
    });
    try {
      await renderizarApp(T_ALG_A, 'u-diego');
      expect(await screen.findByText('Não há questões disponíveis no momento.')).toBeInTheDocument();
      expect(screen.queryByText('Próximo recomendado')).toBeNull();
      expect(screen.queryByRole('link', { name: 'Estudar' })).toBeNull();
      expect(screen.queryByText(/Trilha concluída nesta turma/)).toBeNull();
    } finally { sonda.mockRestore(); }
  });

  it.each(['u-diego', 'u-elisa'])('conquistas de %s começam recolhidas, exibem dados originais e expandir não grava', async (id) => {
    const a = await renderizarApp(T_ALG_A, id);
    const resumo = await screen.findByText(/Conquistas \(/, { selector: 'summary' });
    const detalhes = resumo.closest('details')!;
    expect(detalhes).not.toHaveAttribute('open');
    const antes = JSON.stringify(a.dados());
    await a.usuario.click(resumo);
    expect(detalhes).toHaveAttribute('open');
    if (id === 'u-diego') {
      expect(resumo).toHaveTextContent('Conquistas (0)');
      expect(within(detalhes).getByText('Nenhuma conquista ainda.')).toBeVisible();
    } else {
      expect(within(detalhes).getByText(/Sequência de 7 dias/)).toBeVisible();
      expect(detalhes.textContent).toMatch(/\d{2}\/\d{2}\/2026/);
      expect(screen.queryByText('Próximo recomendado')).toBeNull();
      expect(screen.queryByRole('link', { name: 'Estudar' })).toBeNull();
    }
    await a.usuario.click(resumo);
    expect(detalhes).not.toHaveAttribute('open');
    expect(JSON.stringify(a.dados())).toBe(antes);
  });
});

describe('Frontend 6 — sessão estável, envio e foco', () => {
  it('resumo contém só os cinco elementos e alternativas variáveis mantêm ordem; selecionar não envia', async () => {
    const a = await renderizarApp(`${T_ALG_A}/sessao`, 'u-diego', (d) => {
      d.questoes.filter((q) => q.disciplinaId === 'd-alg').forEach((q) => q.alternativas.push('Uma alternativa adicional com texto longo '.repeat(8)));
    });
    const qTexto = (await screen.findByRole('heading', { level: 2 })).textContent;
    const q = a.dados().questoes.find((q) => q.enunciado === qTexto)!;
    const resumo = screen.getByRole('complementary', { name: 'Contexto da sessão' });
    expect(resumo).toHaveTextContent('Algoritmos'); expect(resumo).toHaveTextContent('Turma A · 2026.2');
    expect(within(resumo).getByRole('progressbar')).toHaveAttribute('aria-label', 'Progresso da matrícula');
    expect(within(resumo).getByRole('link', { name: 'Ver trilha' })).toHaveAttribute('href', T_ALG_A);
    for (const proibido of ['Sistemas de Informação', 'XP', 'Sequência', 'Conquistas', 'Materiais', 'Marcos']) expect(resumo).not.toHaveTextContent(proibido);
    expect(screen.getAllByRole('radio').map((r) => r.getAttribute('aria-label'))).toEqual(q.alternativas);
    const antes = JSON.stringify(a.dados());
    expect(screen.getByRole('button', { name: 'Responder' })).toBeDisabled();
    await a.usuario.click(screen.getAllByRole('radio')[0]);
    expect(screen.getByText('Selecionada')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Responder' })).toBeEnabled();
    expect(screen.queryByText('Alternativa correta')).toBeNull();
    expect(screen.queryByText(q.explicacao)).toBeNull();
    expect(JSON.stringify(a.dados())).toBe(antes);
  });

  it('duplo clique no mesmo envio não grava duas respostas e controles ficam bloqueados durante a operação', async () => {
    const original = RepositorioApp.prototype.responderQuestao;
    let liberar: (() => Promise<void>) | undefined;
    const sonda = vi.spyOn(RepositorioApp.prototype, 'responderQuestao').mockImplementation(function (this: RepositorioApp, ...args) {
      return new Promise((resolve, reject) => { liberar = async () => { try { resolve(await original.apply(this, args)); } catch (e) { reject(e); } }; });
    });
    try {
      const a = await renderizarApp(`${T_ALG_A}/sessao`, 'u-diego');
      await a.usuario.click((await screen.findAllByRole('radio'))[0]);
      const botao = screen.getByRole('button', { name: 'Responder' });
      await act(async () => { botao.click(); botao.click(); });
      expect(sonda).toHaveBeenCalledTimes(1);
      expect(botao).toBeDisabled(); expect(screen.getAllByRole('radio').every((r) => (r as HTMLInputElement).disabled || r.closest('fieldset')!.disabled)).toBe(true);
      await act(async () => { await liberar!(); });
      await screen.findByRole('region', { name: 'Resultado da resposta' });
      expect(a.dados().respostas.filter((r) => r.matriculaId === 'm-diego-alg-a-262')).toHaveLength(1);
      await a.usuario.click(screen.getByRole('button', { name: 'Responder' }));
      expect(sonda).toHaveBeenCalledTimes(1);
    } finally { sonda.mockRestore(); }
  });

  it('falha no envio mantém questão e seleção, sem feedback de sucesso ou alteração de dados', async () => {
    const sonda = vi.spyOn(RepositorioApp.prototype, 'responderQuestao').mockRejectedValueOnce(new Error('Falha de gravação'));
    try {
      const a = await renderizarApp(`${T_ALG_A}/sessao`, 'u-diego');
      const radio = (await screen.findAllByRole('radio'))[0];
      const titulo = screen.getByRole('heading', { level: 2 }).textContent;
      const antes = JSON.stringify(a.dados());
      await a.usuario.click(radio); await a.usuario.click(screen.getByRole('button', { name: 'Responder' }));
      expect(await screen.findByRole('alert')).toHaveTextContent('Falha de gravação');
      expect(radio).toBeChecked(); expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(titulo!);
      expect(screen.queryByRole('region', { name: 'Resultado da resposta' })).toBeNull();
      expect(JSON.stringify(a.dados())).toBe(antes);
    } finally { sonda.mockRestore(); }
  });

  it('feedback e seleção sobrevivem à reautorização e ao resize, sem envio extra; avanço explícito foca o enunciado', async () => {
    const a = await renderizarApp(`${T_ALG_A}/sessao`, 'u-diego');
    await responder(a.usuario, a.dados, true);
    const texto = screen.getByRole('heading', { level: 2, name: a.dados().respostas.slice(-1)[0].conteudoOriginal.enunciado }).textContent;
    const feedback = screen.getByRole('region', { name: 'Resultado da resposta' }).textContent;
    a.avisarOutraAba();
    expect(screen.queryByRole('region', { name: 'Resultado da resposta' })).toBeNull(); // nenhuma exposição durante reautorização
    expect(await screen.findByRole('region', { name: 'Resultado da resposta' })).toHaveTextContent(feedback!);
    expect(screen.getByRole('heading', { level: 2, name: texto! })).toBeInTheDocument();
    expect(screen.getAllByRole('radio').some((r) => (r as HTMLInputElement).checked)).toBe(true);
    act(() => { window.dispatchEvent(new Event('resize')); });
    expect(screen.getByRole('region', { name: 'Resultado da resposta' })).toHaveTextContent(feedback!);
    expect(a.dados().respostas.filter((r) => r.matriculaId === 'm-diego-alg-a-262')).toHaveLength(1);
    await a.usuario.click(screen.getByRole('button', { name: 'Próxima questão' }));
    await waitFor(() => expect(document.getElementById('enunciado')).toHaveFocus());
    expect(screen.queryByRole('region', { name: 'Resultado da resposta' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Responder' })).toBeDisabled();
    expect(a.dados().respostas.filter((r) => r.matriculaId === 'm-diego-alg-a-262')).toHaveLength(1);
  });

  it('o estado local preservado não volta a ser exibido depois da revogação de acesso', async () => {
    const a = await renderizarApp(`${T_ALG_A}/sessao`, 'u-diego');
    await responder(a.usuario, a.dados, true);
    const admin = a.outraAba('u-renata');
    await admin.definirAtivo('u-diego', false, a.dados().revisao);
    a.avisarOutraAba();
    expect(await screen.findByRole('button', { name: 'Aluno' })).toBeInTheDocument();
    expect(screen.queryByRole('radio')).toBeNull();
    expect(screen.queryByRole('region', { name: 'Resultado da resposta' })).toBeNull();
    expect(a.dados().respostas.filter((r) => r.matriculaId === 'm-diego-alg-a-262')).toHaveLength(1);
  });
});

/** Responde pela interface usando o gabarito do armazenamento (a tela nunca o mostra antes). */
async function responder(usuario: UserEvent, dados: () => DadosAcademicos, certo: boolean) {
  const enunciado = (await screen.findByRole('heading', { level: 2, name: (n) => n.length > 0 })).textContent!;
  const q = dados().questoes.find((x) => x.enunciado === enunciado)!;
  const alvo = certo ? q.correta : (q.correta + 1) % q.alternativas.length;
  await usuario.click(await screen.findByLabelText(q.alternativas[alvo]));
  await usuario.click(screen.getByRole('button', { name: 'Responder' }));
  await screen.findByText(certo ? /Você acertou!/ : /Você errou\./);
}

describe('7.10 — [AA] Inicialização e retomada, Feedback imediato, Revisão sugerida, Desbloqueio, Conclusão; [GA] Exibição de gamificação', () => {
  it('início sem diagnóstico: questão Fácil do primeiro tópico, demais tópicos bloqueados', async () => {
    const { usuario } = await renderizarApp(T_ALG_A, 'u-diego');
    expect(await screen.findByRole('heading', { name: 'Algoritmos' })).toBeInTheDocument();
    const itens = screen.getAllByRole('listitem').filter((l) => /Bloqueado|Desbloqueado|Dominado/.test(l.textContent ?? ''));
    expect(itens.map((i) => /Bloqueado/.test(i.textContent!) ? 'B' : 'D')).toEqual(['D', 'B', 'B']);
    await usuario.click(screen.getByRole('link', { name: 'Estudar' }));
    expect(await screen.findByText(/Tópico:/)).toHaveTextContent('Variáveis');
    expect(screen.getByText('Fácil')).toBeInTheDocument();
    expect(screen.queryByText('Explicação')).toBeNull(); // sem gabarito ou explicação antes de responder
  });

  it('erro: mostra a alternativa correta, a explicação e a variação; dois erros seguidos sugerem revisar o material', async () => {
    const { usuario, dados } = await renderizarApp(`${T_ALG_A}/sessao`, 'u-diego');
    await responder(usuario, dados, false);
    expect(screen.getByText(/Alternativa correta:/)).toBeInTheDocument();
    expect(screen.getByText(/Explicação:/)).toBeInTheDocument();
    expect(document.querySelector('.feedback')).toHaveTextContent('Domínio em Variáveis: 0 → 0 (+0)');
    expect(screen.queryByRole('note')).toBeNull();
    await usuario.click(screen.getByRole('button', { name: 'Próxima questão' }));
    await responder(usuario, dados, false);
    expect(await screen.findByRole('note')).toHaveTextContent(/errou duas questões seguidas em Variáveis/);
    await usuario.click(screen.getByRole('link', { name: 'Revisar materiais de Variáveis' }));
    expect(await screen.findByRole('heading', { name: 'Variáveis' })).toBeInTheDocument();
    const primeiroMaterial = dados().disciplinas.find((d) => d.id === 'd-alg')!.topicos[0].materiais[0].titulo;
    expect(screen.getByRole('heading', { name: primeiroMaterial })).toBeInTheDocument();
    expect(dados().respostas.filter((r) => r.matriculaId === 'm-diego-alg-a-262')).toHaveLength(2);
  });

  it('acertar até dominar o tópico mostra o desbloqueio do seguinte e atualiza o progresso', async () => {
    const { usuario, dados } = await renderizarApp(`${T_ALG_A}/sessao`, 'u-diego', (d) => {
      d.respostas.push(...gerarHistoricoMatricula(d, 'm-diego-alg-a-262', [[1, Array<boolean>(6).fill(true)]], { valor: 1000 }));
    });
    await responder(usuario, dados, true);
    expect(screen.getByText(/Você dominou/)).toHaveTextContent('Tópico desbloqueado: Condicionais');
    expect(screen.getByText(/\+30 XP/)).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Próxima questão' }));
    expect(await screen.findByText(/Tópico:/)).toHaveTextContent('Condicionais');
  });

  it('conclusão: última resposta conclui a trilha, concede a conquista e não é aprovação acadêmica', async () => {
    const { usuario, dados } = await renderizarApp(`${T_ALG_A}/sessao`, 'u-diego', (d) => {
      d.respostas.push(...gerarHistoricoMatricula(d, 'm-diego-alg-a-262', [[1, Array<boolean>(20).fill(true)]], { valor: 1000 }));
    });
    await responder(usuario, dados, true);
    expect(await screen.findByText(/Trilha concluída nesta turma! Progresso: 100%/)).toBeInTheDocument();
    expect(screen.getByText(/Conquista desbloqueada:/)).toHaveTextContent('Trilha concluída');
    await usuario.click(within(screen.getByRole('region', { name: 'Resultado da resposta' })).getByRole('link', { name: 'Ver trilha' }));
    expect(await screen.findByText(/não representa aprovação acadêmica/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Estudar' })).toBeNull();
  });

  it('duas turmas da mesma disciplina não interferem; a gamificação aparece na oferta correta', async () => {
    const { usuario, dados } = await renderizarApp('/aluno/disciplinas/d-alg/turmas/t-alg-a-271/sessao', 'u-ana');
    const respostasAntigas = () => dados().respostas.filter((r) => r.matriculaId === 'm-ana-alg-a-262');
    const antes = JSON.stringify(respostasAntigas());
    const xpAntigo = respostasAntigas().reduce((s, r) => s + r.xpConcedido, 0);
    await responder(usuario, dados, true);
    expect(JSON.stringify(respostasAntigas())).toBe(antes);
    await usuario.click(within(screen.getByRole('complementary', { name: 'Contexto da sessão' })).getByRole('link', { name: 'Ver trilha' }));
    const nova = await screen.findByRole('region', { name: 'Gamificação da turma A de 2027.1' });
    await usuario.click(within(nova).getByText(/Conquistas \(/, { selector: 'summary' }));
    expect(nova).toHaveTextContent('10 XP');
    expect(nova).toHaveTextContent('Primeira questão');
    await usuario.click(screen.getByRole('link', { name: 'Voltar às turmas' }));
    const card = await screen.findByRole('article', { name: 'Algoritmos turma A 2026.2' });
    await usuario.click(within(card).getByRole('link', { name: 'Continuar trilha' }));
    const antiga = await screen.findByRole('region', { name: 'Gamificação da turma A de 2026.2' });
    expect(antiga).toHaveTextContent(`${xpAntigo} XP`);
    expect(antiga).not.toHaveTextContent('Sequência: 1 dia');
  });

  it('IDs aninhados incompatíveis na sessão, e tópico bloqueado nos materiais, não expõem conteúdo', async () => {
    const a = await renderizarApp('/aluno/disciplinas/d-ing/turmas/t-alg-a-262/sessao', 'u-ana');
    expect(await screen.findByRole('heading', { name: 'Acesso negado' })).toBeInTheDocument();
    a.unmount();
    await renderizarApp(`${T_ALG_A}/topicos/t-lacos`, 'u-diego');
    expect(await screen.findByText(/não encontrado ou ainda bloqueado/)).toBeInTheDocument();
  });

  it('a retomada preserva o estado: o progresso gravado reaparece ao reabrir a trilha', async () => {
    const { usuario } = await renderizarApp(T_ALG_A, 'u-elisa');
    const barra = await screen.findByRole('progressbar');
    expect(barra).toHaveAttribute('aria-valuenow', '100');
    await usuario.click(screen.getByText(/Conquistas \(/, { selector: 'summary' }));
    expect(screen.getByText(/Sequência de 7 dias/)).toBeInTheDocument();
  });
});
