import { useState } from 'react';
import { useComando, useConsulta } from '../../app/contexto';
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
  const { rodar, erro, limpar } = useComando();
  return (
    <>
      <h1>Pessoas e funções</h1>
      <Consulta estado={estado}>
        {({ pessoas }, revisao) => (
          <>
            <table>
              <caption className="sr-only">Pessoas cadastradas</caption>
              <thead><tr><th>Nome</th><th>E-mail</th><th>Funções</th><th>Situação</th><th /></tr></thead>
              <tbody>
                {pessoas.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nome}</td><td>{p.email}</td><td>{p.funcoes.map((f) => NOME_FUNCAO[f]).join(', ') || '—'}</td><td>{p.ativo ? 'Ativa' : 'Inativa'}</td>
                    <td className="acoes-tabela">
                      <button className="secundario" onClick={() => { limpar(); setForm({ id: p.id, nome: p.nome, email: p.email, funcoes: [...p.funcoes], ativo: p.ativo }); }}>Editar {p.nome}</button>
                      <button className="secundario" onClick={() => rodar((r) => r.definirAtivo(p.id, !p.ativo, revisao))}>{p.ativo ? 'Desativar' : 'Ativar'} {p.nome}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <form className="cartao formulario" aria-label={form.id ? 'Editar pessoa' : 'Nova pessoa'} onSubmit={async (e) => {
              e.preventDefault();
              const campos = { nome: form.nome, email: form.email, ativo: form.ativo, funcoes: form.funcoes };
              const r = await rodar((repo) => (form.id ? repo.editarUsuario(form.id, campos, revisao) : repo.criarUsuario(campos, revisao)));
              if (r.ok) setForm(PESSOA_VAZIA);
            }}>
              <h2>{form.id ? 'Editar pessoa' : 'Nova pessoa'}</h2>
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
                <button type="submit">Salvar pessoa</button>
                {form.id && <button type="button" className="secundario" onClick={() => { setForm(PESSOA_VAZIA); limpar(); }}>Cancelar edição</button>}
              </div>
            </form>
          </>
        )}
      </Consulta>
    </>
  );
}

/** Vínculos globais, exclusivos do Administrador: coordenação–graduação e Responsável–Aluno. */
export function Vinculos() {
  const estado = useConsulta((r) => r.consultarPessoas());
  const [coordenador, setCoordenador] = useState('');
  const [graduacao, setGraduacao] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [aluno, setAluno] = useState('');
  const { rodar, erro } = useComando();
  return (
    <>
      <h1>Vínculos</h1>
      <Consulta estado={estado}>
        {({ pessoas, coordenacao, responsaveis, graduacoes }, revisao) => {
          const nome = (id: string) => pessoas.find((p) => p.id === id)?.nome ?? id;
          const nomeGrad = (id: string) => graduacoes.find((g) => g.id === id)?.nome ?? id;
          return (
            <>
              <section aria-label="Coordenação" className="cartao">
                <h2>Coordenação de graduações</h2>
                {coordenacao.length === 0 ? <Vazio>Nenhum vínculo de coordenação.</Vazio> : (
                  <ul>{coordenacao.map((v) => (
                    <li key={`${v.coordenadorId}-${v.graduacaoId}`}>{nome(v.coordenadorId)} coordena {nomeGrad(v.graduacaoId)}{' '}
                      <button className="secundario" onClick={() => rodar((r) => r.definirVinculoCoordenador(v, false, revisao))}>Remover coordenação de {nome(v.coordenadorId)} em {nomeGrad(v.graduacaoId)}</button></li>
                  ))}</ul>
                )}
                <div className="formulario">
                  <label>Pessoa coordenadora <select value={coordenador} onChange={(e) => setCoordenador(e.target.value)}><option value="">Escolha…</option>{pessoas.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>
                  <label>Graduação <select value={graduacao} onChange={(e) => setGraduacao(e.target.value)}><option value="">Escolha…</option>{graduacoes.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}</select></label>
                  <button disabled={!coordenador || !graduacao} onClick={() => rodar((r) => r.definirVinculoCoordenador({ coordenadorId: coordenador, graduacaoId: graduacao }, true, revisao))}>Atribuir coordenação</button>
                </div>
              </section>
              <section aria-label="Responsáveis" className="cartao">
                <h2>Responsável–Aluno</h2>
                {responsaveis.length === 0 ? <Vazio>Nenhum vínculo de responsável.</Vazio> : (
                  <ul>{responsaveis.map((v) => (
                    <li key={`${v.responsavelId}-${v.alunoId}`}>{nome(v.responsavelId)} acompanha {nome(v.alunoId)}{' '}
                      <button className="secundario" onClick={() => rodar((r) => r.definirVinculoResponsavel(v, false, revisao))}>Remover vínculo de {nome(v.responsavelId)} com {nome(v.alunoId)}</button></li>
                  ))}</ul>
                )}
                <div className="formulario">
                  <label>Responsável <select value={responsavel} onChange={(e) => setResponsavel(e.target.value)}><option value="">Escolha…</option>{pessoas.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>
                  <label>Aluno <select value={aluno} onChange={(e) => setAluno(e.target.value)}><option value="">Escolha…</option>{pessoas.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></label>
                  <button disabled={!responsavel || !aluno} onClick={() => rodar((r) => r.definirVinculoResponsavel({ responsavelId: responsavel, alunoId: aluno }, true, revisao))}>Vincular responsável</button>
                </div>
              </section>
              <MensagemErro erro={erro} />
            </>
          );
        }}
      </Consulta>
    </>
  );
}
