import { Link, useSearchParams } from 'react-router-dom';
import { useConsulta } from '../../app/contexto';
import { ListaRegistros, Registro } from '../../componentes/Gestao';
import { Consulta, Vazio } from '../../componentes/comuns';
import type { FiltrosCatalogo } from '../../dados/contratos-consultas-academicas';
import { NIVEIS_CURSO, type NivelCurso } from '../../dominio/tipos';

/** Catálogo de graduações e disciplinas PUBLICADAS. Não há matrícula aqui: ela é administrativa. */
export function Catalogo() {
  const [params, setParams] = useSearchParams();
  const busca = params.get('busca') ?? '';
  const area = params.get('area') ?? '';
  const nivel = params.get('nivel') ?? '';
  const periodo = params.get('periodo') ?? '';
  const mudar = (campo: string, valor: string) => setParams((anteriores) => {
    const novos = new URLSearchParams(anteriores);
    if (valor) novos.set(campo, valor); else novos.delete(campo);
    return novos;
  }, { replace: true });
  const filtros: FiltrosCatalogo = {
    ...(busca.trim() ? { busca } : {}), ...(area ? { area } : {}),
    ...(nivel ? { nivel: nivel as NivelCurso } : {}), ...(periodo ? { periodoLetivoId: periodo } : {}),
  };
  const todos = useConsulta((r) => r.consultarCatalogo({}));
  const lista = useConsulta((r) => r.consultarCatalogo(filtros), [busca, area, nivel, periodo]);
  const opcoes = todos.situacao === 'ok' ? {
    areas: [...new Set(todos.dados.map((g) => g.area))].sort(),
    periodos: [...new Map(todos.dados.flatMap((g) => g.disciplinas.flatMap((d) => d.ofertas.map((o) => [o.periodoLetivo.id, o.periodoLetivo.nome] as const)))).entries()],
  } : { areas: [], periodos: [] };

  const filtrado = Boolean(busca.trim() || area || nivel || periodo);
  const limpar = () => setParams({}, { replace: true });

  return (
    <>
      <h1>Catálogo</h1>
      <p className="sub">Graduações e disciplinas publicadas. A matrícula nas turmas é feita pela coordenação ou administração.</p>
      <form className="filtros filtros-catalogo cartao" role="search" onSubmit={(e) => e.preventDefault()}>
        <label>Buscar <input type="search" value={busca} onChange={(e) => mudar('busca', e.target.value)} /></label>
        <label>Área
          <select value={area} onChange={(e) => mudar('area', e.target.value)}>
            <option value="">Todas</option>{opcoes.areas.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <label>Nível
          <select value={nivel} onChange={(e) => mudar('nivel', e.target.value)}>
            <option value="">Todos</option>{NIVEIS_CURSO.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label>Período
          <select value={periodo} onChange={(e) => mudar('periodo', e.target.value)}>
            <option value="">Todos</option>{opcoes.periodos.map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}
          </select>
        </label>
        {filtrado && <button type="button" className="secundario" onClick={limpar}>Limpar filtros</button>}
      </form>
      <Consulta estado={lista}>
        {(graduacoes) => graduacoes.length === 0 ? <Vazio>{filtrado ? "Nenhuma graduação ou disciplina encontrada para os filtros." : "Não há graduações ou disciplinas disponíveis no catálogo."}</Vazio> : (
          <div className="grade-cartoes">
            {graduacoes.map((g) => (
              <section key={g.id} className="cartao" aria-label={g.nome}>
                <h2>{g.nome}</h2>
                <p className="meta">{g.area}</p>
                <p>{g.descricaoCurta}</p>
                {g.disciplinas.length === 0 ? <Vazio>Sem disciplinas publicadas neste filtro.</Vazio> : (
                  <ListaRegistros rotulo={"Disciplinas de " + g.nome}>
                    {g.disciplinas.map((d) => (
                      <Registro key={d.id}>
                        <Link to={{ pathname: `/aluno/catalogo/disciplinas/${d.id}`, search: params.toString() }}>{d.nome}</Link>{' '}
                        <p className="meta">{d.codigo} · {d.nivel} · {d.numeroTopicos} tópicos · {d.ofertas.length} oferta(s)</p>
                      </Registro>
                    ))}
                  </ListaRegistros>
                )}
              </section>
            ))}
          </div>
        )}
      </Consulta>
    </>
  );
}
