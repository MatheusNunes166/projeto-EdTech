import { useState, type ReactNode } from 'react';
import { useSaidaDoEditor } from '../app/rascunho';
import { Confirmacao } from '../componentes/Confirmacao';
import { Expansor } from '../componentes/Expansor';
import { useNavigate } from 'react-router-dom';
import { normalizarErro, useApp } from '../app/contexto';

/**
 * Restaurar a demonstração exige aviso prévio: cancelar mantém alterações e a pessoa atual; confirmar
 * descarta o histórico fictício e encerra a sessão; falha de gravação mostra o erro, nunca sucesso.
 */
export function Restauracao({ rotulo = 'Restaurar dados de demonstração' }: { rotulo?: string }) {
  const { restaurar } = useApp();
  const protecao = useSaidaDoEditor();
  const navegar = useNavigate();
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const confirmar = async () => {
    if (ocupado) return;
    setErro(null); setOcupado(true);
    try {
      await restaurar(true);
      protecao.liberarSaida();
      setAberto(false);
      navegar('/', { replace: true });
    } catch (e) {
      setErro(normalizarErro(e).mensagem);
    } finally { setOcupado(false); }
  };

  return (
    <>
      <button className="secundario" onClick={() => setAberto(true)}>{rotulo}</button>
      {aberto && (
        <Confirmacao titulo="Restaurar a demonstração?" acao="Confirmar restauração" ocupado={ocupado}
          aoConfirmar={confirmar} aoCancelar={() => { setAberto(false); setErro(null); }}>
          <p>As alterações atuais e o histórico fictício <strong>serão apagados</strong> e a demonstração inicial será recuperada; a sessão atual será encerrada.</p>
          {protecao.disciplina && <p>As alterações não salvas de {protecao.disciplina} também serão descartadas.</p>}
          {erro && <p role="alert" className="alerta">Não foi possível restaurar: {erro}</p>}
        </Confirmacao>
      )}
    </>
  );
}

export function Demonstracao({ children }: { children?: ReactNode }) {
  return <Expansor classe="demonstracao" rotulo="Demonstração"><div className="conteudo-demo">{children}<Restauracao /></div></Expansor>;
}
