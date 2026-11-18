import { useEffect, useRef, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

const desenhos = {
  voltar: 'M19 12H5m6-6-6 6 6 6',
  livro: 'M4 4h6a3 3 0 0 1 2 2v15a4 4 0 0 0-4-2H4V4Zm16 0h-6a3 3 0 0 0-2 2m0 15a4 4 0 0 1 4-2h4V4Z',
  pessoa: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2',
  painel: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  buscar: 'm21 21-6-6M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z',
  check: 'm5 12 4 4L19 6',
} as const;

export function Icone({ nome }: { nome: keyof typeof desenhos }) {
  return <svg className="icone-ui" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={desenhos[nome]} /></svg>;
}

export function Retorno({ children, ...props }: LinkProps) {
  return <Link {...props} className={['retorno', props.className].filter(Boolean).join(' ')}><Icone nome="voltar" /><span>{children}</span></Link>;
}

export function MensagemSucesso({ children }: { children: ReactNode }) {
  const mensagem = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const elemento = mensagem.current;
    if (!elemento) return;
    const limites = elemento.getBoundingClientRect();
    if (limites.top < 0 || limites.bottom > window.innerHeight) elemento.scrollIntoView?.({ block: 'nearest' });
  }, [children]);
  return <p className="mensagem-sucesso" role="status" ref={mensagem}>{children}</p>;
}

/** Uma região de ações, no fluxo, que acompanha a edição sem duplicar comandos. */
export function AcoesEditor({ children }: { children: ReactNode }) {
  const barra = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const elemento = barra.current!;
    const medir = () => document.documentElement.style.setProperty('--altura-acoes-editor', elemento.offsetHeight + 24 + 'px');
    medir();
    const observador = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(medir);
    observador?.observe(elemento);
    const revelar = (evento: FocusEvent) => {
      const alvo = evento.target;
      if (!(alvo instanceof HTMLElement) || elemento.contains(alvo) || !alvo.closest('main') || getComputedStyle(elemento).position !== 'sticky') return;
      const limites = alvo.getBoundingClientRect();
      const inicioLivre = elemento.getBoundingClientRect().bottom + 16;
      const fimLivre = window.innerHeight - 16;
      if (limites.top < inicioLivre) window.scrollBy({ top: limites.top - inicioLivre });
      else if (limites.bottom > fimLivre) window.scrollBy({ top: limites.bottom - fimLivre });
    };
    document.addEventListener('focusin', revelar);
    return () => { observador?.disconnect(); document.removeEventListener('focusin', revelar); document.documentElement.style.removeProperty('--altura-acoes-editor'); };
  }, []);
  return <div className="acoes-editor" ref={barra} aria-label="Ações do conteúdo">{children}</div>;
}
