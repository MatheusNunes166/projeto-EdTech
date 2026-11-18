import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { calcularMediasTurma, contextosDaTurma } from '../desempenho/indicadores-academicos';
import { exibirMedias } from '../desempenho/apresentacao';
import { gerarHistoricoMatricula } from '../dados/seed-academico';
import type { DadosAcademicos } from '../dominio/tipos';
import { criarSeedAcademico } from '../dados/seed-academico';
import { renderizarApp } from './renderizar';

describe('7.7 — [PA] Escopo de gestão da coordenação; [OA] Gestão de graduação pela coordenação, Matrícula administrativa, Unicidade da matrícula, Vínculos de professores às turmas', () => {
  it('lista apenas as turmas dos cursos coordenados', async () => {
    await renderizarApp('/coordenacao/gestao', 'u-lucia');
    expect(await screen.findByRole('link', { name: 'Gerir turma A de Matemática Básica (2026.2)' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gerir turma A de Geometria Plana (2026.2)' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Algoritmos/ })).toBeNull();
  });

  it('matricula aluno e atribui professor em turma do seu curso', async () => {
    const { usuario, dados } = await renderizarApp('/coordenacao/gestao/turmas/t-mat-a-271', 'u-lucia');
    expect(await screen.findByRole('heading', { name: /Matemática Básica — Turma A/ })).toBeInTheDocument();
    await screen.findByText('Nenhum aluno matriculado');
    await usuario.click(await screen.findByRole('button', { name: 'Nova matrícula' }));
    await usuario.selectOptions(await screen.findByLabelText('Aluno a matricular'), 'Diego Martins');
    await usuario.click(screen.getByRole('button', { name: 'Matricular' }));
    expect(await screen.findByText(/Matrícula realizada./)).toBeInTheDocument();
    expect(within(within(screen.getByRole('region', { name: 'Matrículas' })).getByRole('list')).getByText('Diego Martins')).toBeInTheDocument(); // único matriculado
    expect(dados().matriculas.filter((m) => m.turmaId === 't-mat-a-271')).toHaveLength(1);

    await usuario.click(await screen.findByRole('button', { name: 'Nova atribuição docente' }));
    await usuario.selectOptions(await screen.findByLabelText('Professor a atribuir'), 'Marcos Silva');
    await usuario.click(screen.getByRole('button', { name: 'Atribuir professor' }));
    expect(await screen.findByRole('button', { name: 'Remover Marcos Silva' })).toBeInTheDocument();
    expect(dados().vinculosProfessor).toContainEqual({ professorId: 'u-marcos', turmaId: 't-mat-a-271' });
  });

  it('matrícula repetida informa que o estudo foi preservado e não reinicia nada', async () => {
    const { usuario, dados } = await renderizarApp('/coordenacao/gestao/turmas/t-mat-a-262', 'u-lucia');
    const antes = JSON.stringify(dados().respostas);
    const total = dados().matriculas.length;
    await usuario.click(await screen.findByRole('button', { name: 'Nova matrícula' }));
    await usuario.selectOptions(await screen.findByLabelText('Aluno a matricular'), 'Bruno Lima');
    await usuario.click(screen.getByRole('button', { name: 'Matricular' }));
    expect(await screen.findByText(/já estava matriculado.*preservado/)).toBeInTheDocument();
    expect(dados().matriculas).toHaveLength(total);
    expect(JSON.stringify(dados().respostas)).toBe(antes);
  });

  it('remove professor; remover o vínculo não apaga matrículas nem respostas', async () => {
    const { usuario, dados } = await renderizarApp('/coordenacao/gestao/turmas/t-mat-a-262', 'u-lucia');
    const antes = dados();
    await usuario.click(await screen.findByRole('button', { name: 'Remover Carla Dias' }));
    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(dados()).toEqual(antes);
    await usuario.click(screen.getByRole('button', { name: 'Remover Carla Dias' }));
    await usuario.click(screen.getByRole('button', { name: 'Confirmar remoção' }));
    await waitFor(() => expect(dados().vinculosProfessor.some((v) => v.turmaId === 't-mat-a-262')).toBe(false));
    expect(dados().matriculas).toEqual(antes.matriculas);
    expect(dados().respostas).toEqual(antes.respostas);
    expect(dados().vinculosProfessor).toContainEqual({ professorId: 'u-carla', turmaId: 't-mat-a-271' });
  });

  it('nega remoção após revogação ocorrida com a confirmação aberta', async () => {
    const { usuario, dados, outraAba } = await renderizarApp('/coordenacao/gestao/turmas/t-alg-a-262', 'u-carla');
    await usuario.click(await screen.findByRole('button', { name: 'Remover Marcos Silva' }));
    await outraAba('u-renata').definirVinculoCoordenador({ coordenadorId: 'u-carla', graduacaoId: 'g-si' }, false, dados().revisao);
    const antes = dados();
    await usuario.click(screen.getByRole('button', { name: 'Confirmar remoção' }));
    expect(await screen.findByRole('heading', { name: 'Acesso negado' })).toBeInTheDocument();
    expect(dados()).toEqual(antes);
  });

  it('tentativa de gerir turma de outro curso, por endereço direto, é negada sem exibir dados', async () => {
    await renderizarApp('/coordenacao/gestao/turmas/t-alg-a-262', 'u-lucia');
    expect(await screen.findByRole('heading', { name: 'Acesso negado' })).toBeInTheDocument();
    expect(screen.queryByText(/Ana Souza/)).toBeNull();
  });

  it('o Administrador gere qualquer turma pela mesma tela', async () => {
    await renderizarApp('/admin/gestao/turmas/t-alg-a-262', 'u-renata');
    expect(await screen.findByRole('heading', { name: /Algoritmos — Turma A/ })).toBeInTheDocument();
    expect((await within(await screen.findByRole('region', { name: 'Matrículas' })).findAllByText('Ana Souza')).length).toBeGreaterThan(0);
  });
});

/** Disciplina de cinco tópicos, turma com Ana (4 de 5 dominados = 80%) e Diego (0%): média 40%. */
function cenario80e0(d: DadosAcademicos) {
  const topicos = ['a', 'b', 'c', 'd', 'e'];
  d.disciplinas.push({ id: 'd-x', graduacaoId: 'g-lm', codigo: 'X5', nome: 'Cinco Tópicos', descricaoCurta: '', descricao: '', nivel: 'Iniciante', status: 'publicado',
    topicos: topicos.map((t) => ({ id: `tx-${t}`, titulo: `Tópico ${t}`, materiais: [] })) });
  for (const t of topicos) {
    for (const dif of ['facil', 'medio', 'dificil'] as const) {
      d.questoes.push({ id: `qx-${t}-${dif}`, disciplinaId: 'd-x', topicoId: `tx-${t}`, dificuldade: dif, enunciado: `Pergunta ${t} ${dif}`, alternativas: ['certa', 'errada'], correta: 0, explicacao: 'x', revisao: 0 });
    }
  }
  d.turmas.push({ id: 't-x', codigo: 'X', disciplinaId: 'd-x', periodoLetivoId: 'p-2026-2' });
  d.matriculas.push({ id: 'm-x-ana', alunoId: 'u-ana', turmaId: 't-x', data: d.dataVirtual }, { id: 'm-x-diego', alunoId: 'u-diego', turmaId: 't-x', data: d.dataVirtual });
  d.respostas.push(...gerarHistoricoMatricula(d, 'm-x-ana', [[1, Array<boolean>(28).fill(true)]], { valor: 1000 }));
}

describe('7.14 — [AC] Painel do coordenador, Progresso médio por turma, Domínio médio por tópico da turma, Precisão e exibição das médias', () => {
  it('uma linha por turma, com progresso médio 80 e 0 → 40% e domínio médio dos tópicos', async () => {
    const { usuario } = await renderizarApp('/coordenacao', 'u-lucia', cenario80e0);
    const linha = await screen.findByRole('listitem', { name: /Cinco Tópicos/ });
    expect(linha).toHaveTextContent('40%');
    expect(linha).toHaveTextContent('2'); // matrículas
    await usuario.click(within(linha).getByText('Domínio por tópico'));
    for (const topico of ['a', 'b', 'c', 'd', 'e']) {
      const rotulo = within(linha).getByText('Tópico ' + topico);
      expect(rotulo.parentElement).toHaveTextContent(topico === 'e' ? '0' : '45');
      expect(rotulo).toBeVisible();
    }
  });

  it('turma sem alunos mostra Sem dados e nenhum indicador inválido', async () => {
    await renderizarApp('/coordenacao', 'u-lucia');
    const linha = await screen.findByRole('listitem', { name: /Matemática Básica.*2027\.1/ });
    expect(linha).toHaveTextContent('Nenhum aluno matriculado');
    expect(within(linha).getAllByText('Sem dados')).toHaveLength(2);
    expect(linha.textContent).not.toMatch(/NaN|Infinity/);
  });

  it('o painel reproduz o cálculo exato das médias (inclusive quem não iniciou) sobre o seed', async () => {
    await renderizarApp('/coordenacao', 'u-carla');
    const seed = criarSeedAcademico();
    const esperado = exibirMedias(calcularMediasTurma(contextosDaTurma(seed, 't-alg-a-262')));
    expect(esperado.situacao).toBe('calculadas');
    const linha = await screen.findByRole('listitem', { name: /Algoritmos.*A.*2026\.2/ });
    if (esperado.situacao === 'calculadas') expect(linha).toHaveTextContent(`${esperado.progressoMedio}%`);
    expect(linha).toHaveTextContent('3'); // Ana, Elisa e Diego
  });

  it('filtros só selecionam linhas por turma: nenhuma média global nem respostas detalhadas', async () => {
    const { usuario, container } = await renderizarApp('/coordenacao', 'u-lucia');
    await screen.findByRole('listitem', { name: /Geometria Plana/ });
    expect(container.textContent).not.toMatch(/média geral|média global|média combinada/i);
    for (const proibido of ['Ana Souza', 'Bruno Lima', 'Quanto é', 'conteudoOriginal']) expect(container.textContent).not.toContain(proibido);
    await usuario.selectOptions(screen.getByLabelText('Período'), '2027.1');
    await waitFor(() => expect(screen.queryByRole('listitem', { name: /Geometria Plana/ })).toBeNull());
    expect(within(screen.getByRole('list', { name: 'Turmas e indicadores' })).getAllByRole('listitem')).toHaveLength(1);
    await usuario.selectOptions(screen.getByLabelText('Disciplina'), 'Geometria Plana');
    expect(await screen.findByText('Nenhuma turma encontrada para os filtros.')).toBeVisible();
    expect(screen.queryByText('Sem dados')).toBeNull();
  });

  it('dois papéis na mesma pessoa: o painel de coordenação traz só os cursos coordenados e dá acesso à gestão', async () => {
    const { usuario } = await renderizarApp('/coordenacao', 'u-carla');
    expect((await screen.findAllByRole('listitem', { name: /Algoritmos/ })).length).toBeGreaterThan(0);
    expect(screen.queryByRole('listitem', { name: /Matemática Básica/ })).toBeNull(); // leciona, mas não coordena
    await usuario.selectOptions(screen.getByLabelText('Graduação'), 'Sistemas de Informação');
    await usuario.selectOptions(screen.getByLabelText('Disciplina'), 'Algoritmos');
    await usuario.selectOptions(screen.getByLabelText('Período'), '2026.2');
    await usuario.selectOptions(screen.getByLabelText('Turma'), 't-alg-a-262');
    await usuario.click(screen.getByRole('link', { name: 'Gerir Algoritmos · Turma A · 2026.2' }));
    expect(await screen.findByRole('heading', { name: 'Algoritmos — Turma A' })).toBeVisible();
    await usuario.click(screen.getByRole('link', { name: 'Voltar aos indicadores' }));
    expect(await screen.findByLabelText('Turma')).toHaveValue('t-alg-a-262');
    expect(screen.getByLabelText('Disciplina')).toHaveValue('d-alg');
  });
});

it('remove seleção incompatível ao trocar a graduação e mantém escopo autorizado', async () => {
  const { usuario, dados } = await renderizarApp('/coordenacao?graduacao=g-si&disciplina=d-alg&periodo=p-2026-2&turma=t-alg-a-262', 'u-carla', (d) => {
    d.vinculosCoordenador.push({ coordenadorId: 'u-carla', graduacaoId: 'g-lm' });
  });
  const antes = dados();
  await usuario.selectOptions(await screen.findByLabelText('Graduação'), 'Licenciatura em Matemática');
  expect(screen.getByLabelText('Disciplina')).toHaveValue('');
  expect(screen.getByLabelText('Turma')).toHaveValue('');
  expect(screen.queryByRole('listitem', { name: /Algoritmos/ })).toBeNull();
  expect(screen.getByRole('listitem', { name: /Matemática Básica/ })).toBeVisible();
  expect(dados()).toEqual(antes);
});
