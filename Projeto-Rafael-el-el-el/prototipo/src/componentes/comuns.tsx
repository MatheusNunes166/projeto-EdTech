import { cloneElement, isValidElement, useEffect, useId, type ReactNode } from 'react';
import type { EstadoConsulta, ErroComando } from '../app/contexto';
import { arredondarExibicao } from '../desempenho/apresentacao';
import { NOME_DIFICULDADE, type Dificuldade } from '../dominio/tipos';

/** `valor` é exato (0–100); só aqui ele é arredondado para exibição. */
export function BarraProgresso({ valor, rotulo }: { valor: number; rotulo: string }) {
  const exibido = arredondarExibicao(valor);
  return (
    <div className="progresso">
      <div className="barra" role="progressbar" aria-valuenow={valor} aria-valuetext={`${exibido}%`} aria-valuemin={0} aria-valuemax={100} aria-label={rotulo}>
        <div className="barra-preenchida" style={{ width: `${valor}%` }} />
      </div>
      <span className="barra-texto">{exibido}%</span>
    </div>
  );
}

export function EtiquetaDificuldade({ dificuldade }: { dificuldade: Dificuldade }) {
  return <span className={`etiqueta dif-${dificuldade}`}>{NOME_DIFICULDADE[dificuldade]}</span>;
}

export function Vazio({ children }: { children: ReactNode }) {
  return <p className="vazio">{children}</p>;
}

/** `ignorar`: campos cujo erro já aparece junto ao próprio campo (evita duplicar a mensagem). */
export function MensagemErro({ erro, ignorar = [] }: { erro: ErroComando | null; ignorar?: string[] }) {
  if (!erro) return null;
  const detalhes = Object.entries(erro.detalhes).filter(([k]) => !ignorar.some((c) => k === c || k.endsWith(`.${c}`)));
  return (
    <div role="alert" className="alerta">
      <p>{erro.mensagem}</p>
      {detalhes.length > 0 && <ul>{detalhes.map(([campo, msg]) => <li key={campo}>{msg}</li>)}</ul>}
    </div>
  );
}

/** Renderiza a consulta autorizada: sem dados enquanto carrega, e nenhuma tela quando o acesso é negado. */
export function Consulta<T>({ estado, children }: { estado: EstadoConsulta<T>; children: (dados: T, revisao: number) => ReactNode }) {
  if (estado.situacao === 'carregando') return <p className="carregando" role="status">Carregando…</p>;
  if (estado.situacao === 'erro') {
    return (
      <div role="alert" className="alerta">
        <h1>{estado.erro.codigo === 'ACESSO_NEGADO' ? 'Acesso negado' : 'Não foi possível carregar'}</h1>
        <p>{estado.erro.codigo === 'ACESSO_NEGADO' ? 'Você não tem acesso a este recurso.' : estado.erro.mensagem}</p>
        {estado.tentarNovamente && <button type="button" className="secundario" onClick={estado.tentarNovamente}>Tentar novamente</button>}
      </div>
    );
  }
  return <>{children(estado.dados, estado.revisao)}</>;
}

export function Campo({ rotulo, erro, children }: { rotulo: string; erro?: string; children: ReactNode }) {
  const id = useId();
  const campo = erro && isValidElement<{ 'aria-invalid'?: boolean; 'aria-describedby'?: string }>(children)
    ? cloneElement(children, { 'aria-invalid': true, 'aria-describedby': [children.props['aria-describedby'], id].filter(Boolean).join(' ') })
    : children;
  return (
    <div className="linha campo">
      <label>
        <span className="rotulo">{rotulo}</span>
        {campo}
      </label>
      {erro && <span id={id} className="erro-campo" role="alert">{erro}</span>}
    </div>
  );
}

export function PularParaConteudo() {
  return <a className="pular-conteudo" href="#conteudo" onClick={(e) => { e.preventDefault(); document.getElementById('conteudo')?.focus(); }}>Pular para conteúdo</a>;
}

/** Aguarda o título autorizado do destino, inclusive nas páginas que carregam por consulta. */
export function FocoDaPagina({ caminho }: { caminho: string }) {
  useEffect(() => {
    const main = document.getElementById('conteudo');
    const focar = () => {
      const titulo = main?.querySelector('h1');
      if (!titulo) return false;
      titulo.tabIndex = -1; titulo.focus(); return true;
    };
    if (focar() || !main) return;
    const observador = new MutationObserver(() => { if (focar()) observador.disconnect(); });
    observador.observe(main, { childList: true, subtree: true });
    return () => observador.disconnect();
  }, [caminho]);
  return null;
}
