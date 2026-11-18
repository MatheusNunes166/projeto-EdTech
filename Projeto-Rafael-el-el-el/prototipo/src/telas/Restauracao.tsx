import { useState } from 'react';
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

  const confirmar = async () => {
    setErro(null);
    try {
      await restaurar(true);
      setAberto(false);
      navegar('/', { replace: true });
    } catch (e) {
      setErro(normalizarErro(e).mensagem);
    }
  };

  return (
    <>
      <button className="secundario" onClick={() => setAberto(true)}>{rotulo}</button>
      {aberto && (
        <div role="alertdialog" aria-labelledby="rest-titulo" aria-describedby="rest-texto" className="cartao">
          <h2 id="rest-titulo">Restaurar a demonstração?</h2>
          <p id="rest-texto">
            As alterações atuais e o histórico fictício <strong>serão apagados</strong> e a demonstração inicial será recuperada; a sessão atual será encerrada.
          </p>
          {erro && <p role="alert" className="alerta">Não foi possível restaurar: {erro}</p>}
          <div className="acoes">
            <button onClick={confirmar}>Confirmar restauração</button>
            <button className="secundario" onClick={() => { setAberto(false); setErro(null); }}>Cancelar</button>
          </div>
        </div>
      )}
    </>
  );
}
