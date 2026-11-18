import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { ProvedorApp } from '../app/contexto';
import { Rotas } from '../app/Rotas';
import { CHAVES_ARMAZENAMENTO as K, criarPersistenciaLocal, criarRepositorioLocal, type ArmazenamentoEscrita } from '../dados/armazenamento-academico';
import { RepositorioApp } from '../dados/repositorio-app';
import { criarSeedAcademico } from '../dados/seed-academico';
import type { DadosAcademicos } from '../dominio/tipos';

function Sonda() {
  const l = useLocation();
  return <output data-testid="rota">{l.pathname}{l.search}</output>;
}

/**
 * Renderiza o app completo numa rota sobre o localStorage do jsdom, já com o seed acadêmico (opcionalmente
 * ajustado) e, se informada, uma pessoa na sessão. Nenhuma chave real do navegador é tocada.
 */
export async function renderizarApp(
  rota: string, pessoaId?: string, preparar?: (dados: DadosAcademicos) => void, armazenamento: ArmazenamentoEscrita = localStorage,
) {
  if (armazenamento === localStorage) localStorage.clear();
  const seed = criarSeedAcademico();
  preparar?.(seed);
  armazenamento.setItem(K.academico, JSON.stringify(seed));
  if (pessoaId) armazenamento.setItem(K.sessaoAcademica, pessoaId);
  const usuario = userEvent.setup();
  const resultado = render(
    <ProvedorApp armazenamento={armazenamento}>
      <MemoryRouter initialEntries={[rota]}>
        <Rotas />
        <Sonda />
      </MemoryRouter>
    </ProvedorApp>,
  );
  await screen.findByTestId('rota');
  return {
    usuario, ...resultado,
    repo: criarRepositorioLocal(armazenamento),
    /** Outra sessão (outra aba) sobre o mesmo armazenamento. */
    outraAba: (pessoaId: string) => {
      let id: string | null = pessoaId;
      return new RepositorioApp(criarPersistenciaLocal(armazenamento), { obterUsuarioId: () => id, definirUsuarioId: (x) => { id = x; } });
    },
    /** Simula o evento `storage` que outra aba dispararia ao gravar. */
    avisarOutraAba: () => act(() => { window.dispatchEvent(new StorageEvent('storage', { key: K.academico })); }),
    rotaAtual: () => screen.getByTestId('rota').textContent,
    dados: () => JSON.parse(armazenamento.getItem(K.academico)!) as DadosAcademicos,
  };
}

export const T_ALG_A = '/aluno/disciplinas/d-alg/turmas/t-alg-a-262';

/** Entrada em duas etapas; escolher função ainda não inicia sessão. */
export async function escolherFuncaoEntrada(usuario: ReturnType<typeof userEvent.setup>, funcao = 'Aluno') {
  await usuario.click(await screen.findByRole('button', { name: funcao }));
}

export async function abrirDemonstracao(usuario: ReturnType<typeof userEvent.setup>) {
  await usuario.click(await screen.findByText('Demonstração', { selector: 'summary' }));
}
