import { Link } from 'react-router-dom';
import { useConsulta } from '../../app/contexto';
import { BarraProgresso, Consulta } from '../../componentes/comuns';
import type { AlvoMatricula } from '../../dados/comandos-estudo';
import { formatarData } from '../../dominio/datas';
import { caminhoTurma, useAlvoDaRota } from './rota';

export function Trilha() {
  const alvo = useAlvoDaRota();
  return <Consulta estado={alvo}>{(a) => <TrilhaDaMatricula alvo={a} />}</Consulta>;
}

function TrilhaDaMatricula({ alvo }: { alvo: AlvoMatricula }) {
  const estado = useConsulta((r) => r.consultarTrilha(alvo), [alvo.matriculaId]);
  const base = caminhoTurma(alvo);
  return (
    <Consulta estado={estado}>
      {({ contexto, trilha, gamificacao }) => (
        <>
          <p><Link to="/aluno">← Minhas turmas</Link></p>
          <h1>{contexto.disciplina.nome}</h1>
          <p className="meta">{contexto.graduacao.nome} · Turma {contexto.turma.codigo} · {contexto.periodoLetivo.nome}</p>
          <BarraProgresso valor={trilha.progresso} rotulo={`Progresso em ${contexto.disciplina.nome} turma ${contexto.turma.codigo}`} />
          {trilha.concluido && <p className="destaque">Trilha concluída nesta turma (isto não representa aprovação acadêmica).</p>}
          <section className="indicadores" aria-label={`Gamificação da turma ${contexto.turma.codigo} de ${contexto.periodoLetivo.nome}`}>
            <p><strong>{gamificacao.xp}</strong> XP · Sequência: <strong>{gamificacao.sequenciaDias}</strong> dia(s)</p>
            {gamificacao.conquistas.length === 0 ? <p className="meta">Nenhuma conquista ainda.</p> : (
              <ul className="conquistas">{gamificacao.conquistas.map((c) => <li key={c.id}>🏆 {c.nome} <small>({formatarData(c.data)})</small></li>)}</ul>
            )}
          </section>
          <div className="acoes">
            {!trilha.concluido && <Link className="botao" to={`${base}/sessao`}>Estudar</Link>}
            <Link className="botao secundario" to={`${base}/desempenho`}>Desempenho</Link>
          </div>
          <h2>Tópicos</h2>
          <ol className="lista-topicos">
            {trilha.topicos.map((t) => (
              <li key={t.topicoId}>
                <strong>{t.titulo}</strong> — {t.dominado ? 'Dominado' : t.desbloqueado ? 'Desbloqueado' : 'Bloqueado'} · domínio {t.dominio}
                {t.desbloqueado && <> · <Link to={`${base}/topicos/${t.topicoId}`}>Materiais</Link></>}
              </li>
            ))}
          </ol>
        </>
      )}
    </Consulta>
  );
}
