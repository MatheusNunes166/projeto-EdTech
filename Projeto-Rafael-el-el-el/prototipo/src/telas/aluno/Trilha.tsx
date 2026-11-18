import { Retorno } from '../../componentes/Interacao';
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
      {({ contexto, trilha, gamificacao, proxima }) => (
        <div className="experiencia-trilha">
          <p><Retorno to="/aluno">Voltar às turmas</Retorno></p>
          <h1>{contexto.disciplina.nome}</h1>
          <p className="meta">{contexto.graduacao.nome} · Turma {contexto.turma.codigo} · {contexto.periodoLetivo.nome}</p>
          <section className="cartao resumo-trilha" aria-label="Progresso da trilha">
            <BarraProgresso valor={trilha.progresso} rotulo={`Progresso em ${contexto.disciplina.nome} turma ${contexto.turma.codigo}`} />
            {trilha.concluido ? <p className="destaque">Trilha concluída nesta turma (isto não representa aprovação acadêmica).</p>
              : proxima ? <p className="proximo-passo">Seu próximo passo: <strong>{proxima.topicoTitulo}</strong>.</p>
                : <p role="status">Não há questões disponíveis no momento.</p>}
            <div className="acoes">
              {!trilha.concluido && proxima && <Link className="botao" to={`${base}/sessao`}>Estudar</Link>}
              <Link className="botao secundario" to={`${base}/desempenho`}>Desempenho</Link>
            </div>
          </section>
          <h2>Tópicos</h2>
          <ol className="lista-limpa trilha topicos-estudo" aria-label="Tópicos da disciplina">
            {trilha.topicos.map((t) => (
              <li key={t.topicoId} className={`topico ${t.dominado ? 'dominado' : t.desbloqueado ? 'desbloqueado' : 'bloqueado'} ${!trilha.concluido && proxima?.topicoId === t.topicoId ? 'recomendado' : ''}`}>
                <strong>{t.titulo}</strong>
                <span>{t.dominado ? 'Dominado' : t.desbloqueado ? 'Desbloqueado' : 'Bloqueado'} · domínio {t.dominio}</span>
                {!trilha.concluido && proxima?.topicoId === t.topicoId && <span className="selo recomendado">Próximo recomendado</span>}
                {t.desbloqueado && <Link to={`${base}/topicos/${t.topicoId}`}>Materiais</Link>}
              </li>
            ))}
          </ol>
          <section className="resumo-gamificacao" aria-label={`Gamificação da turma ${contexto.turma.codigo} de ${contexto.periodoLetivo.nome}`}>
            <p><strong>{gamificacao.xp}</strong> XP · Sequência: <strong>{gamificacao.sequenciaDias}</strong> dia(s)</p>
            <details><summary>Conquistas ({gamificacao.conquistas.length})</summary>
              {gamificacao.conquistas.length === 0 ? <p className="meta">Nenhuma conquista ainda.</p>
                : <ul className="conquistas lista-limpa">{gamificacao.conquistas.map((c) => <li key={c.id}>{c.nome} <small>({formatarData(c.data)})</small></li>)}</ul>}
            </details>
          </section>
        </div>
      )}
    </Consulta>
  );
}
