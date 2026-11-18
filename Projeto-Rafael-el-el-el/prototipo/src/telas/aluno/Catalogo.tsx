import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useConsulta } from '../../app/contexto';
import { Consulta, Vazio } from '../../componentes/comuns';
import type { FiltrosCatalogo } from '../../dados/contratos-consultas-academicas';
import { NIVEIS_CURSO, type NivelCurso } from '../../dominio/tipos';

/** Catálogo de graduações e disciplinas PUBLICADAS. Não há matrícula aqui: ela é administrativa. */
export function Catalogo() {
  const [busca, setBusca] = useState('');
  const [area, setArea] = useState('');
  const [nivel, setNivel] = useState('');
  const [periodo, setPeriodo] = useState('');
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

  return (
    <>
      <h1>Catálogo</h1>
      <p className="sub">Graduações e disciplinas publicadas. A matrícula nas turmas é feita pela coordenação ou administração.</p>
      <form className="filtros" role="search" onSubmit={(e) => e.preventDefault()}>
        <label>Buscar <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} /></label>
        <label>Área
          <select value={area} onChange={(e) => setArea(e.target.value)}>
            <option value="">Todas</option>{opcoes.areas.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <label>Nível
          <select value={nivel} onChange={(e) => setNivel(e.target.value)}>
            <option value="">Todos</option>{NIVEIS_CURSO.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <label>Período
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            <option value="">Todos</option>{opcoes.periodos.map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}
          </select>
        </label>
      </form>
      <Consulta estado={lista}>
        {(graduacoes) => graduacoes.length === 0 ? <Vazio>Nenhuma graduação ou disciplina encontrada para os filtros.</Vazio> : (
          <div className="grade-cartoes">
            {graduacoes.map((g) => (
              <section key={g.id} className="cartao" aria-label={g.nome}>
                <h2>{g.nome}</h2>
                <p className="meta">{g.area}</p>
                <p>{g.descricaoCurta}</p>
                {g.disciplinas.length === 0 ? <Vazio>Sem disciplinas publicadas neste filtro.</Vazio> : (
                  <ul className="lista-limpa">
                    {g.disciplinas.map((d) => (
                      <li key={d.id}>
                        <Link to={`/aluno/catalogo/disciplinas/${d.id}`}>{d.nome}</Link>{' '}
                        <small className="meta">{d.codigo} · {d.nivel} · {d.numeroTopicos} tópicos · {d.ofertas.length} oferta(s)</small>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        )}
      </Consulta>
    </>
  );
}
