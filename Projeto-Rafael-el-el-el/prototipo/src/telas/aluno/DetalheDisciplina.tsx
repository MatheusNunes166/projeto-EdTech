import { Link, useParams } from 'react-router-dom';
import { useConsulta } from '../../app/contexto';
import { Consulta, Vazio } from '../../componentes/comuns';

/** Metadados da disciplina e suas ofertas. "Continuar" existe somente para oferta em que o aluno já está matriculado. */
export function DetalheDisciplina() {
  const { disciplinaId = '' } = useParams();
  const estado = useConsulta((r) => r.consultarMetadadosDisciplina({ disciplinaId }), [disciplinaId]);
  return (
    <Consulta estado={estado}>
      {({ graduacao, disciplina, topicos, ofertas }) => (
        <>
          <p><Link to="/aluno/catalogo">← Catálogo</Link></p>
          <h1>{disciplina.nome}</h1>
          <p className="meta">{graduacao.nome} · {disciplina.codigo} · {disciplina.nivel}</p>
          <p>{disciplina.descricao}</p>
          <h2>Tópicos</h2>
          <ol>{topicos.map((t) => <li key={t.id}>{t.titulo}</li>)}</ol>
          <h2>Ofertas</h2>
          {ofertas.length === 0 ? <Vazio>Esta disciplina ainda não tem turmas.</Vazio> : (
            <ul className="lista-limpa">
              {ofertas.map((o) => (
                <li key={o.turma.id} className="cartao">
                  <strong>Turma {o.turma.codigo}</strong> · {o.periodoLetivo.nome}
                  <p className="meta">Professor(es): {o.professores.length ? o.professores.map((p) => p.nome).join(', ') : 'ainda não atribuído'}</p>
                  {o.acesso.situacao === 'matriculado'
                    ? <Link className="botao" to={`/aluno/disciplinas/${disciplina.id}/turmas/${o.turma.id}`}>Continuar</Link>
                    : <p className="meta">Você não está matriculado nesta turma. A matrícula é feita pela coordenação ou administração.</p>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Consulta>
  );
}
