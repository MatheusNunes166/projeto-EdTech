import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderizarApp } from './renderizar';

describe('7.15 — [AC] Painel do responsável; [PA] Vínculos entre responsável e alunos', () => {
  it('mostra apenas o aluno vinculado, com duas ofertas separadas da mesma disciplina', async () => {
    const { container } = await renderizarApp('/responsavel', 'u-helena');
    const ana = await screen.findByRole('region', { name: 'Aluno Ana Souza' });
    expect(await within(ana).findByLabelText('Ana Souza — Algoritmos turma A 2026.2')).toBeInTheDocument();
    expect(within(ana).getByLabelText('Ana Souza — Algoritmos turma A 2027.1')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /Bruno|Elisa/ })).toBeNull();
    expect(container.textContent).not.toContain('Bruno Lima');
  });

  it('indicadores separados por oferta; sem respostas: progresso e sequência zero e Sem atividade', async () => {
    await renderizarApp('/responsavel', 'u-helena');
    const antiga = await screen.findByLabelText('Ana Souza — Algoritmos turma A 2026.2');
    const nova = screen.getByLabelText('Ana Souza — Algoritmos turma A 2027.1');
    expect(within(nova).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(nova).toHaveTextContent('Sequência: 0 dia(s)');
    expect(nova).toHaveTextContent('Última atividade: Sem atividade');
    expect(within(antiga).getByRole('progressbar').getAttribute('aria-valuenow')).not.toBe('0');
    expect(antiga).not.toHaveTextContent('Sem atividade');
  });

  it('não expõe histórico detalhado de questões', async () => {
    const { container } = await renderizarApp('/responsavel', 'u-helena');
    await screen.findByLabelText('Ana Souza — Algoritmos turma A 2026.2');
    for (const proibido of ['Quanto', 'Qual', 'Alternativa', 'explicação', 'XP']) expect(container.textContent).not.toContain(proibido);
  });

  it('um responsável com dois alunos vê ambos, cada um no seu bloco', async () => {
    await renderizarApp('/responsavel', 'u-roberto');
    expect(await screen.findByRole('region', { name: 'Aluno Bruno Lima' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Aluno Elisa Prado' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Aluno Ana Souza' })).toBeNull();
  });

  it('só quem tem a função Responsável acessa o painel', async () => {
    const { rotaAtual } = await renderizarApp('/responsavel', 'u-ana');
    await screen.findByRole('heading', { name: 'Minhas turmas' });
    expect(rotaAtual()).toBe('/aluno');
  });
});
