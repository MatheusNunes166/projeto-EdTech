import { useLayoutEffect, useRef, type ReactNode } from 'react';

export function ListaRegistros({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return <ul className="lista-registros" aria-label={rotulo}>{children}</ul>;
}

export function Registro({ children, acoes }: { children: ReactNode; acoes?: ReactNode }) {
  return <li className="registro"><div>{children}</div>{acoes && <div className="acoes-registro">{acoes}</div>}</li>;
}

export function DadoRegistro({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return <div><dt>{rotulo}</dt><dd>{children}</dd></div>;
}

export function PainelEdicao({ titulo, children }: { titulo: string; children: ReactNode }) {
  const h = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    const acionador = document.activeElement;
    h.current?.focus();
    return () => {
      if (acionador instanceof HTMLElement && acionador.isConnected) acionador.focus();
      else document.querySelector<HTMLElement>('main h1')?.focus();
    };
  }, [titulo]);
  return <section className="cartao painel-edicao" aria-label={titulo}><h2 ref={h} tabIndex={-1}>{titulo}</h2>{children}</section>;
}
