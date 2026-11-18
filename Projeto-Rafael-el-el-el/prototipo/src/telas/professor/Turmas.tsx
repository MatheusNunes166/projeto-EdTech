import { Link, useParams } from 'react-router-dom';
import { useConsulta } from '../../app/contexto';
import { BarraProgresso, Consulta, Vazio } from '../../componentes/comuns';
import { arredondarExibicao, exibirMedias } from '../../desempenho/apresentacao';
import { formatarData } from '../../dominio/datas';
import { NOME_DIFICULDADE } from '../../dominio/tipos';

/** Somente as turmas com vínculo docente; o conteúdo da disciplina é compartilhado entre as turmas dela. */
export function ListaTurmas() {
  const estado = useConsulta((r) => r.consultarTurmasDocentes());
  return (
    <>
      <h1>Minhas turmas</h1>
      <Consulta estado={estado}>
        {(turmas) => turmas.length === 0 ? <Vazio>Você não tem turmas vinculadas.</Vazio> : (
          <div className="grade-cartoes">
            {turmas.map((t) => (
              <article key={t.turma.id} className="cartao" aria-label={`${t.disciplina.nome} turma ${t.turma.codigo} ${t.periodoLetivo.nome}`}>
                <h2>{t.disciplina.nome}</h2>
                <p className="meta">{t.graduacao.nome} · Turma {t.turma.codigo} · {t.periodoLetivo.nome} · {t.disciplina.status === 'publicado' ? 'Publicada' : 'Em rascunho'}</p>
                <div className="acoes">
                  <Link className="botao" to={`/professor/disciplinas/${t.disciplina.id}/turmas/${t.turma.id}`}>Painel da turma</Link>
                  <Link className="botao secundario" to={`/professor/disciplinas/${t.disciplina.id}/conteudo`}>Conteúdo da disciplina</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </Consulta>
    </>
  );
}

export function PainelTurma() {
  const { disciplinaId = '', turmaId = '' } = useParams();
  const estado = useConsulta((r) => r.consultarIndicadoresDocencia({ turmaId, disciplinaId }), [turmaId, disciplinaId]);
  return (
    <Consulta estado={estado}>
      {(p) => {
        const medias = exibirMedias(p.medias);
        const titulos = p.matriculados[0]?.dominioPorTopico ?? [];
        return (
          <>
            <p><Link to="/professor">← Minhas turmas</Link></p>
            <h1>{p.contexto.disciplina.nome} — Turma {p.contexto.turma.codigo}</h1>
            <p className="meta">{p.contexto.graduacao.nome} · {p.contexto.periodoLetivo.nome}</p>
            <p><strong>{p.quantidadeMatriculados}</strong> matriculado(s)</p>
            {p.quantidadeMatriculados === 0 && <Vazio>Nenhum aluno matriculado</Vazio>}
            <section aria-label="Indicadores agregados da turma" className="cartao">
              <h2>Indicadores da turma</h2>
              {medias.situacao === 'sem-dados' ? <p>Progresso médio: {medias.rotulo} · Domínio médio por tópico: {medias.rotulo}</p> : (
                <>
                  <p>Progresso médio: <strong>{medias.progressoMedio}%</strong></p>
                  <ul className="lista-limpa">
                    {medias.dominioMedioPorTopico.map((t) => <li key={t.topicoId}>Domínio médio — {titulos.find((x) => x.topicoId === t.topicoId)?.titulo ?? t.topicoId}: {t.dominio}</li>)}
                  </ul>
                </>
              )}
            </section>
            {p.matriculados.length > 0 && (
              <table>
                <caption className="sr-only">Alunos matriculados</caption>
                <thead><tr><th>Aluno</th><th>Progresso</th><th>Taxa de acertos</th><th>Situação</th><th>Última atividade</th><th /></tr></thead>
                <tbody>
                  {p.matriculados.map((m) => (
                    <tr key={m.matriculaId}>
                      <td>{m.nome}</td>
                      <td><BarraProgresso valor={m.progresso} rotulo={`Progresso de ${m.nome}`} /></td>
                      <td>{m.totalRespostas === 0 ? 'Sem atividade' : `${arredondarExibicao(m.taxaAcertos)}%`}</td>
                      <td>{m.situacao === 'precisa-de-atencao' ? <span className="alerta">Precisa de atenção</span> : m.situacao === 'sem-atividade' ? 'Sem atividade' : 'Regular'}</td>
                      <td>{m.ultimaAtividade ? formatarData(m.ultimaAtividade) : 'Sem atividade'}</td>
                      <td><Link to={`/professor/disciplinas/${disciplinaId}/turmas/${turmaId}/alunos/${m.matriculaId}`}>Detalhe</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        );
      }}
    </Consulta>
  );
}

/** Detalhe de um aluno NESTA turma: domínio por tópico e últimas até 10 respostas, com o conteúdo originalmente apresentado. */
export function DetalheAluno() {
  const { disciplinaId = '', turmaId = '', matriculaId = '' } = useParams();
  const estado = useConsulta((r) => r.consultarHistoricoAlunoDocente({ matriculaId, turmaId, disciplinaId }), [matriculaId, turmaId, disciplinaId]);
  return (
    <Consulta estado={estado}>
      {(h) => (
        <>
          <p><Link to={`/professor/disciplinas/${disciplinaId}/turmas/${turmaId}`}>← Painel da turma</Link></p>
          <h1>{h.aluno.nome}</h1>
          <p className="meta">{h.contexto.disciplina.nome} · Turma {h.contexto.turma.codigo} · {h.contexto.periodoLetivo.nome}</p>
          <h2>Domínio por tópico</h2>
          <ul className="lista-limpa">{h.trilha.topicos.map((t) => <li key={t.topicoId}>{t.titulo}: {t.dominio}</li>)}</ul>
          <h2>Últimas respostas</h2>
          {h.respostas.length === 0 ? <Vazio>Sem atividade</Vazio> : (
            <ul className="lista-questoes">
              {[...h.respostas].reverse().map((r) => (
                <li key={r.id} className="cartao">
                  <p className="meta">{formatarData(r.data)} · {NOME_DIFICULDADE[r.dificuldade]} · {r.acertou ? 'Acertou' : 'Errou'}</p>
                  <p><strong>{r.enunciado}</strong></p>
                  <ol type="A">{r.alternativas.map((a, i) => <li key={i}>{a}{i === r.alternativa ? ' (escolhida)' : ''}{i === r.correta ? ' ✔' : ''}</li>)}</ol>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Consulta>
  );
}
