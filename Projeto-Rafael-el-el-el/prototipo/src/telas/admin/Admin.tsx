import { MensagemSucesso } from '../../componentes/Interacao';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useComando, useConsulta } from '../../app/contexto';
import { DadoRegistro, ListaRegistros, PainelEdicao, Registro } from '../../componentes/Gestao';
import { Campo, Consulta, MensagemErro, Vazio } from '../../componentes/comuns';
import type { ErroComando } from '../../app/contexto';
import { FUNCOES, NOME_FUNCAO, type Funcao } from '../../dominio/tipos';

/** Procura o erro de um campo: a chave pode vir pura ou prefixada pelo ID do registro. */
export function erroDoCampo(erro: ErroComando | null, campo: string): string | undefined {
  if (!erro) return undefined;
  const chave = Object.keys(erro.detalhes).find((k) => k === campo || k.endsWith(`.${campo}`));
  return chave ? erro.detalhes[chave] : undefined;
}

export function VisaoGeral() {
  const estado = useConsulta((r) => r.consultarIndicadoresAdministracao());
  return (
    <>
      <h1>Visão geral</h1>
      <Consulta estado={estado}>
        {(i) => (
          <div className="indicadores">
            <section className="cartao" aria-label="Pessoas">
              <h2>Pessoas</h2>
              <p><span className="numero">{i.pessoas.total}</span> pessoas distintas</p>
              <ul className="lista-limpa">{FUNCOES.map((f) => <li key={f}>{NOME_FUNCAO[f]}: {i.pessoas.porFuncao[f]}</li>)}</ul>
              <p><Link to="/admin/usuarios">Gerir pessoas</Link> · <Link to="/admin/vinculos">Gerir vínculos</Link></p>
            </section>
            <section className="cartao" aria-label="Estrutura acadêmica">
              <h2>Estrutura acadêmica</h2>
              <ul className="lista-limpa">
                <li>Graduações: {i.graduacoes}</li>
                <li>Disciplinas publicadas: {i.disciplinas.publicadas}</li>
                <li>Disciplinas em rascunho: {i.disciplinas.rascunho}</li>
                <li>Períodos letivos: {i.periodosLetivos}</li>
                <li>Turmas: {i.turmas}</li>
                <li>Matrículas: {i.matriculas}</li>
              </ul>
              <div className="acoes"><Link to="/admin/graduacoes">Graduações e disciplinas</Link><Link to="/admin/periodos">Períodos e turmas</Link><Link to="/admin/gestao">Matrículas e docentes</Link></div>
            </section>
          </div>
        )}
      </Consulta>
    </>
  );
}

interface FormPessoa { id: string | null; nome: string; email: string; funcoes: Funcao[]; ativo: boolean }
const PESSOA_VAZIA: FormPessoa = { id: null, nome: '', email: '', funcoes: [], ativo: true };

export function Pessoas() {
  const estado = useConsulta((r) => r.consultarPessoas());
  const [form, setForm] = useState<FormPessoa>(PESSOA_VAZIA);
  const [editando, setEditando] = useState(false);
  const [aviso, setAviso] = useState('');
  const abrir = (pessoa: FormPessoa) => { limpar(); setAviso(''); setForm(pessoa); setEditando(true); };
  const fechar = () => { setEditando(false); limpar(); };
  const { rodar, erro, limpar, ocupado } = useComando();
  return (
    <>
      <h1>Pessoas e funções</h1>
      <Consulta estado={estado}>
        {({ pessoas }, revisao) => (
          <>
            {aviso && <MensagemSucesso>{aviso}</MensagemSucesso>}
            {!editando && <MensagemErro erro={erro} />}
            <div className="gestao-com-edicao">
            <section className="lista-gestao" aria-label="Cadastro de pessoas">
            <p><button type="button" onClick={() => abrir(PESSOA_VAZIA)}>Nova pessoa</button></p>
            {!pessoas.length ? <Vazio>Nenhuma pessoa cadastrada.</Vazio> : <ListaRegistros rotulo="Pessoas cadastradas">
              {pessoas.map((p) => (
                <Registro key={p.id} rotulo={p.nome} acoes={<>
                  <button type="button" className="secundario" aria-label={'Editar ' + p.nome} onClick={() => abrir({ ...p, funcoes: [...p.funcoes] })}>Editar</button>
                  <button type="button" className="secundario" disabled={ocupado} aria-label={(p.ativo ? 'Desativar ' : 'Ativar ') + p.nome}
                    onClick={async () => {
                      setAviso('');
                      const r = await rodar((repo) => repo.definirAtivo(p.id, !p.ativo, revisao));
                      if (r.ok) setAviso(p.nome + (p.ativo ? ' está inativa.' : ' está ativa.'));
                    }}>{p.ativo ? 'Desativar' : 'Ativar'}</button>
                </>}>
                  <strong>{p.nome}</strong>
                  <dl><DadoRegistro rotulo="E-mail">{p.email}</DadoRegistro><DadoRegistro rotulo="Funções">{p.funcoes.map((f) => NOME_FUNCAO[f]).join(', ') || '—'}</DadoRegistro><DadoRegistro rotulo="Situação">{p.ativo ? 'Ativa' : 'Inativa'}</DadoRegistro></dl>
                </Registro>
              ))}
            </ListaRegistros>}
            </section>
            {editando && <PainelEdicao titulo={form.id ? 'Editar ' + form.nome : 'Nova pessoa'}>
            <form className="formulario" aria-label={form.id ? 'Editar pessoa' : 'Nova pessoa'} onSubmit={async (e) => {
              e.preventDefault();
              const campos = { nome: form.nome, email: form.email, ativo: form.ativo, funcoes: form.funcoes };
              const r = await rodar((repo) => (form.id ? repo.editarUsuario(form.id, campos, revisao) : repo.criarUsuario(campos, revisao)));
              if (r.ok) { setAviso(form.nome + (form.id ? " atualizada." : " cadastrada.")); fechar(); }
            }}>
              <Campo rotulo="Nome" erro={erroDoCampo(erro, 'nome')}><input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></Campo>
              <Campo rotulo="E-mail" erro={erroDoCampo(erro, 'email')}><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Campo>
              <fieldset>
                <legend>Funções</legend>
                {FUNCOES.map((f) => (
                  <label key={f}><input type="checkbox" checked={form.funcoes.includes(f)} onChange={(e) => setForm({ ...form, funcoes: e.target.checked ? [...form.funcoes, f] : form.funcoes.filter((x) => x !== f) })} /> {NOME_FUNCAO[f]}</label>
                ))}
              </fieldset>
              <label><input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} /> Pessoa ativa</label>
              <MensagemErro erro={erro} ignorar={['nome', 'email']} />
              <div className="acoes">
                <button type="submit" disabled={ocupado} aria-busy={ocupado}>{ocupado ? 'Salvando…' : 'Salvar pessoa'}</button>
                <button type="button" className="secundario" onClick={fechar}>Cancelar edição</button>
              </div>
            </form>
            </PainelEdicao>}
            </div>
          </>
        )}
      </Consulta>
    </>
  );
}

export { Vinculos } from './Vinculos';
