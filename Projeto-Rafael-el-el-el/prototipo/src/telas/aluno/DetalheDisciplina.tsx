import { Retorno } from '../../componentes/Interacao';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useConsulta } from '../../app/contexto';
import { ListaRegistros, Registro } from '../../componentes/Gestao';
import { Consulta, Vazio } from '../../componentes/comuns';

/** Metadados da disciplina e suas ofertas. "Continuar" existe somente para oferta em que o aluno já está matriculado. */
export function DetalheDisciplina() {
  const { disciplinaId = '' } = useParams();
  const [params] = useSearchParams();
  const criterios = new URLSearchParams([...params].filter(([k]) => ['busca', 'area', 'nivel', 'periodo'].includes(k)));
  const estado = useConsulta((r) => r.consultarMetadadosDisciplina({ disciplinaId }), [disciplinaId]);
  return (
    <Consulta estado={estado}>
      {({ graduacao, disciplina, topicos, ofertas }) => (
        <>
          <p><Retorno to={{ pathname: "/aluno/catalogo", search: criterios.toString() }}>Voltar ao catálogo</Retorno></p>
          <h1>{disciplina.nome}</h1>
          <p className="meta">{graduacao.nome} · {disciplina.codigo} · {disciplina.nivel}</p>
          <p>{disciplina.descricao}</p>
          <h2>Tópicos</h2>
          <ol>{topicos.map((t) => <li key={t.id}>{t.titulo}</li>)}</ol>
          <h2>Ofertas</h2>
          {ofertas.length === 0 ? <Vazio>Esta disciplina ainda não tem turmas.</Vazio> : (
            <ListaRegistros rotulo="Ofertas da disciplina">
              {ofertas.map((o) => (
                <Registro key={o.turma.id} acoes={o.acesso.situacao === 'matriculado' && <Link className="botao" aria-describedby={"oferta-" + o.turma.id} to={"/aluno/disciplinas/" + disciplina.id + "/turmas/" + o.turma.id}>Continuar</Link>}>
                  <strong id={"oferta-" + o.turma.id}>Turma {o.turma.codigo} · {o.periodoLetivo.nome}</strong>
                  <p className="meta">Professor(es): {o.professores.length ? o.professores.map((p) => p.nome).join(', ') : 'ainda não atribuído'}</p>
                  {o.acesso.situacao === 'matriculado'
                    ? <p className="meta">Matrícula ativa</p>
                    : <p className="meta">Você não está matriculado nesta turma. A matrícula é feita pela coordenação ou administração.</p>}
                </Registro>
              ))}
            </ListaRegistros>
          )}
        </>
      )}
    </Consulta>
  );
}
