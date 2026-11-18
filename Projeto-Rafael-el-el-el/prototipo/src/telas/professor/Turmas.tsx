import { Link, useParams } from 'react-router-dom';
import { useConsulta } from '../../app/contexto';
import { DadoRegistro, ListaRegistros, Registro } from '../../componentes/Gestao';
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
          <ListaRegistros rotulo="Ofertas docentes">
            {turmas.map((t) => (
              <Registro key={t.turma.id} rotulo={t.disciplina.nome + ' turma ' + t.turma.codigo + ' ' + t.periodoLetivo.nome}
                acoes={<>
                  <Link className="botao secundario" aria-label={'Painel da turma ' + t.turma.codigo + ' · ' + t.periodoLetivo.nome}
                    to={'/professor/disciplinas/' + t.disciplina.id + '/turmas/' + t.turma.id}>Painel</Link>
                  <Link aria-label={'Conteúdo de ' + t.disciplina.nome + ' · turma ' + t.turma.codigo + ' · ' + t.periodoLetivo.nome}
                    to={'/professor/disciplinas/' + t.disciplina.id + '/conteudo'}>Conteúdo</Link>
                </>}>
                <strong>{t.disciplina.nome}</strong>
                <p className="meta">{t.graduacao.nome} · Turma {t.turma.codigo} · {t.periodoLetivo.nome} · {t.disciplina.status === 'publicado' ? 'Publicada' : 'Em rascunho'}</p>
              </Registro>
            ))}
          </ListaRegistros>
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
            <p><Link to="/professor">Voltar às turmas</Link></p>
            <h1>{p.contexto.disciplina.nome} — Turma {p.contexto.turma.codigo}</h1>
            <p className="meta">{p.contexto.graduacao.nome} · {p.contexto.periodoLetivo.nome}</p>
            <div className="acoes"><strong>{p.quantidadeMatriculados} matriculado(s)</strong><Link to={"/professor/disciplinas/" + disciplinaId + "/conteudo"}>Conteúdo da disciplina</Link></div>
            {p.quantidadeMatriculados === 0 && <Vazio>Nenhum aluno matriculado</Vazio>}
            <section aria-label="Indicadores agregados da turma" className="cartao">
              <h2>Indicadores da turma</h2>
              {medias.situacao === 'sem-dados' ? <p>Progresso médio: {medias.rotulo} · Domínio médio por tópico: {medias.rotulo}</p> : (
                <>
                  <p>Progresso médio: <strong>{medias.progressoMedio}%</strong></p>
                  <details><summary>Domínio médio por tópico</summary>
                  <ul className="lista-limpa">
                    {medias.dominioMedioPorTopico.map((t) => <li key={t.topicoId}>Domínio médio — {titulos.find((x) => x.topicoId === t.topicoId)?.titulo ?? t.topicoId}: {t.dominio}</li>)}
                  </ul></details>
                </>
              )}
            </section>
            {p.matriculados.length > 0 && (
              <ListaRegistros rotulo="Alunos matriculados">
                {p.matriculados.map((m) => (
                  <Registro key={m.matriculaId} rotulo={m.nome} acoes={
                    <Link aria-label={'Detalhe de ' + m.nome} to={'/professor/disciplinas/' + disciplinaId + '/turmas/' + turmaId + '/alunos/' + m.matriculaId}>Detalhe</Link>
                  }>
                    <strong>{m.nome}</strong>
                    <dl>
                      <DadoRegistro rotulo="Progresso"><BarraProgresso valor={m.progresso} rotulo={'Progresso de ' + m.nome} /></DadoRegistro>
                      <DadoRegistro rotulo="Taxa de acertos">{m.totalRespostas === 0 ? 'Sem atividade' : arredondarExibicao(m.taxaAcertos) + '%'}</DadoRegistro>
                      <DadoRegistro rotulo="Situação">{m.situacao === 'precisa-de-atencao' ? <span className="selo alerta-selo">Precisa de atenção</span> : m.situacao === 'sem-atividade' ? 'Sem atividade' : 'Regular'}</DadoRegistro>
                      <DadoRegistro rotulo="Última atividade">{m.ultimaAtividade ? formatarData(m.ultimaAtividade) : 'Sem atividade'}</DadoRegistro>
                    </dl>
                  </Registro>
                ))}
              </ListaRegistros>
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
          <p><Link to={`/professor/disciplinas/${disciplinaId}/turmas/${turmaId}`}>Voltar à turma</Link></p>
          <h1>{h.aluno.nome}</h1>
          <p className="meta">{h.contexto.disciplina.nome} · Turma {h.contexto.turma.codigo} · {h.contexto.periodoLetivo.nome}</p>
          <h2>Domínio por tópico</h2>
          <ul className="lista-limpa">{h.trilha.topicos.map((t) => <li key={t.topicoId}>{t.titulo}: {t.dominio}</li>)}</ul>
          <h2>Últimas respostas</h2>
          {h.respostas.length === 0 ? <Vazio>Sem atividade</Vazio> : (
            <ListaRegistros rotulo="Últimas respostas">
              {[...h.respostas].reverse().map((r) => (
                <Registro key={r.id} rotulo={'Resposta de ' + formatarData(r.data) + ' · ' + NOME_DIFICULDADE[r.dificuldade]}>
                  <details>
                    <summary>{formatarData(r.data)} · {NOME_DIFICULDADE[r.dificuldade]} · {r.acertou ? 'Acertou' : 'Errou'}</summary>
                    <p><strong>{r.enunciado}</strong></p>
                    <ol type="A">{r.alternativas.map((a, i) => <li key={i}>{a}{i === r.alternativa ? ' (escolhida)' : ''}{i === r.correta ? ' (correta)' : ''}</li>)}</ol>
                    <p><strong>Explicação:</strong> {r.explicacao}</p>
                  </details>
                </Registro>
              ))}
            </ListaRegistros>
          )}
        </>
      )}
    </Consulta>
  );
}
