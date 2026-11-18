import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useConsulta } from '../../app/contexto';
import { Consulta, Vazio } from '../../componentes/comuns';
import { exibirMedias } from '../../desempenho/apresentacao';

/**
 * Uma linha por turma, com matrículas e médias da própria turma. Os filtros apenas selecionam linhas:
 * nenhuma média global é calculada ou exibida, e nenhuma resposta detalhada é exposta.
 */
export function PainelCoordenador() {
  const estado = useConsulta((r) => r.consultarIndicadoresCoordenacao());
  const [graduacao, setGraduacao] = useState('');
  const [periodo, setPeriodo] = useState('');
  return (
    <>
      <h1>Painel da coordenação</h1>
      <p className="sub">Indicadores por turma dos cursos que você coordena.</p>
      <Consulta estado={estado}>
        {({ turmas }) => {
          const graduacoes = [...new Map(turmas.map((t) => [t.contexto.graduacao.id, t.contexto.graduacao.nome])).entries()];
          const periodos = [...new Map(turmas.map((t) => [t.contexto.periodoLetivo.id, t.contexto.periodoLetivo.nome])).entries()];
          const visiveis = turmas.filter((t) => (!graduacao || t.contexto.graduacao.id === graduacao) && (!periodo || t.contexto.periodoLetivo.id === periodo));
          return (
            <>
              <form className="filtros" onSubmit={(e) => e.preventDefault()}>
                <label>Graduação
                  <select value={graduacao} onChange={(e) => setGraduacao(e.target.value)}>
                    <option value="">Todas</option>{graduacoes.map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}
                  </select>
                </label>
                <label>Período
                  <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
                    <option value="">Todos</option>{periodos.map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}
                  </select>
                </label>
              </form>
              {visiveis.length === 0 ? <Vazio>Nenhuma turma encontrada.</Vazio> : (
                <table>
                  <caption className="sr-only">Turmas e indicadores</caption>
                  <thead><tr><th>Graduação</th><th>Disciplina</th><th>Turma</th><th>Período</th><th>Matrículas</th><th>Progresso médio</th><th>Domínio médio por tópico</th></tr></thead>
                  <tbody>
                    {visiveis.map((t) => {
                      const m = exibirMedias(t.medias);
                      return (
                        <tr key={t.turmaId} data-turma={t.turmaId}>
                          <td>{t.contexto.graduacao.nome}</td><td>{t.contexto.disciplina.nome}</td><td>{t.contexto.turma.codigo}</td><td>{t.contexto.periodoLetivo.nome}</td>
                          <td>{t.quantidadeMatriculados}{t.quantidadeMatriculados === 0 && ' — Nenhum aluno matriculado'}</td>
                          {m.situacao === 'sem-dados' ? <td>{m.rotulo}</td> : <td>{m.progressoMedio}%</td>}
                          {m.situacao === 'sem-dados' ? <td>{m.rotulo}</td> : <td>{m.dominioMedioPorTopico.map((d) => d.dominio).join(' · ')}</td>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              <p><Link className="botao secundario" to="/coordenacao/gestao">Gestão acadêmica</Link></p>
            </>
          );
        }}
      </Consulta>
    </>
  );
}
