import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Expansor } from '../componentes/Expansor';
import { useNavigate } from 'react-router-dom';
import { normalizarErro, useApp } from '../app/contexto';

/**
 * Restaurar a demonstração exige aviso prévio: cancelar mantém alterações e a pessoa atual; confirmar
 * descarta o histórico fictício e encerra a sessão; falha de gravação mostra o erro, nunca sucesso.
 */
export function Restauracao({ rotulo = 'Restaurar dados de demonstração' }: { rotulo?: string }) {
  const { restaurar } = useApp();
  const navegar = useNavigate();
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const acionador = useRef<HTMLButtonElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (aberto) titulo.current?.focus(); }, [aberto]);

  const confirmar = async () => {
    if (ocupado) return;
    setErro(null); setOcupado(true);
    try {
      await restaurar(true);
      setAberto(false);
      navegar('/', { replace: true });
    } catch (e) {
      setErro(normalizarErro(e).mensagem);
    } finally { setOcupado(false); }
  };

  return (
    <>
      <button ref={acionador} className="secundario" onClick={() => setAberto(true)}>{rotulo}</button>
      {aberto && (
        <div role="alertdialog" aria-labelledby="rest-titulo" aria-describedby="rest-texto" className="cartao">
          <h2 id="rest-titulo" tabIndex={-1} ref={titulo}>Restaurar a demonstração?</h2>
          <p id="rest-texto">
            As alterações atuais e o histórico fictício <strong>serão apagados</strong> e a demonstração inicial será recuperada; a sessão atual será encerrada.
          </p>
          {erro && <p role="alert" className="alerta">Não foi possível restaurar: {erro}</p>}
          <div className="acoes">
            <button disabled={ocupado} onClick={confirmar}>Confirmar restauração</button>
            <button disabled={ocupado} className="secundario" onClick={() => { setAberto(false); setErro(null); acionador.current?.focus(); }}>Cancelar</button>
          </div>
        </div>
      )}
    </>
  );
}

export function Demonstracao({ children }: { children?: ReactNode }) {
  return <Expansor classe="demonstracao" rotulo="Demonstração"><div className="conteudo-demo">{children}<Restauracao /></div></Expansor>;
}
