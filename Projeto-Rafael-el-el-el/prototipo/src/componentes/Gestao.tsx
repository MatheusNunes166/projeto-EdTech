import { Children, isValidElement, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Icone } from './Interacao';

function texto(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(texto).join(' ');
  if (isValidElement<{ children?: ReactNode }>(node)) return texto(node.props.children);
  return '';
}

const normalizar = (valor: string) => valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

export function ListaRegistros({ rotulo, children, buscavel }: { rotulo: string; children: ReactNode; buscavel?: boolean }) {
  const [busca, setBusca] = useState('');
  const id = useId();
  const itens = Children.toArray(children);
  const mostrarBusca = buscavel ?? itens.length > 5;
  const filtrados = mostrarBusca && busca.trim() ? itens.filter((item) => normalizar(texto(item)).includes(normalizar(busca.trim()))) : itens;
  return <div className="colecao-registros">
    {mostrarBusca && <div className="busca-lista">
      <label htmlFor={id}><Icone nome="buscar" /><span>Buscar em {rotulo.toLocaleLowerCase('pt-BR')}</span></label>
      <input id={id} type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Digite um nome ou parte do texto" />
      {busca && <div className="resultado-busca"><span role="status">{filtrados.length} de {itens.length} registros</span><button type="button" className="secundario" onClick={() => setBusca('')}>Limpar busca</button></div>}
    </div>}
    <ul className="lista-registros" aria-label={rotulo}>{filtrados}</ul>
    {mostrarBusca && !filtrados.length && <p className="vazio">Nenhum registro encontrado. Ajuste ou limpe a busca.</p>}
  </div>;
}

export function Registro({ children, acoes, rotulo }: { children: ReactNode; acoes?: ReactNode; rotulo?: string }) {
  return <li className="registro" aria-label={rotulo}><div>{children}</div>{acoes && <div className="acoes-registro">{acoes}</div>}</li>;
}

export function DadoRegistro({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return <div className="dado-registro"><dt>{rotulo}</dt><dd>{children}</dd></div>;
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
  }, []);
  return <section className="cartao painel-edicao" aria-label={titulo}><h2 ref={h} tabIndex={-1}>{titulo}</h2>{children}</section>;
}
