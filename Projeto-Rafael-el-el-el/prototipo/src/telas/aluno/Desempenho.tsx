import { Link } from 'react-router-dom';
import { useConsulta } from '../../app/contexto';
import { BarraProgresso, Consulta } from '../../componentes/comuns';
import type { AlvoMatricula } from '../../dados/comandos-estudo';
import { arredondarExibicao } from '../../desempenho/apresentacao';
import { caminhoTurma, useAlvoDaRota } from './rota';

export function Desempenho() {
  const alvo = useAlvoDaRota();
  return <Consulta estado={alvo}>{(a) => <DesempenhoDaMatricula alvo={a} />}</Consulta>;
}

function DesempenhoDaMatricula({ alvo }: { alvo: AlvoMatricula }) {
  const estado = useConsulta((r) => r.consultarIndicadoresAluno(alvo), [alvo.matriculaId]);
  return (
    <Consulta estado={estado}>
      {(i) => (
        <>
          <p><Link to={caminhoTurma(alvo)}>← Voltar à trilha</Link></p>
          <h1>Desempenho em {i.contexto.disciplina.nome}</h1>
          <p className="meta">{i.contexto.graduacao.nome} · Turma {i.contexto.turma.codigo} · {i.contexto.periodoLetivo.nome}</p>
          <section className="cartao" aria-label="Indicadores da matrícula">
          <BarraProgresso valor={i.progresso} rotulo="Progresso" />
          <p>Taxa de acertos: <strong>{arredondarExibicao(i.taxaAcertos)}%</strong> {i.totalRespostas === 0 ? <em>(Sem atividade)</em> : <span>({i.totalRespostas} respostas registradas)</span>} · XP: <strong>{i.xp}</strong></p>
          </section>
          <h2>Domínio por tópico</h2>
          <ul className="lista-registros" aria-label="Domínio por tópico">
            {i.dominioPorTopico.map((t) => <li className="registro" key={t.topicoId}><strong>{t.titulo}</strong><span>Domínio: {t.dominio}</span></li>)}
          </ul>
        </>
      )}
    </Consulta>
  );
}
