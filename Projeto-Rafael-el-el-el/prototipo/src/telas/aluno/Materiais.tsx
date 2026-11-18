import { Link, useParams } from 'react-router-dom';
import { useConsulta } from '../../app/contexto';
import { Consulta, Vazio } from '../../componentes/comuns';
import { caminhoTurma, useAlvoDaRota } from './rota';

export function Materiais() {
  const { topicoId } = useParams();
  const alvo = useAlvoDaRota();
  return (
    <Consulta estado={alvo}>
      {(a) => <MateriaisDoTopico alvo={a} topicoId={topicoId ?? ''} />}
    </Consulta>
  );
}

function MateriaisDoTopico({ alvo, topicoId }: { alvo: Parameters<typeof caminhoTurma>[0]; topicoId: string }) {
  const estado = useConsulta((r) => r.consultarTrilha(alvo), [alvo.matriculaId]);
  return (
    <Consulta estado={estado}>
      {({ trilha, contexto }) => {
        const topico = trilha.topicos.find((t) => t.topicoId === topicoId && t.desbloqueado);
        if (!topico) return <><h1>Materiais indisponíveis</h1><Vazio>Tópico não encontrado ou ainda bloqueado.</Vazio><Link to={caminhoTurma(alvo)}>Voltar à trilha</Link></>;
        return (
          <>
            <p><Link to={caminhoTurma(alvo)}>← Voltar à trilha</Link></p>
            <h1>{topico.titulo}</h1>
            <p className="meta">{contexto.disciplina.nome} · Turma {contexto.turma.codigo} · {contexto.periodoLetivo.nome}</p>
            {topico.materiais.length === 0 ? <Vazio>Este tópico ainda não tem materiais.</Vazio> : topico.materiais.map((m) => (
              <article key={m.id} className="cartao material-leitura">
                <p className="meta">{m.tipo === 'texto' ? 'Texto' : m.tipo === 'video' ? 'Vídeo' : 'Arquivo'}</p>
                <h2>{m.titulo}</h2>
                {m.tipo === 'texto' ? <details><summary>Ler material</summary><p className="texto-material">{m.conteudo}</p></details> : <a href={m.conteudo} target="_blank" rel="noreferrer">{m.tipo === 'video' ? 'Assistir ao vídeo' : 'Abrir arquivo'}</a>}
              </article>
            ))}
          </>
        );
      }}
    </Consulta>
  );
}
