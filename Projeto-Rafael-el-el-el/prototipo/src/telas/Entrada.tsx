import { Icone } from '../componentes/Interacao';
import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AREA_DA_FUNCAO, areaInicial, nomesDasFuncoes } from '../app/areas';
import { useApp } from '../app/contexto';
import { FUNCOES, NOME_FUNCAO, type Funcao } from '../dominio/tipos';
import { Demonstracao } from './Restauracao';
import { PularParaConteudo } from '../componentes/comuns';

const apresentacao: Record<Funcao, { icone: 'livro' | 'pessoa' | 'painel'; texto: string }> = {
 aluno: { icone: 'livro', texto: 'Continue sua aprendizagem, uma turma por vez.' },
 professor: { icone: 'livro', texto: 'Cuide do conteúdo e acompanhe suas turmas.' },
 coordenador: { icone: 'painel', texto: 'Organize ofertas e acompanhe seus cursos.' },
 admin: { icone: 'painel', texto: 'Gerencie pessoas, vínculos e a estrutura acadêmica.' },
 responsavel: { icone: 'pessoa', texto: 'Acompanhe a aprendizagem dos alunos vinculados.' },
};

export function Entrada() {
  const { repo, usuario, versao, executar } = useApp();
  const navegar = useNavigate();
  const [pessoas, setPessoas] = useState<{ id: string; nome: string; funcoes: Funcao[] }[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [erroLista, setErroLista] = useState<string | null>(null);
  const [funcao, setFuncao] = useState<Funcao | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [entrandoId, setEntrandoId] = useState<string | null>(null);
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
    setErro(null); setOcupado(true); setEntrandoId(id);
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
    } finally { setOcupado(false); setEntrandoId(null); }
  };

  const escolher = (f: Funcao | null) => { setFuncao(f); setErro(null); setErroLista(null); };
  const candidatos = pessoas?.filter((p) => p.funcoes.includes(funcao!)) ?? [];

  return (
    <><PularParaConteudo /><main id="conteudo" tabIndex={-1} className="entrada">
      <p className="entrada-marca"><Icone nome="livro" /> SEU ESPAÇO DE APRENDIZAGEM</p><h1>Trilha Adaptativa</h1>
      <p className="sub">Aprendizagem no seu ritmo, em cada turma.</p>
      <p>Protótipo com dados fictícios e entrada simulada, sem senha. Escolha uma função e depois uma pessoa para entrar.</p>
      <ol className="etapas-entrada" aria-label="Etapas da entrada"><li aria-current={!funcao ? 'step' : undefined}><span>1</span> Função</li><li aria-current={funcao && !ocupado ? 'step' : undefined}><span>2</span> Pessoa</li><li aria-current={ocupado ? 'step' : undefined}><span>3</span> Entrar</li></ol>
      <h2 tabIndex={-1} ref={etapa}>{funcao ? `Escolha uma pessoa — ${NOME_FUNCAO[funcao]}` : 'Escolha sua função'}</h2>
      {funcao && <button className="secundario" disabled={ocupado} onClick={() => escolher(null)}>Voltar às funções</button>}
      {erro && <p role="alert" className="alerta">{erro}</p>}
      {erroLista && <div role="alert"><p>{erroLista}</p><button onClick={() => setAtualizacao((v) => v + 1)}>Tentar novamente</button></div>}
      {pessoas === null ? <p className="carregando" role="status">Carregando…</p> : !funcao ? (
        <ul className="lista-limpa grade-perfis funcoes-entrada">
          {FUNCOES.filter((f) => pessoas.some((p) => p.funcoes.includes(f))).map((f) => (
            <li key={f}><button className="largo cartao-funcao" aria-label={NOME_FUNCAO[f]} onClick={() => escolher(f)}><Icone nome={apresentacao[f].icone} /><strong>{NOME_FUNCAO[f]}</strong><span>{apresentacao[f].texto}</span></button></li>
          ))}
          {pessoas.length === 0 && !erroLista && <li>Nenhuma função disponível no momento.</li>}
        </ul>
      ) : (
        <ul className="lista-limpa grade-perfis pessoas-entrada">
          {candidatos.length === 0 && !erroLista && <li>Nenhuma pessoa ativa disponível para esta função.</li>}
          {candidatos.map((p) => (
            <li key={p.id} className="cartao">
              <button className="largo" disabled={ocupado} onClick={() => entrar(p.id)} aria-busy={ocupado && entrandoId === p.id}>{ocupado && entrandoId === p.id ? 'Entrando como ' + p.nome + '…' : 'Entrar como ' + p.nome}</button>
              <small className="meta">{nomesDasFuncoes(p.funcoes)}</small>
            </li>
          ))}
        </ul>
      )}
      <Demonstracao />
    </main></>
  );
}
