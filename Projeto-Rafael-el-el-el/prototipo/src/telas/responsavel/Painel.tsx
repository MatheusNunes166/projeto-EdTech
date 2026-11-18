import { useConsulta } from '../../app/contexto';
import { ListaRegistros, Registro } from '../../componentes/Gestao';
import { BarraProgresso, Consulta, Vazio } from '../../componentes/comuns';
import { formatarData } from '../../dominio/datas';

/** Somente os alunos vinculados; por oferta, progresso, sequência e última atividade — nunca o histórico de questões. */
export function PainelResponsavel() {
  const alunos = useConsulta((r) => r.consultarAlunosVinculados());
  return (
    <>
      <h1>Painel do responsável</h1>
      <Consulta estado={alunos}>
        {(lista) => lista.length === 0 ? <Vazio>Nenhum aluno vinculado.</Vazio> : (
          <div className="painel-responsavel">{lista.map((a) => <AlunoVinculado key={a.id} id={a.id} nome={a.nome} />)}</div>
        )}
      </Consulta>
    </>
  );
}

function AlunoVinculado({ id, nome }: { id: string; nome: string }) {
  const estado = useConsulta((r) => r.consultarIndicadoresResponsavel(id), [id]);
  return (
    <section className="aluno-acompanhado" aria-label={`Aluno ${nome}`}>
      <h2>{nome}</h2>
      <Consulta estado={estado}>
        {({ turmas }) => turmas.length === 0 ? <Vazio>Sem turmas.</Vazio> : (
          <ListaRegistros rotulo={"Ofertas de " + nome}>
            {turmas.map((t) => (
              <Registro key={t.turmaId} rotulo={`${nome} — ${t.contexto.disciplina.nome} turma ${t.contexto.turma.codigo} ${t.contexto.periodoLetivo.nome}`}>
                <strong>{t.contexto.disciplina.nome}</strong>
                <p className="meta">Turma {t.contexto.turma.codigo} · {t.contexto.periodoLetivo.nome}</p>
                <p className="rotulo">Progresso da trilha</p>
                <BarraProgresso valor={t.progresso} rotulo={`Progresso de ${nome} em ${t.contexto.disciplina.nome} ${t.contexto.periodoLetivo.nome}`} />
                <p>Sequência: {t.sequenciaDias} dia(s) · Última atividade: {t.ultimaAtividade ? formatarData(t.ultimaAtividade) : 'Sem atividade'}</p>
                <details><summary>Detalhes da oferta</summary><p>Graduação: {t.contexto.graduacao.nome}</p><p className="meta">O progresso indica os tópicos dominados. A sequência conta dias consecutivos com respostas nesta turma. Última atividade é a data da resposta mais recente.</p></details>
              </Registro>
            ))}
          </ListaRegistros>
        )}
      </Consulta>
    </section>
  );
}

