import { useId, useLayoutEffect, useRef, type ReactNode } from 'react';

interface Props {
  titulo: string;
  children: ReactNode;
  acao: string;
  aoConfirmar: () => void | Promise<void>;
  aoCancelar: () => void;
  ocupado?: boolean;
}

export function Confirmacao({ titulo, children, acao, aoConfirmar, aoCancelar, ocupado }: Props) {
  const id = useId();
  const dialogo = useRef<HTMLDialogElement>(null);
  const cancelar = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    const elemento = dialogo.current!;
    const origem = document.activeElement;
    elemento.showModal();
    cancelar.current?.focus();
    return () => {
      elemento.close();
      if (origem instanceof HTMLElement && origem.isConnected) origem.focus();
      else document.querySelector<HTMLElement>('main h1')?.focus();
    };
  }, []);

  return (
    <dialog ref={dialogo} role="alertdialog" aria-labelledby={id} aria-describedby={id + '-efeito'}
      onKeyDown={(evento) => { if (evento.key === 'Escape') evento.stopPropagation(); }}
      onCancel={(evento) => { evento.preventDefault(); if (!ocupado) aoCancelar(); }}>
      <h2 id={id}>{titulo}</h2>
      <div id={id + '-efeito'}>{children}</div>
      <div className="acoes">
        <button type="button" ref={cancelar} className="secundario" disabled={ocupado} onClick={aoCancelar}>Cancelar</button>
        <button type="button" className="perigo" disabled={ocupado} onClick={aoConfirmar}>{acao}</button>
      </div>
    </dialog>
  );
}
