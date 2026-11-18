import type { ReactNode } from 'react';
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
  if (estado.situacao === 'carregando') return <p className="carregando">Carregando…</p>;
  if (estado.situacao === 'erro') {
    return (
      <div role="alert" className="alerta">
        <h1>{estado.erro.codigo === 'ACESSO_NEGADO' ? 'Acesso negado' : 'Não foi possível carregar'}</h1>
        <p>{estado.erro.codigo === 'ACESSO_NEGADO' ? 'Você não tem acesso a este recurso.' : estado.erro.mensagem}</p>
      </div>
    );
  }
  return <>{children(estado.dados, estado.revisao)}</>;
}

export function Campo({ rotulo, erro, children }: { rotulo: string; erro?: string; children: ReactNode }) {
  return (
    <div className="linha">
      <label>
        <span className="rotulo">{rotulo}</span>
        {children}
      </label>
      {erro && <span className="erro-campo" role="alert">{erro}</span>}
    </div>
  );
}
