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
    await usuario.selectOptions(await screen.findByLabelText('Aluno a matricular'), 'Diego Martins');
    await usuario.click(screen.getByRole('button', { name: 'Matricular' }));
    expect(await screen.findByText('Matrícula realizada.')).toBeInTheDocument();
    expect(within(within(screen.getByRole('region', { name: 'Matrículas' })).getByRole('list')).getByText('Diego Martins')).toBeInTheDocument(); // único matriculado
    expect(dados().matriculas.filter((m) => m.turmaId === 't-mat-a-271')).toHaveLength(1);

    await usuario.selectOptions(screen.getByLabelText('Professor a atribuir'), 'Marcos Silva');
    await usuario.click(screen.getByRole('button', { name: 'Atribuir professor' }));
    expect(await screen.findByRole('button', { name: 'Remover Marcos Silva' })).toBeInTheDocument();
    expect(dados().vinculosProfessor).toContainEqual({ professorId: 'u-marcos', turmaId: 't-mat-a-271' });
  });

  it('matrícula repetida informa que o estudo foi preservado e não reinicia nada', async () => {
    const { usuario, dados } = await renderizarApp('/coordenacao/gestao/turmas/t-mat-a-262', 'u-lucia');
    const antes = JSON.stringify(dados().respostas);
    const total = dados().matriculas.length;
    await usuario.selectOptions(await screen.findByLabelText('Aluno a matricular'), 'Bruno Lima');
    await usuario.click(screen.getByRole('button', { name: 'Matricular' }));
    expect(await screen.findByText(/já estava matriculado.*preservado/)).toBeInTheDocument();
    expect(dados().matriculas).toHaveLength(total);
    expect(JSON.stringify(dados().respostas)).toBe(antes);
  });

  it('remove professor; remover o vínculo não apaga matrículas nem respostas', async () => {
    const { usuario, dados } = await renderizarApp('/coordenacao/gestao/turmas/t-mat-a-262', 'u-lucia');
    await usuario.click(await screen.findByRole('button', { name: 'Remover Carla Dias' }));
    await waitFor(() => expect(dados().vinculosProfessor.some((v) => v.turmaId === 't-mat-a-262')).toBe(false));
    expect(dados().matriculas.some((m) => m.turmaId === 't-mat-a-262')).toBe(true);
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
    await renderizarApp('/coordenacao', 'u-lucia', cenario80e0);
    const linha = await screen.findByRole('row', { name: /Cinco Tópicos/ });
    expect(linha).toHaveTextContent('40%');
    expect(linha).toHaveTextContent('2'); // matrículas
    expect(within(linha).getByText(/45 · 45 · 45 · 45 · 0/)).toBeInTheDocument(); // (90+0)/2 nos quatro dominados
  });

  it('turma sem alunos mostra Sem dados e nenhum indicador inválido', async () => {
    await renderizarApp('/coordenacao', 'u-lucia');
    const linha = await screen.findByRole('row', { name: /Matemática Básica.*2027\.1/ });
    expect(linha).toHaveTextContent('Nenhum aluno matriculado');
    expect(within(linha).getAllByText('Sem dados')).toHaveLength(2);
    expect(linha.textContent).not.toMatch(/NaN|Infinity/);
  });

  it('o painel reproduz o cálculo exato das médias (inclusive quem não iniciou) sobre o seed', async () => {
    await renderizarApp('/coordenacao', 'u-carla');
    const seed = criarSeedAcademico();
    const esperado = exibirMedias(calcularMediasTurma(contextosDaTurma(seed, 't-alg-a-262')));
    expect(esperado.situacao).toBe('calculadas');
    const linha = await screen.findByRole('row', { name: /Algoritmos.*A.*2026\.2/ });
    if (esperado.situacao === 'calculadas') expect(linha).toHaveTextContent(`${esperado.progressoMedio}%`);
    expect(linha).toHaveTextContent('3'); // Ana, Elisa e Diego
  });

  it('filtros só selecionam linhas por turma: nenhuma média global nem respostas detalhadas', async () => {
    const { usuario, container } = await renderizarApp('/coordenacao', 'u-lucia');
    await screen.findByRole('row', { name: /Geometria Plana/ });
    expect(container.textContent).not.toMatch(/média geral|média global|média combinada/i);
    for (const proibido of ['Ana Souza', 'Bruno Lima', 'Quanto é', 'conteudoOriginal']) expect(container.textContent).not.toContain(proibido);
    await usuario.selectOptions(screen.getByLabelText('Período'), '2027.1');
    await waitFor(() => expect(screen.queryByRole('row', { name: /Geometria Plana/ })).toBeNull());
    expect(screen.getAllByRole('row')).toHaveLength(2); // cabeçalho + MAT 2027.1
  });

  it('dois papéis na mesma pessoa: o painel de coordenação traz só os cursos coordenados e dá acesso à gestão', async () => {
    const { usuario } = await renderizarApp('/coordenacao', 'u-carla');
    expect((await screen.findAllByRole('row', { name: /Algoritmos/ })).length).toBeGreaterThan(0);
    expect(screen.queryByRole('row', { name: /Matemática Básica/ })).toBeNull(); // leciona, mas não coordena
    await usuario.click(screen.getAllByRole('link', { name: 'Gestão acadêmica' })[0]);
    expect(await screen.findByRole('heading', { name: 'Gestão acadêmica' })).toBeInTheDocument();
  });
});
