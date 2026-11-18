import { useConsulta } from '../../app/contexto';
import { BarraProgresso, Consulta, Vazio } from '../../componentes/comuns';
import { formatarData } from '../../dominio/datas';

/** Somente os alunos vinculados; por oferta, progresso, sequência e última atividade — nunca o histórico de questões. */
export function PainelResponsavel() {
  const alunos = useConsulta((r) => r.consultarAlunosVinculados());
  return (
    <>
      <h1>Painel do responsável</h1>
      <Consulta estado={alunos}>
        {(lista) => lista.length === 0 ? <Vazio>Nenhum aluno vinculado.</Vazio> : lista.map((a) => <AlunoVinculado key={a.id} id={a.id} nome={a.nome} />)}
      </Consulta>
    </>
  );
}

function AlunoVinculado({ id, nome }: { id: string; nome: string }) {
  const estado = useConsulta((r) => r.consultarIndicadoresResponsavel(id), [id]);
  return (
    <section className="cartao" aria-label={`Aluno ${nome}`}>
      <h2>{nome}</h2>
      <Consulta estado={estado}>
        {({ turmas }) => turmas.length === 0 ? <Vazio>Sem turmas.</Vazio> : (
          <ul className="lista-limpa">
            {turmas.map((t) => (
              <li key={t.turmaId} aria-label={`${nome} — ${t.contexto.disciplina.nome} turma ${t.contexto.turma.codigo} ${t.contexto.periodoLetivo.nome}`}>
                <strong>{t.contexto.disciplina.nome}</strong>
                <p className="meta">{t.contexto.graduacao.nome} · Turma {t.contexto.turma.codigo} · {t.contexto.periodoLetivo.nome}</p>
                <BarraProgresso valor={t.progresso} rotulo={`Progresso de ${nome} em ${t.contexto.disciplina.nome} ${t.contexto.periodoLetivo.nome}`} />
                <p>Sequência: {t.sequenciaDias} dia(s) · Última atividade: {t.ultimaAtividade ? formatarData(t.ultimaAtividade) : 'Sem atividade'}</p>
              </li>
            ))}
          </ul>
        )}
      </Consulta>
    </section>
  );
}

