import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useConsulta } from '../../app/contexto';
import { DadoRegistro, ListaRegistros, Registro } from '../../componentes/Gestao';
import { Consulta, Vazio } from '../../componentes/comuns';
import type { IndicadoresCoordenacao } from '../../dados/contratos-consultas-academicas';
import { exibirMedias } from '../../desempenho/apresentacao';

type Oferta = IndicadoresCoordenacao['turmas'][number];
type Opcao = { id: string; nome: string };

function unicas(opcoes: Opcao[]): Opcao[] {
  return [...new Map(opcoes.map((x) => [x.id, x])).values()];
}

function selecaoValida(opcoes: Opcao[], id: string | null): string {
  return opcoes.some((x) => x.id === id) ? id! : '';
}

function Seletor({ rotulo, todas, valor, opcoes, mudar }: {
  rotulo: string; todas: string; valor: string; opcoes: Opcao[]; mudar: (valor: string) => void;
}) {
  return <label>{rotulo}<select value={valor} onChange={(e) => mudar(e.target.value)}>
    <option value="">{todas}</option>
    {opcoes.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}
  </select></label>;
}

export function PainelCoordenador() {
  const estado = useConsulta((r) => r.consultarIndicadoresCoordenacao());
  return <>
    <h1>Painel da coordenação</h1>
    <p className="sub">Indicadores por turma dos cursos que você coordena.</p>
    <Consulta estado={estado}>{({ turmas }) => <Indicadores turmas={turmas} />}</Consulta>
  </>;
}

function Indicadores({ turmas }: { turmas: Oferta[] }) {
  const [params, setParams] = useSearchParams();
  const graduacoes = unicas(turmas.map((t) => t.contexto.graduacao));
  const graduacao = selecaoValida(graduacoes, params.get('graduacao'));
  const nasGraduacoes = turmas.filter((t) => !graduacao || t.contexto.graduacao.id === graduacao);
  const disciplinas = unicas(nasGraduacoes.map((t) => t.contexto.disciplina));
  const disciplina = selecaoValida(disciplinas, params.get('disciplina'));
  const periodos = unicas(nasGraduacoes.map((t) => t.contexto.periodoLetivo));
  const periodo = selecaoValida(periodos, params.get('periodo'));
  const ofertas = nasGraduacoes.filter((t) => (!disciplina || t.contexto.disciplina.id === disciplina)
    && (!periodo || t.contexto.periodoLetivo.id === periodo));
  const opcoesTurmas = ofertas.map((t) => ({
    id: t.turmaId, nome: 'Turma ' + t.contexto.turma.codigo + ' · ' + t.contexto.disciplina.nome + ' · ' + t.contexto.periodoLetivo.nome,
  }));
  const turma = selecaoValida(opcoesTurmas, params.get('turma'));
  const selecao = { graduacao, disciplina, periodo, turma };
  const validos = new URLSearchParams(Object.entries(selecao).filter(([, id]) => id));
  const visiveis = turma ? ofertas.filter((t) => t.turmaId === turma) : ofertas;

  useEffect(() => {
    const canonica = validos.toString();
    if (params.toString() !== canonica) setParams(validos, { replace: true });
  }, [params.toString(), validos.toString(), setParams]);

  const mudar = (chave: keyof typeof selecao, id: string) => {
    const novos = new URLSearchParams(validos);
    if (id) novos.set(chave, id); else novos.delete(chave);
    setParams(novos, { replace: true });
  };

  if (!turmas.length) return <Vazio>Nenhuma turma disponível nas graduações vinculadas.</Vazio>;
  return <>
    <form className="filtros filtros-coordenacao cartao" aria-label="Selecionar oferta" onSubmit={(e) => e.preventDefault()}>
      <Seletor rotulo="Graduação" todas="Todas" valor={graduacao} opcoes={graduacoes} mudar={(id) => mudar('graduacao', id)} />
      <Seletor rotulo="Disciplina" todas="Todas" valor={disciplina} opcoes={disciplinas} mudar={(id) => mudar('disciplina', id)} />
      <Seletor rotulo="Período" todas="Todos" valor={periodo} opcoes={periodos} mudar={(id) => mudar('periodo', id)} />
      <Seletor rotulo="Turma" todas="Todas" valor={turma} opcoes={opcoesTurmas} mudar={(id) => mudar('turma', id)} />
    </form>
    {visiveis.length ? <ListaRegistros rotulo="Turmas e indicadores">
      {visiveis.map((oferta) => <IndicadorDaOferta key={oferta.turmaId} oferta={oferta} />)}
    </ListaRegistros> : <>
      <Vazio>Nenhuma turma encontrada para os filtros.</Vazio>
      <button className="secundario" onClick={() => setParams({}, { replace: true })}>Limpar filtros</button>
    </>}
  </>;
}

function IndicadorDaOferta({ oferta }: { oferta: Oferta }) {
  const { contexto, turmaId, quantidadeMatriculados, topicos } = oferta;
  const medias = exibirMedias(oferta.medias);
  const rotulo = contexto.disciplina.nome + ' · Turma ' + contexto.turma.codigo + ' · ' + contexto.periodoLetivo.nome;
  return <Registro rotulo={rotulo} acoes={
    <Link className="botao secundario" aria-label={'Gerir ' + rotulo} to={'/coordenacao/gestao/turmas/' + turmaId}>Gerir turma</Link>
  }>
    <strong>{rotulo}</strong>
    <p className="meta">{contexto.graduacao.nome}</p>
    <dl>
      <DadoRegistro rotulo="Matrículas">{quantidadeMatriculados}</DadoRegistro>
      <DadoRegistro rotulo="Progresso médio">{medias.situacao === 'sem-dados' ? medias.rotulo : medias.progressoMedio + '%'}</DadoRegistro>
      {medias.situacao === 'sem-dados' && <DadoRegistro rotulo="Domínio médio por tópico">{medias.rotulo}</DadoRegistro>}
    </dl>
    {medias.situacao === 'sem-dados' ? <p>Nenhum aluno matriculado</p> : <>
      <p className="meta">As médias incluem quem ainda não iniciou.</p>
      <details>
        <summary>Domínio por tópico</summary>
        <dl>{medias.dominioMedioPorTopico.map((d) => (
          <DadoRegistro key={d.topicoId} rotulo={topicos.find((t) => t.topicoId === d.topicoId)?.titulo ?? 'Tópico'}>{d.dominio}</DadoRegistro>
        ))}</dl>
      </details>
    </>}
  </Registro>;
}
