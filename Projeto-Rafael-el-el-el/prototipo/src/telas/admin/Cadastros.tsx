import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useComando, useConsulta, useUsuario } from '../../app/contexto';
import { Campo, Consulta, MensagemErro, Vazio } from '../../componentes/comuns';
import { NIVEIS_CURSO, type NivelCurso } from '../../dominio/tipos';
import { erroDoCampo } from './Admin';

const GRAD_VAZIA = { id: null as string | null, codigo: '', nome: '', area: '', descricao: '' };
const DISC_VAZIA = { id: null as string | null, graduacaoId: '', codigo: '', nome: '', descricaoCurta: '', descricao: '', nivel: 'Iniciante' as NivelCurso };

/**
 * Cadastro acadêmico de graduações e disciplinas. Só o Administrador cria graduações; a coordenação edita as suas.
 * Os formulários não enviam tópicos nem publicação: o conteúdo é do editor pedagógico.
 */
export function CadastroGraduacoesDisciplinas() {
  const usuario = useUsuario();
  const admin = usuario.funcoes.includes('admin');
  const estado = useConsulta((r) => r.consultarEstruturaAdministravel());
  const [grad, setGrad] = useState(GRAD_VAZIA);
  const [disc, setDisc] = useState(DISC_VAZIA);
  const g = useComando();
  const d = useComando();
  return (
    <>
      <h1>Graduações e disciplinas</h1>
      <Consulta estado={estado}>
        {({ graduacoes, disciplinas }, revisao) => (
          <>
            <h2>Graduações</h2>
            {graduacoes.length === 0 ? <Vazio>Nenhuma graduação.</Vazio> : (
              <ul className="lista-limpa">{graduacoes.map((x) => (
                <li key={x.id}>{x.codigo} — {x.nome} <small className="meta">({x.area})</small>{' '}
                  <button className="secundario" onClick={() => { g.limpar(); setGrad({ id: x.id, codigo: x.codigo, nome: x.nome, area: x.area, descricao: x.descricao }); }}>Editar graduação {x.nome}</button></li>
              ))}</ul>
            )}
            {(admin || grad.id) && (
              <form className="cartao formulario" aria-label={grad.id ? 'Editar graduação' : 'Nova graduação'} onSubmit={async (e: FormEvent) => {
                e.preventDefault();
                const campos = { codigo: grad.codigo, nome: grad.nome, area: grad.area, descricao: grad.descricao };
                const r = await g.rodar((repo) => (grad.id ? repo.editarGraduacao(grad.id, campos, revisao) : repo.criarGraduacao(campos, revisao)));
                if (r.ok) setGrad(GRAD_VAZIA);
              }}>
                <h3>{grad.id ? 'Editar graduação' : 'Nova graduação'}</h3>
                <Campo rotulo="Código da graduação" erro={erroDoCampo(g.erro, 'codigo')}><input value={grad.codigo} onChange={(e) => setGrad({ ...grad, codigo: e.target.value })} /></Campo>
                <Campo rotulo="Nome da graduação" erro={erroDoCampo(g.erro, 'nome')}><input value={grad.nome} onChange={(e) => setGrad({ ...grad, nome: e.target.value })} /></Campo>
                <Campo rotulo="Área da graduação"><input value={grad.area} onChange={(e) => setGrad({ ...grad, area: e.target.value })} /></Campo>
                <Campo rotulo="Descrição da graduação"><textarea value={grad.descricao} onChange={(e) => setGrad({ ...grad, descricao: e.target.value })} /></Campo>
                <MensagemErro erro={g.erro} ignorar={['codigo', 'nome']} />
                <div className="acoes">
                  <button type="submit">Salvar graduação</button>
                  {grad.id && <button type="button" className="secundario" onClick={() => { setGrad(GRAD_VAZIA); g.limpar(); }}>Cancelar edição da graduação</button>}
                </div>
              </form>
            )}

            <h2>Disciplinas</h2>
            {disciplinas.length === 0 ? <Vazio>Nenhuma disciplina.</Vazio> : (
              <ul className="lista-limpa">{disciplinas.map((x) => (
                <li key={x.id}>{x.codigo} — {x.nome} <small className="meta">({graduacoes.find((y) => y.id === x.graduacaoId)?.nome} · {x.nivel} · {x.status === 'publicado' ? 'publicada' : 'rascunho'})</small>{' '}
                  {admin && <>{' '}<Link to={`/admin/disciplinas/${x.id}/conteudo`}>Conteúdo de {x.nome}</Link></>}{' '}
                  <button className="secundario" onClick={() => { d.limpar(); setDisc({ id: x.id, graduacaoId: x.graduacaoId, codigo: x.codigo, nome: x.nome, descricaoCurta: x.descricaoCurta, descricao: x.descricao, nivel: x.nivel }); }}>Editar disciplina {x.nome}</button></li>
              ))}</ul>
            )}
            <form className="cartao formulario" aria-label={disc.id ? 'Editar disciplina' : 'Nova disciplina'} onSubmit={async (e: FormEvent) => {
              e.preventDefault();
              const campos = { graduacaoId: disc.graduacaoId, codigo: disc.codigo, nome: disc.nome, descricaoCurta: disc.descricaoCurta, descricao: disc.descricao, nivel: disc.nivel };
              const r = await d.rodar((repo) => (disc.id ? repo.editarDisciplina({ disciplinaId: disc.id }, campos, revisao) : repo.criarDisciplina(campos, revisao)));
              if (r.ok) setDisc(DISC_VAZIA);
            }}>
              <h3>{disc.id ? 'Editar disciplina' : 'Nova disciplina'}</h3>
              <Campo rotulo="Graduação da disciplina" erro={erroDoCampo(d.erro, 'graduacaoId')}>
                <select value={disc.graduacaoId} onChange={(e) => setDisc({ ...disc, graduacaoId: e.target.value })}>
                  <option value="">Escolha…</option>{graduacoes.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}
                </select>
              </Campo>
              <Campo rotulo="Código da disciplina" erro={erroDoCampo(d.erro, 'codigo')}><input value={disc.codigo} onChange={(e) => setDisc({ ...disc, codigo: e.target.value })} /></Campo>
              <Campo rotulo="Nome da disciplina" erro={erroDoCampo(d.erro, 'nome')}><input value={disc.nome} onChange={(e) => setDisc({ ...disc, nome: e.target.value })} /></Campo>
              <Campo rotulo="Descrição curta da disciplina"><input value={disc.descricaoCurta} onChange={(e) => setDisc({ ...disc, descricaoCurta: e.target.value })} /></Campo>
              <Campo rotulo="Descrição da disciplina"><textarea value={disc.descricao} onChange={(e) => setDisc({ ...disc, descricao: e.target.value })} /></Campo>
              <Campo rotulo="Nível da disciplina">
                <select value={disc.nivel} onChange={(e) => setDisc({ ...disc, nivel: e.target.value as NivelCurso })}>{NIVEIS_CURSO.map((n) => <option key={n} value={n}>{n}</option>)}</select>
              </Campo>
              <MensagemErro erro={d.erro} ignorar={['graduacaoId', 'codigo', 'nome']} />
              <div className="acoes">
                <button type="submit">Salvar disciplina</button>
                {disc.id && <button type="button" className="secundario" onClick={() => { setDisc(DISC_VAZIA); d.limpar(); }}>Cancelar edição da disciplina</button>}
              </div>
            </form>
          </>
        )}
      </Consulta>
    </>
  );
}

const PER_VAZIO = { id: null as string | null, nome: '', dataInicio: '', dataFim: '' };
const TURMA_VAZIA = { id: null as string | null, codigo: '', disciplinaId: '', periodoLetivoId: '' };

/** Períodos letivos (globais, só o Administrador) e turmas (ofertas). Datas são identificação da oferta, não restringem acesso. */
export function CadastroPeriodosTurmas() {
  const admin = useUsuario().funcoes.includes('admin');
  const estado = useConsulta((r) => r.consultarEstruturaAdministravel());
  const [per, setPer] = useState(PER_VAZIO);
  const [turma, setTurma] = useState(TURMA_VAZIA);
  const p = useComando();
  const t = useComando();
  return (
    <>
      <h1>Períodos letivos e turmas</h1>
      <Consulta estado={estado}>
        {({ periodosLetivos, disciplinas, turmas }, revisao) => (
          <>
            <h2>Períodos letivos</h2>
            {periodosLetivos.length === 0 ? <Vazio>Nenhum período.</Vazio> : (
              <ul className="lista-limpa">{periodosLetivos.map((x) => (
                <li key={x.id}>{x.nome} ({x.dataInicio} a {x.dataFim})
                  {admin && <>{' '}<button className="secundario" onClick={() => { p.limpar(); setPer({ id: x.id, nome: x.nome, dataInicio: x.dataInicio, dataFim: x.dataFim }); }}>Editar período {x.nome}</button></>}</li>
              ))}</ul>
            )}
            {admin && (
              <form className="cartao formulario" aria-label={per.id ? 'Editar período' : 'Novo período'} onSubmit={async (e: FormEvent) => {
                e.preventDefault();
                const campos = { nome: per.nome, dataInicio: per.dataInicio, dataFim: per.dataFim };
                const r = await p.rodar((repo) => (per.id ? repo.editarPeriodoLetivo(per.id, campos, revisao) : repo.criarPeriodoLetivo(campos, revisao)));
                if (r.ok) setPer(PER_VAZIO);
              }}>
                <h3>{per.id ? 'Editar período' : 'Novo período'}</h3>
                <Campo rotulo="Nome do período" erro={erroDoCampo(p.erro, 'nome')}><input value={per.nome} onChange={(e) => setPer({ ...per, nome: e.target.value })} /></Campo>
                <Campo rotulo="Data de início" erro={erroDoCampo(p.erro, 'dataInicio')}><input value={per.dataInicio} placeholder="AAAA-MM-DD" onChange={(e) => setPer({ ...per, dataInicio: e.target.value })} /></Campo>
                <Campo rotulo="Data de fim" erro={erroDoCampo(p.erro, 'dataFim')}><input value={per.dataFim} placeholder="AAAA-MM-DD" onChange={(e) => setPer({ ...per, dataFim: e.target.value })} /></Campo>
                <MensagemErro erro={p.erro} ignorar={['nome', 'dataInicio', 'dataFim']} />
                <div className="acoes">
                  <button type="submit">Salvar período</button>
                  {per.id && <button type="button" className="secundario" onClick={() => { setPer(PER_VAZIO); p.limpar(); }}>Cancelar edição do período</button>}
                </div>
              </form>
            )}

            <h2>Turmas</h2>
            {turmas.length === 0 ? <Vazio>Nenhuma turma.</Vazio> : (
              <ul className="lista-limpa">{turmas.map((x) => (
                <li key={x.turma.id}>{x.disciplina.nome} — Turma {x.turma.codigo} — {x.periodoLetivo.nome}{' '}
                  <button className="secundario" onClick={() => { t.limpar(); setTurma({ id: x.turma.id, codigo: x.turma.codigo, disciplinaId: x.disciplina.id, periodoLetivoId: x.periodoLetivo.id }); }}>Editar turma {x.turma.codigo} de {x.disciplina.nome} ({x.periodoLetivo.nome})</button></li>
              ))}</ul>
            )}
            <form className="cartao formulario" aria-label={turma.id ? 'Editar turma' : 'Nova turma'} onSubmit={async (e: FormEvent) => {
              e.preventDefault();
              const campos = { codigo: turma.codigo, disciplinaId: turma.disciplinaId, periodoLetivoId: turma.periodoLetivoId };
              const r = await t.rodar((repo) => (turma.id ? repo.editarTurma({ turmaId: turma.id }, campos, revisao) : repo.criarTurma(campos, revisao)));
              if (r.ok) setTurma(TURMA_VAZIA);
            }}>
              <h3>{turma.id ? 'Editar turma' : 'Nova turma'}</h3>
              <Campo rotulo="Disciplina da turma" erro={erroDoCampo(t.erro, 'disciplinaId') ?? erroDoCampo(t.erro, 'oferta')}>
                <select value={turma.disciplinaId} onChange={(e) => setTurma({ ...turma, disciplinaId: e.target.value })}>
                  <option value="">Escolha…</option>{disciplinas.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}
                </select>
              </Campo>
              <Campo rotulo="Período da turma" erro={erroDoCampo(t.erro, 'periodoLetivoId')}>
                <select value={turma.periodoLetivoId} onChange={(e) => setTurma({ ...turma, periodoLetivoId: e.target.value })}>
                  <option value="">Escolha…</option>{periodosLetivos.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}
                </select>
              </Campo>
              <Campo rotulo="Código da turma" erro={erroDoCampo(t.erro, 'codigo')}><input value={turma.codigo} onChange={(e) => setTurma({ ...turma, codigo: e.target.value })} /></Campo>
              <MensagemErro erro={t.erro} ignorar={['disciplinaId', 'periodoLetivoId', 'codigo', 'oferta']} />
              <div className="acoes">
                <button type="submit">Salvar turma</button>
                {turma.id && <button type="button" className="secundario" onClick={() => { setTurma(TURMA_VAZIA); t.limpar(); }}>Cancelar edição da turma</button>}
              </div>
            </form>
          </>
        )}
      </Consulta>
    </>
  );
}
