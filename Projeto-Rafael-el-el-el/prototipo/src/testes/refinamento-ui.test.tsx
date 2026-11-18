import { act, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RepositorioApp } from '../dados/repositorio-app';
import { renderizarApp, T_ALG_A } from './renderizar';

describe('Refinamento de navegação e interação', () => {
  it('restaura os quatro critérios do catálogo no retorno e no histórico sem gravar dados', async () => {
    const a = await renderizarApp('/aluno/catalogo', 'u-ana');
    await screen.findByRole('link', { name: 'Algoritmos' });
    const antes = a.dados();
    await a.usuario.type(screen.getByLabelText('Buscar'), 'Algoritmos');
    await a.usuario.selectOptions(screen.getByLabelText('Área'), 'Tecnologia');
    await a.usuario.selectOptions(screen.getByLabelText('Nível'), 'Iniciante');
    await a.usuario.selectOptions(screen.getByLabelText('Período'), 'p-2026-2');
    await a.usuario.click(await screen.findByRole('link', { name: 'Algoritmos' }));
    await a.usuario.click(await screen.findByRole('link', { name: 'Voltar ao catálogo' }));
    await screen.findByLabelText('Buscar');
    expect(screen.getByLabelText('Buscar')).toHaveValue('Algoritmos');
    expect(screen.getByLabelText('Área')).toHaveValue('Tecnologia');
    expect(screen.getByLabelText('Nível')).toHaveValue('Iniciante');
    expect(screen.getByLabelText('Período')).toHaveValue('p-2026-2');
    await act(() => a.router.navigate(-1));
    expect(await screen.findByRole('link', { name: 'Voltar ao catálogo' })).toHaveAttribute('href', expect.stringContaining('busca=Algoritmos'));
    await act(() => a.router.navigate(1));
    expect(await screen.findByLabelText('Buscar')).toHaveValue('Algoritmos');
    await a.usuario.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(screen.getByLabelText('Buscar')).toHaveValue('');
    expect(a.dados()).toEqual(antes);
  });

  it('fecha Menu com Escape no acionador e nos destinos, devolvendo foco sem efeitos', async () => {
    const a = await renderizarApp('/admin', 'u-renata');
    await screen.findByRole('heading', { name: 'Visão geral' });
    const antes = a.dados();
    const menu = screen.getByRole('button', { name: 'Seções da área' });
    await a.usuario.click(menu);
    await a.usuario.keyboard('{Escape}');
    expect(menu).toHaveAttribute('aria-expanded', 'false');
    expect(menu).toHaveFocus();
    await a.usuario.click(menu);
    within(screen.getByRole('navigation', { name: 'Menu principal' })).getByRole('link', { name: 'Pessoas' }).focus();
    await a.usuario.keyboard('{Escape}');
    expect(menu).toHaveAttribute('aria-expanded', 'false');
    expect(menu).toHaveFocus();
    expect(a.rotaAtual()).toBe('/admin');
    expect(a.dados()).toEqual(antes);
  });

  it('busca pessoas sem acentos, distingue resultado vazio e mantém o cadastro intacto', async () => {
    const a = await renderizarApp('/admin/usuarios', 'u-renata');
    const busca = await screen.findByRole('searchbox', { name: 'Buscar em pessoas cadastradas' });
    const antes = a.dados();
    await a.usuario.type(busca, 'lucia');
    const lista = screen.getByRole('list', { name: 'Pessoas cadastradas' });
    expect(within(lista).getAllByRole('listitem')).toHaveLength(1);
    expect(within(lista).getByText('Lúcia Ferraz')).toBeVisible();
    await a.usuario.clear(busca);
    await a.usuario.type(busca, 'registro inexistente');
    expect(within(lista).queryByRole('listitem')).toBeNull();
    expect(screen.getByText(/Nenhum registro encontrado/)).toBeVisible();
    await a.usuario.click(screen.getByRole('button', { name: 'Limpar busca' }));
    expect(within(lista).getAllByRole('listitem')).toHaveLength(antes.usuarios.length);
    expect(a.dados()).toEqual(antes);
  });

  it('filtrar o banco não descarta a questão em edição nem o rascunho conjunto', async () => {
    const a = await renderizarApp('/professor/disciplinas/d-alg/conteudo', 'u-marcos');
    await screen.findByRole('heading', { name: 'Conteúdo de Algoritmos' });
    const antes = a.dados();
    const q = antes.questoes.find((q) => q.disciplinaId === 'd-alg')!;
    await a.usuario.click(screen.getByRole('button', { name: 'Banco de questões' }));
    await a.usuario.click(screen.getByRole('button', { name: 'Editar questão ' + q.id }));
    await a.usuario.type(screen.getByLabelText('Enunciado'), ' Texto revisado.');
    await a.usuario.type(screen.getByRole('searchbox', { name: 'Buscar em questões' }), 'zzzz nenhum item');
    expect(screen.getByLabelText('Enunciado')).toHaveValue(q.enunciado + ' Texto revisado.');
    expect(screen.getByText('Edição pendente')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeEnabled();
    expect(screen.getByRole('list', { name: 'Questões' })).toBeEmptyDOMElement();
    expect(a.dados()).toEqual(antes);
    await a.usuario.click(screen.getByRole('link', { name: 'Voltar às turmas' }));
    await a.usuario.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByLabelText('Enunciado')).toHaveValue(q.enunciado + ' Texto revisado.');
  });

  it('retorno da sessão por URL direta mantém a matrícula e não registra resposta', async () => {
    const a = await renderizarApp(T_ALG_A + '/sessao', 'u-ana');
    const voltar = await screen.findByRole('link', { name: 'Voltar à trilha' });
    const antes = a.dados();
    expect(voltar).toHaveAttribute('href', T_ALG_A);
    await a.usuario.click(voltar);
    await waitFor(() => expect(a.rotaAtual()).toBe(T_ALG_A));
    expect(a.dados()).toEqual(antes);
  });

  it('mostra salvamento pendente e impede repetição antes da confirmação real', async () => {
    const a = await renderizarApp('/professor/disciplinas/d-geo/conteudo', 'u-julia');
    await a.usuario.click(await screen.findByRole('button', { name: 'Editar tópico Ângulos' }));
    await a.usuario.type(screen.getByLabelText('Título do tópico 1'), ' revisados');
    const antes = a.dados();
    let liberar!: () => void;
    const espera = new Promise<void>((resolve) => { liberar = resolve; });
    const original = RepositorioApp.prototype.salvarConteudo;
    const salvar = vi.spyOn(RepositorioApp.prototype, 'salvarConteudo').mockImplementationOnce(async function (this: RepositorioApp, ...args) {
      await espera;
      return original.apply(this, args);
    });
    try {
      await a.usuario.click(screen.getByRole('button', { name: 'Salvar alterações' }));
      const botao = screen.getByRole('button', { name: 'Salvando…' });
      expect(botao).toBeDisabled();
      expect(botao).toHaveAttribute('aria-busy', 'true');
      expect(screen.queryByText('Alterações salvas.')).toBeNull();
      expect(a.dados()).toEqual(antes);
      await a.usuario.dblClick(botao);
      expect(salvar).toHaveBeenCalledTimes(1);
      await act(async () => { liberar(); await espera; });
      expect(await screen.findByText('Alterações salvas.')).toBeVisible();
      expect(a.dados().respostas).toEqual(antes.respostas);
      expect(a.dados().disciplinas.find((d) => d.id === 'd-geo')!.topicos[0].titulo).toBe('Ângulos revisados');
    } finally { liberar(); salvar.mockRestore(); }
  });
});
