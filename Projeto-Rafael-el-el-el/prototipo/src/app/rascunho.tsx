import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useBlocker } from 'react-router-dom';
import { Confirmacao } from '../componentes/Confirmacao';

type Saida = () => void | Promise<void>;

interface Controle {
  disciplina: string | null;
  registrar: (disciplina: string | null) => void;
  sair: (acao: Saida) => void;
  liberarSaida: () => void;
}

const Contexto = createContext<Controle>({
  disciplina: null, registrar: () => undefined, sair: (acao) => { void acao(); }, liberarSaida: () => undefined,
});

export function useSaidaDoEditor() {
  return useContext(Contexto);
}

export function useRascunhoPendente(disciplina: string | null) {
  const { registrar } = useSaidaDoEditor();
  useLayoutEffect(() => {
    registrar(disciplina);
    return () => registrar(null);
  }, [disciplina, registrar]);
}

export function ProtecaoSaida({ children }: { children: ReactNode }) {
  const [disciplina, registrar] = useState<string | null>(null);
  const [acao, setAcao] = useState<Saida | null>(null);
  const liberada = useRef(false);
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    !!disciplina && !liberada.current && currentLocation.pathname !== nextLocation.pathname);
  useEffect(() => {
    if (disciplina) return;
    if (blocker.state === 'blocked') blocker.reset();
    if (acao) setAcao(null);
  }, [disciplina, blocker, acao]);
  const confirmar = () => {
    if (blocker.state === 'blocked') blocker.proceed();
    if (acao) {
      liberada.current = true;
      setAcao(null);
      void acao();
    }
  };
  const cancelar = () => {
    if (blocker.state === 'blocked') blocker.reset();
    setAcao(null);
  };

  return <Contexto.Provider value={{
    disciplina, registrar,
    sair: (efeito) => { if (disciplina) setAcao(() => efeito); else void efeito(); },
    liberarSaida: () => { liberada.current = true; },
  }}>
    {children}
    {disciplina && (acao || blocker.state === 'blocked') && <Confirmacao
      titulo={'Descartar alterações de ' + disciplina + '?'} acao="Descartar e sair"
      aoCancelar={cancelar} aoConfirmar={confirmar}>
      <p>As alterações ainda não salvas desta disciplina serão perdidas. O conteúdo salvo e o histórico permanecem.</p>
    </Confirmacao>}
  </Contexto.Provider>;
}
