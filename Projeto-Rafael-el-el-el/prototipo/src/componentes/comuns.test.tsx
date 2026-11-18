import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { BarraProgresso } from './comuns';

it('progresso conserva o valor exato e apresenta uma porcentagem arredondada fora do preenchimento', () => {
  render(<BarraProgresso valor={100 / 6} rotulo="Progresso da turma A" />);
  const barra = screen.getByRole('progressbar', { name: 'Progresso da turma A' });
  expect(Number(barra.getAttribute('aria-valuenow'))).toBe(100 / 6);
  expect(barra).toHaveAttribute('aria-valuetext', '17%');
  expect(screen.getByText('17%').parentElement).toBe(barra.parentElement);
  expect(barra).not.toContainElement(screen.getByText('17%'));
});
