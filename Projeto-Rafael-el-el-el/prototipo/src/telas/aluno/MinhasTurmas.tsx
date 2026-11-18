import { Link } from 'react-router-dom';
import { useConsulta } from '../../app/contexto';
import { BarraProgresso, Consulta, Vazio } from '../../componentes/comuns';

/** Ofertas em que o aluno está matriculado, identificadas por graduação, disciplina, turma e período. */
export function MinhasTurmas() {
  const turmas = useConsulta((r) => r.consultarMinhasTurmas());
  const painel = useConsulta((r) => r.consultarPainelAluno());
  return (
    <>
      <h1>Minhas turmas</h1>
      <Consulta estado={turmas}>
        {(lista) => lista.length === 0 ? <Vazio>Você ainda não está matriculado em nenhuma turma. A matrícula é feita pela coordenação ou administração.</Vazio> : (
          <div className="grade-cartoes">
            {lista.map((t) => {
              const base = `/aluno/disciplinas/${t.disciplina.id}/turmas/${t.turma.id}`;
              const ind = painel.situacao === 'ok' ? painel.dados.find((i) => i.matriculaId === t.matricula.id) : undefined;
              return (
                <article key={t.matricula.id} className="cartao" aria-label={`${t.disciplina.nome} turma ${t.turma.codigo} ${t.periodoLetivo.nome}`}>
                  <h2>{t.disciplina.nome}</h2>
                  <p className="meta">{t.graduacao.nome} · Turma {t.turma.codigo} · {t.periodoLetivo.nome}</p>
                  {!t.conteudoDisponivel ? <p className="meta">Conteúdo em preparação: ainda não há atividades de estudo.</p> : (
                    <>
                      {ind && <BarraProgresso valor={ind.progresso} rotulo={`Progresso em ${t.disciplina.nome} ${t.turma.codigo} ${t.periodoLetivo.nome}`} />}
                      {ind && ind.totalRespostas === 0 && <p className="meta">Sem atividade</p>}
                      <div className="acoes">
                        <Link className="botao" to={base}>Abrir trilha</Link>
                        <Link className="botao secundario" to={`${base}/desempenho`}>Desempenho</Link>
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </Consulta>
    </>
  );
}
