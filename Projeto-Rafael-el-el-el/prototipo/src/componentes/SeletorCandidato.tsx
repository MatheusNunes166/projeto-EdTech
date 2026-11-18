import { useConsulta } from '../app/contexto';
import type { PedidoCandidatos } from '../dados/contratos-consultas-academicas';
import { Consulta, Vazio } from './comuns';

export function SeletorCandidato({ pedido, rotulo, valor, mudar }: {
  pedido: PedidoCandidatos;
  rotulo: string;
  valor: string;
  mudar: (id: string, nome: string) => void;
}) {
  const estado = useConsulta((repo) => repo.consultarCandidatos(pedido), [pedido]);
  return <Consulta estado={estado}>{(lista) => lista.length ? (
    <label>{rotulo}<select value={valor} onChange={(e) => mudar(e.target.value, lista.find((p) => p.id === e.target.value)?.nome ?? "")}>
      <option value="">Escolha…</option>
      {lista.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
    </select></label>
  ) : <Vazio>Nenhum candidato elegível.</Vazio>}</Consulta>;
}
