import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { areaInicial, nomesDasFuncoes } from '../app/areas';
import { useApp } from '../app/contexto';
import type { Funcao } from '../dominio/tipos';
import { Restauracao } from './Restauracao';

export function Entrada() {
  const { repo, usuario, versao, executar } = useApp();
  const navegar = useNavigate();
  const [pessoas, setPessoas] = useState<{ id: string; nome: string; funcoes: Funcao[] }[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    repo.listarPessoasEntrada().then((p) => ativo && setPessoas(p), () => ativo && setPessoas([]));
    return () => { ativo = false; };
  }, [repo, versao]);

  if (usuario) return <Navigate to={areaInicial(usuario.funcoes)} replace />;

  const entrar = async (id: string) => {
    setErro(null);
    try {
      const pessoa = await executar((r) => r.entrar(id));
      navegar(areaInicial(pessoa.funcoes));
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível entrar.');
    }
  };

  return (
    <main className="entrada">
      <h1>Trilha Adaptativa</h1>
      <p className="sub">Protótipo navegável com dados fictícios. Escolha uma pessoa de demonstração para entrar (sem senha).</p>
      {erro && <p role="alert" className="alerta">{erro}</p>}
      {pessoas === null ? <p className="carregando">Carregando…</p> : (
        <ul className="lista-limpa grade-perfis">
          {pessoas.map((p) => (
            <li key={p.id} className="cartao">
              <button className="largo" onClick={() => entrar(p.id)}>Entrar como {p.nome}</button>
              <small className="meta">{nomesDasFuncoes(p.funcoes)}</small>
            </li>
          ))}
        </ul>
      )}
      <p><Restauracao /></p>
    </main>
  );
}
