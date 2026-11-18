import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AREA_DA_FUNCAO, areaInicial, nomesDasFuncoes } from '../app/areas';
import { useApp } from '../app/contexto';
import { FUNCOES, NOME_FUNCAO, type Funcao } from '../dominio/tipos';
import { Demonstracao } from './Restauracao';

export function Entrada() {
  const { repo, usuario, versao, executar } = useApp();
  const navegar = useNavigate();
  const [pessoas, setPessoas] = useState<{ id: string; nome: string; funcoes: Funcao[] }[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [erroLista, setErroLista] = useState<string | null>(null);
  const [funcao, setFuncao] = useState<Funcao | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [atualizacao, setAtualizacao] = useState(0);
  const etapa = useRef<HTMLHeadingElement>(null);

  useEffect(() => { etapa.current?.focus(); }, [funcao]);

  useEffect(() => {
    let ativo = true;
    setPessoas(null); setErroLista(null);
    repo.listarPessoasEntrada().then((p) => ativo && setPessoas(p), () => {
      if (ativo) { setPessoas([]); setErroLista('Não foi possível carregar as opções de entrada.'); }
    });
    return () => { ativo = false; };
  }, [repo, versao, atualizacao]);

  if (usuario && !ocupado) return <Navigate to={areaInicial(usuario.funcoes)} replace />;

  const entrar = async (id: string) => {
    if (!funcao || ocupado) return;
    setErro(null); setOcupado(true);
    try {
      await executar(async (r) => {
        const pessoa = await r.entrar(id);
        if (!pessoa.funcoes.includes(funcao)) {
          await r.sair();
          throw new Error('Esta pessoa não está mais disponível para a função escolhida. Selecione outra opção.');
        }
      });
      navegar(AREA_DA_FUNCAO[funcao]);
    } catch (e) {
      setErro(`Entrada indisponível. ${e instanceof Error ? e.message : 'Selecione outra pessoa.'}`);
      setAtualizacao((v) => v + 1);
    } finally { setOcupado(false); }
  };

  const escolher = (f: Funcao | null) => { setFuncao(f); setErro(null); setErroLista(null); };
  const candidatos = pessoas?.filter((p) => p.funcoes.includes(funcao!)) ?? [];

  return (
    <main className="entrada">
      <h1>Trilha Adaptativa</h1>
      <p className="sub">Aprendizagem no seu ritmo, em cada turma.</p>
      <p>Protótipo com dados fictícios e entrada simulada, sem senha. Escolha uma função e depois uma pessoa para entrar.</p>
      <h2 tabIndex={-1} ref={etapa}>{funcao ? `Escolha uma pessoa — ${NOME_FUNCAO[funcao]}` : 'Escolha sua função'}</h2>
      {funcao && <button className="secundario" disabled={ocupado} onClick={() => escolher(null)}>Voltar às funções</button>}
      {erro && <p role="alert" className="alerta">{erro}</p>}
      {erroLista && <div role="alert"><p>{erroLista}</p><button onClick={() => setAtualizacao((v) => v + 1)}>Tentar novamente</button></div>}
      {pessoas === null ? <p className="carregando" role="status">Carregando…</p> : !funcao ? (
        <ul className="lista-limpa grade-perfis funcoes-entrada">
          {FUNCOES.filter((f) => pessoas.some((p) => p.funcoes.includes(f))).map((f) => (
            <li key={f}><button className="largo cartao-funcao" onClick={() => escolher(f)}>{NOME_FUNCAO[f]}</button></li>
          ))}
          {pessoas.length === 0 && !erroLista && <li>Nenhuma função disponível no momento.</li>}
        </ul>
      ) : (
        <ul className="lista-limpa grade-perfis pessoas-entrada">
          {candidatos.length === 0 && !erroLista && <li>Nenhuma pessoa ativa disponível para esta função.</li>}
          {candidatos.map((p) => (
            <li key={p.id} className="cartao">
              <button className="largo" disabled={ocupado} onClick={() => entrar(p.id)}>Entrar como {p.nome}</button>
              <small className="meta">{nomesDasFuncoes(p.funcoes)}</small>
            </li>
          ))}
        </ul>
      )}
      <Demonstracao />
    </main>
  );
}
