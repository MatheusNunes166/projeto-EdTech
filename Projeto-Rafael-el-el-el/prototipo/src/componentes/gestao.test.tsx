import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { expect, it, vi } from 'vitest';
import { Confirmacao } from './Confirmacao';
import { Campo } from './comuns';
import { PainelEdicao } from './Gestao';

it('abre apenas o editor escolhido, associa o erro ao campo e devolve foco ao fechar', async () => {
  const usuario = userEvent.setup();
  function Tela() {
    const [aberto, setAberto] = useState(false);
    return <>
      <button onClick={() => setAberto(true)}>Editar Carla</button>
      {aberto && <PainelEdicao titulo="Editar Carla">
        <Campo rotulo="Nome" erro="Nome inválido"><input defaultValue="Carla" /></Campo>
        <button onClick={() => setAberto(false)}>Fechar edição</button>
      </PainelEdicao>}
    </>;
  }
  render(<Tela />);
  expect(screen.queryByRole('textbox')).toBeNull();
  const acao = screen.getByRole('button', { name: 'Editar Carla' });
  await usuario.click(acao);
  expect(screen.getByRole('heading', { name: 'Editar Carla' })).toHaveFocus();
  expect(screen.getByRole('textbox', { name: 'Nome' })).toHaveAccessibleDescription('Nome inválido');
  expect(screen.getByRole('textbox', { name: 'Nome' })).toHaveValue('Carla');
  await usuario.click(screen.getByRole('button', { name: 'Fechar edição' }));
  expect(acao).toHaveFocus();
});

it('adiar e cancelar a remoção nunca executa o comando', async () => {
  const usuario = userEvent.setup();
  const confirmar = vi.fn();
  function Tela() {
    const [aberta, setAberta] = useState(false);
    return <>
      <button onClick={() => setAberta(true)}>Remover vínculo</button>
      {aberta && <Confirmacao titulo="Remover Carla de SI?" acao="Confirmar remoção"
        aoCancelar={() => setAberta(false)} aoConfirmar={() => { confirmar(); setAberta(false); }}>
        <p>Carla perde o acesso de coordenação a SI.</p>
      </Confirmacao>}
    </>;
  }
  render(<Tela />);
  const acao = screen.getByRole('button', { name: 'Remover vínculo' });
  await usuario.click(acao);
  const modal = screen.getByRole('alertdialog', { name: 'Remover Carla de SI?' });
  expect(within(modal).getByRole('button', { name: 'Cancelar' })).toHaveFocus();
  fireEvent(modal, new Event('cancel', { cancelable: true, bubbles: true }));
  expect(confirmar).not.toHaveBeenCalled();
  expect(acao).toHaveFocus();
  await usuario.keyboard('{Enter}');
  await usuario.click(screen.getByRole('button', { name: 'Confirmar remoção' }));
  expect(confirmar).toHaveBeenCalledTimes(1);
});
