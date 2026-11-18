import { MensagemSucesso } from '../../componentes/Interacao';
import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useComando, useConsulta, useUsuario } from '../../app/contexto';
import { ListaRegistros, Registro, PainelEdicao } from '../../componentes/Gestao';
import { Campo, Consulta, MensagemErro, Vazio } from '../../componentes/comuns';
import { NIVEIS_CURSO, type NivelCurso } from '../../dominio/tipos';
import { erroDoCampo } from './Admin';

const GRAD_VAZIA = { id: null as string | null, codigo: '', nome: '', area: '', descricao: '' };
const DISC_VAZIA = { id: null as string | null, graduacaoId: '', codigo: '', nome: '', descricaoCurta: '', descricao: '', nivel: 'Iniciante' as NivelCurso };

/**
 * Cadastro acadêmico de graduações e disciplinas. Só o Administrador cria graduações; a coordenação edita as suas.
 * Os formulários não enviam tópicos nem publicação: o conteúdo é do editor pedagógico.
 */
export function CadastroGraduacoesDisciplinas({ coordenacao = false }: { coordenacao?: boolean }) {
  const usuario = useUsuario();
  const admin = usuario.funcoes.includes('admin') && !coordenacao;
  const estado = useConsulta((r) => r.consultarEstruturaAdministravel());
  const [grad, setGrad] = useState(GRAD_VAZIA);
  const [disc, setDisc] = useState(DISC_VAZIA);
  const g = useComando();
  const d = useComando();
  const [edicao, setEdicao] = useState<'grad' | 'disc' | null>(null);
  const [aviso, setAviso] = useState('');
  const Titulo = coordenacao ? 'h2' : 'h1';
  return <>
    <Titulo>Graduações e disciplinas</Titulo>
    {aviso && <MensagemSucesso>{aviso}</MensagemSucesso>}
    <Consulta estado={estado}>{({ graduacoes, disciplinas }, revisao) => (
      <div className="gestao-com-edicao">
        <div className="lista-gestao cadastros-listas">
          <section>
            <h2>Graduações</h2>
            {admin && <p><button onClick={() => { g.limpar(); setAviso(''); setGrad(GRAD_VAZIA); setEdicao('grad'); }}>Nova graduação</button></p>}
            {graduacoes.length ? <ListaRegistros rotulo="Graduações">{graduacoes.map((x) => (
              <Registro key={x.id} acoes={<>
                <button className="secundario" aria-label={'Editar graduação ' + x.nome} onClick={() => { g.limpar(); setAviso(''); setGrad({ id: x.id, codigo: x.codigo, nome: x.nome, area: x.area, descricao: x.descricao }); setEdicao('grad'); }}>Editar</button>

              </>}><strong>{x.codigo + " — " + x.nome}</strong><p className="meta">{x.area}</p></Registro>
            ))}</ListaRegistros> : <Vazio>Nenhum registro nesta seção.</Vazio>}
          </section>
<section>
            <h2>Disciplinas</h2>
            <p><button onClick={() => { d.limpar(); setAviso(''); setDisc(DISC_VAZIA); setEdicao('disc'); }}>Nova disciplina</button></p>
            {disciplinas.length ? <ListaRegistros rotulo="Disciplinas">{disciplinas.map((x) => (
              <Registro key={x.id} acoes={<>
                <button className="secundario" aria-label={'Editar disciplina ' + x.nome} onClick={() => { d.limpar(); setAviso(''); setDisc({ id: x.id, graduacaoId: x.graduacaoId, codigo: x.codigo, nome: x.nome, descricaoCurta: x.descricaoCurta, descricao: x.descricao, nivel: x.nivel }); setEdicao('disc'); }}>Editar</button>
                {admin && <Link aria-label={"Conteúdo de " + x.nome} to={"/admin/disciplinas/" + x.id + "/conteudo"}>Conteúdo</Link>}
              </>}><strong>{x.codigo + " — " + x.nome}</strong><p className="meta">{graduacoes.find((g) => g.id === x.graduacaoId)?.nome + " · " + x.nivel + " · " + (x.status === "publicado" ? "Publicada" : "Em rascunho")}</p></Registro>
            ))}</ListaRegistros> : <Vazio>Nenhum registro nesta seção.</Vazio>}
          </section>
        </div>
        {edicao === 'grad' && <PainelEdicao titulo={grad.id ? 'Editar graduação' : 'Nova graduação'}>
<form className="formulario" aria-label={grad.id ? 'Editar graduação' : 'Nova graduação'} onSubmit={async (e: FormEvent) => {
                e.preventDefault();
                if (g.ocupado) return;
                const campos = { codigo: grad.codigo, nome: grad.nome, area: grad.area, descricao: grad.descricao };
                const r = await g.rodar((repo) => (grad.id ? repo.editarGraduacao(grad.id, campos, revisao) : repo.criarGraduacao(campos, revisao)));
                if (r.ok) { setAviso('Graduação salva com sucesso.'); setEdicao(null); }
              }}>
                <Campo rotulo="Código da graduação" erro={erroDoCampo(g.erro, 'codigo')}><input className="campo-curto" value={grad.codigo} onChange={(e) => setGrad({ ...grad, codigo: e.target.value })} /></Campo>
                <Campo rotulo="Nome da graduação" erro={erroDoCampo(g.erro, 'nome')}><input value={grad.nome} onChange={(e) => setGrad({ ...grad, nome: e.target.value })} /></Campo>
                <Campo rotulo="Área da graduação"><input value={grad.area} onChange={(e) => setGrad({ ...grad, area: e.target.value })} /></Campo>
                <Campo rotulo="Descrição da graduação"><textarea value={grad.descricao} onChange={(e) => setGrad({ ...grad, descricao: e.target.value })} /></Campo>
                <MensagemErro erro={g.erro} ignorar={['codigo', 'nome']} />
                <div className="acoes">
                  <button type="submit" disabled={g.ocupado}>{g.ocupado ? 'Salvando…' : 'Salvar graduação'}</button>
                  <button type="button" className="secundario" onClick={() => { setEdicao(null); }}>Cancelar edição da graduação</button>
                </div>
              </form>
</PainelEdicao>}
{edicao === 'disc' && <PainelEdicao titulo={disc.id ? 'Editar disciplina' : 'Nova disciplina'}>
<form className="formulario" aria-label={disc.id ? 'Editar disciplina' : 'Nova disciplina'} onSubmit={async (e: FormEvent) => {
              e.preventDefault();
                if (d.ocupado) return;
              const campos = { graduacaoId: disc.graduacaoId, codigo: disc.codigo, nome: disc.nome, descricaoCurta: disc.descricaoCurta, descricao: disc.descricao, nivel: disc.nivel };
              const r = await d.rodar((repo) => (disc.id ? repo.editarDisciplina({ disciplinaId: disc.id }, campos, revisao) : repo.criarDisciplina(campos, revisao)));
              if (r.ok) { setAviso('Disciplina salva com sucesso.'); setEdicao(null); }
            }}>
              <h3>{disc.id ? 'Editar disciplina' : 'Nova disciplina'}</h3>
              <Campo rotulo="Graduação da disciplina" erro={erroDoCampo(d.erro, 'graduacaoId')}>
                <select aria-describedby={disc.id && disciplinas.find((x) => x.id === disc.id)?.identidadeProtegida ? "bloqueio-graduacao" : undefined} disabled={disciplinas.find((x) => x.id === disc.id)?.identidadeProtegida} value={disc.graduacaoId} onChange={(e) => setDisc({ ...disc, graduacaoId: e.target.value })}>
                  <option value="">Escolha…</option>{graduacoes.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}
                </select>
              </Campo>
              {disciplinas.find((x) => x.id === disc.id)?.identidadeProtegida && <p id="bloqueio-graduacao" className="meta">Há matrícula ou resposta. Crie outra oferta em vez de trocar a graduação.</p>}
              <Campo rotulo="Código da disciplina" erro={erroDoCampo(d.erro, 'codigo')}><input className="campo-curto" value={disc.codigo} onChange={(e) => setDisc({ ...disc, codigo: e.target.value })} /></Campo>
              <Campo rotulo="Nome da disciplina" erro={erroDoCampo(d.erro, 'nome')}><input value={disc.nome} onChange={(e) => setDisc({ ...disc, nome: e.target.value })} /></Campo>
              <Campo rotulo="Descrição curta da disciplina"><input value={disc.descricaoCurta} onChange={(e) => setDisc({ ...disc, descricaoCurta: e.target.value })} /></Campo>
              <Campo rotulo="Descrição da disciplina"><textarea value={disc.descricao} onChange={(e) => setDisc({ ...disc, descricao: e.target.value })} /></Campo>
              <Campo rotulo="Nível da disciplina">
                <select value={disc.nivel} onChange={(e) => setDisc({ ...disc, nivel: e.target.value as NivelCurso })}>{NIVEIS_CURSO.map((n) => <option key={n} value={n}>{n}</option>)}</select>
              </Campo>
              <MensagemErro erro={d.erro} ignorar={['graduacaoId', 'codigo', 'nome']} />
              <div className="acoes">
                <button type="submit" disabled={d.ocupado}>{d.ocupado ? 'Salvando…' : 'Salvar disciplina'}</button>
                <button type="button" className="secundario" onClick={() => { setEdicao(null); }}>Cancelar edição da disciplina</button>
              </div>
            </form>
</PainelEdicao>}
      </div>
    )}</Consulta>
  </>;
}


const PER_VAZIO = { id: null as string | null, nome: '', dataInicio: '', dataFim: '' };
const TURMA_VAZIA = { id: null as string | null, codigo: '', disciplinaId: '', periodoLetivoId: '' };

/** Períodos letivos (globais, só o Administrador) e turmas (ofertas). Datas são identificação da oferta, não restringem acesso. */
export function CadastroPeriodosTurmas({ coordenacao = false }: { coordenacao?: boolean }) {
  const admin = useUsuario().funcoes.includes('admin') && !coordenacao;
  const estado = useConsulta((r) => r.consultarEstruturaAdministravel());
  const [per, setPer] = useState(PER_VAZIO);
  const [turma, setTurma] = useState(TURMA_VAZIA);
  const p = useComando();
  const t = useComando();
  const [edicao, setEdicao] = useState<'per' | 'turma' | null>(null);
  const [aviso, setAviso] = useState('');
  const Titulo = coordenacao ? 'h2' : 'h1';
  return <>
    <Titulo>Períodos letivos e turmas</Titulo>
    {aviso && <MensagemSucesso>{aviso}</MensagemSucesso>}
    <Consulta estado={estado}>{({ periodosLetivos, disciplinas, turmas }, revisao) => (
      <div className="gestao-com-edicao">
        <div className="lista-gestao cadastros-listas">
          <section>
            <h2>Períodos letivos</h2>
            {admin && <p><button onClick={() => { p.limpar(); setAviso(''); setPer(PER_VAZIO); setEdicao('per'); }}>Novo período</button></p>}
            {periodosLetivos.length ? <ListaRegistros rotulo="Períodos letivos">{periodosLetivos.map((x) => (
              <Registro key={x.id} acoes={<>
                {admin && <button className="secundario" aria-label={'Editar período ' + x.nome} onClick={() => { p.limpar(); setAviso(''); setPer({ id: x.id, nome: x.nome, dataInicio: x.dataInicio, dataFim: x.dataFim }); setEdicao('per'); }}>Editar</button>}

              </>}><strong>{x.nome + " (" + x.dataInicio + " a " + x.dataFim + ")"}</strong></Registro>
            ))}</ListaRegistros> : <Vazio>Nenhum registro nesta seção.</Vazio>}
          </section>
<section>
            <h2>Turmas</h2>
            <p><button onClick={() => { t.limpar(); setAviso(''); setTurma(TURMA_VAZIA); setEdicao('turma'); }}>Nova turma</button></p>
            {turmas.length ? <ListaRegistros rotulo="Turmas">{turmas.map((x) => (
              <Registro key={x.turma.id} acoes={<>
                <button className="secundario" aria-label={'Editar turma ' + x.turma.codigo + " de " + x.disciplina.nome + " (" + x.periodoLetivo.nome + ")"} onClick={() => { t.limpar(); setAviso(''); setTurma({ id: x.turma.id, codigo: x.turma.codigo, disciplinaId: x.disciplina.id, periodoLetivoId: x.periodoLetivo.id }); setEdicao('turma'); }}>Editar</button>

              </>}><strong>{x.disciplina.nome + " — Turma " + x.turma.codigo + " — " + x.periodoLetivo.nome}</strong><p className="meta">{x.graduacao.nome}</p></Registro>
            ))}</ListaRegistros> : <Vazio>Nenhum registro nesta seção.</Vazio>}
          </section>
        </div>
        {edicao === 'per' && <PainelEdicao titulo={per.id ? 'Editar período' : 'Novo período'}>
<form className="formulario" aria-label={per.id ? 'Editar período' : 'Novo período'} onSubmit={async (e: FormEvent) => {
                e.preventDefault();
                if (p.ocupado) return;
                const campos = { nome: per.nome, dataInicio: per.dataInicio, dataFim: per.dataFim };
                const r = await p.rodar((repo) => (per.id ? repo.editarPeriodoLetivo(per.id, campos, revisao) : repo.criarPeriodoLetivo(campos, revisao)));
                if (r.ok) { setAviso('Período salvo com sucesso.'); setEdicao(null); }
              }}>
                <Campo rotulo="Nome do período" erro={erroDoCampo(p.erro, 'nome')}><input value={per.nome} onChange={(e) => setPer({ ...per, nome: e.target.value })} /></Campo>
                <Campo rotulo="Data de início" erro={erroDoCampo(p.erro, 'dataInicio')}><input value={per.dataInicio} placeholder="AAAA-MM-DD" onChange={(e) => setPer({ ...per, dataInicio: e.target.value })} /></Campo>
                <Campo rotulo="Data de fim" erro={erroDoCampo(p.erro, 'dataFim')}><input value={per.dataFim} placeholder="AAAA-MM-DD" onChange={(e) => setPer({ ...per, dataFim: e.target.value })} /></Campo>
                <MensagemErro erro={p.erro} ignorar={['nome', 'dataInicio', 'dataFim']} />
                <div className="acoes">
                  <button type="submit" disabled={p.ocupado}>{p.ocupado ? 'Salvando…' : 'Salvar período'}</button>
                  <button type="button" className="secundario" onClick={() => { setEdicao(null); }}>Cancelar edição do período</button>
                </div>
              </form>
</PainelEdicao>}
{edicao === 'turma' && <PainelEdicao titulo={turma.id ? 'Editar turma' : 'Nova turma'}>
<form className="formulario" aria-label={turma.id ? 'Editar turma' : 'Nova turma'} onSubmit={async (e: FormEvent) => {
              e.preventDefault();
                if (t.ocupado) return;
              const campos = { codigo: turma.codigo, disciplinaId: turma.disciplinaId, periodoLetivoId: turma.periodoLetivoId };
              const r = await t.rodar((repo) => (turma.id ? repo.editarTurma({ turmaId: turma.id }, campos, revisao) : repo.criarTurma(campos, revisao)));
              if (r.ok) { setAviso('Turma salva com sucesso.'); setEdicao(null); }
            }}>
              <h3>{turma.id ? 'Editar turma' : 'Nova turma'}</h3>
              <Campo rotulo="Disciplina da turma" erro={erroDoCampo(t.erro, 'disciplinaId') ?? erroDoCampo(t.erro, 'oferta')}>
                <select aria-describedby={turmas.find((x) => x.turma.id === turma.id)?.identidadeProtegida ? "bloqueio-oferta" : undefined} disabled={turmas.find((x) => x.turma.id === turma.id)?.identidadeProtegida} value={turma.disciplinaId} onChange={(e) => setTurma({ ...turma, disciplinaId: e.target.value })}>
                  <option value="">Escolha…</option>{disciplinas.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}
                </select>
              </Campo>
              <Campo rotulo="Período da turma" erro={erroDoCampo(t.erro, 'periodoLetivoId')}>
                <select aria-describedby={turmas.find((x) => x.turma.id === turma.id)?.identidadeProtegida ? "bloqueio-oferta" : undefined} disabled={turmas.find((x) => x.turma.id === turma.id)?.identidadeProtegida} value={turma.periodoLetivoId} onChange={(e) => setTurma({ ...turma, periodoLetivoId: e.target.value })}>
                  <option value="">Escolha…</option>{periodosLetivos.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}
                </select>
              </Campo>
              {turmas.find((x) => x.turma.id === turma.id)?.identidadeProtegida && <p id="bloqueio-oferta" className="meta">Há matrícula ou resposta. Crie outra turma em vez de trocar a disciplina ou o período.</p>}
              <Campo rotulo="Código da turma" erro={erroDoCampo(t.erro, 'codigo')}><input className="campo-curto" value={turma.codigo} onChange={(e) => setTurma({ ...turma, codigo: e.target.value })} /></Campo>
              <MensagemErro erro={t.erro} ignorar={['disciplinaId', 'periodoLetivoId', 'codigo', 'oferta']} />
              <div className="acoes">
                <button type="submit" disabled={t.ocupado}>{t.ocupado ? 'Salvando…' : 'Salvar turma'}</button>
                <button type="button" className="secundario" onClick={() => { setEdicao(null); }}>Cancelar edição da turma</button>
              </div>
            </form>
</PainelEdicao>}
      </div>
    )}</Consulta>
  </>;
}

export function CadastrosCoordenacao() {
  const { search } = useLocation();
  const periodos = new URLSearchParams(search).get('secao') === 'ofertas';
  return <>
    <h1>Cadastros</h1>
    <nav className="acoes" aria-label="Grupos de cadastros">
      <Link to="/coordenacao/cadastros" aria-current={!periodos ? 'page' : undefined}>Graduações e disciplinas</Link>
      <Link to="/coordenacao/cadastros?secao=ofertas" aria-current={periodos ? 'page' : undefined}>Períodos e turmas</Link>
    </nav>
    {periodos ? <CadastroPeriodosTurmas coordenacao /> : <CadastroGraduacoesDisciplinas coordenacao />}
  </>;
}
