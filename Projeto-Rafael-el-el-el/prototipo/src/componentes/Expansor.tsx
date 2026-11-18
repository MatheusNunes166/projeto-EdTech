import { useRef, type ReactNode } from 'react';

export function Expansor({ rotulo, children, classe }: { rotulo: ReactNode; children: ReactNode; classe?: string }) {
  const detalhe = useRef<HTMLDetailsElement>(null);
  const acionador = useRef<HTMLElement>(null);
  return (
    <details ref={detalhe} className={classe} onKeyDown={(evento) => {
      if (evento.key !== 'Escape' || !detalhe.current?.open || evento.defaultPrevented) return;
      evento.preventDefault();
      detalhe.current.open = false;
      acionador.current?.focus();
    }}>
      <summary ref={acionador}>{rotulo}</summary>
      {children}
    </details>
  );
}
