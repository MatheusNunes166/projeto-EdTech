/**
 * Contexto da aplicação (design D2/D7): guarda somente a sessão, as funções e o estado de inicialização.
 * Cada tela obtém sua própria consulta autorizada; o documento completo nunca é distribuído. Trocar de
 * pessoa, executar um comando ou receber um evento `storage` invalida as consultas e nada do retrato
 * anterior é exibido enquanto a nova consulta carrega.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  criarRepositorioLocal, inicializarDemonstracao, inspecionarArmazenamento, restaurarDemonstracao,
  substituirDadosPorDemonstracao, CHAVES_ARMAZENAMENTO, type ArmazenamentoEscrita, type EstadoArmazenamento,
  type ResultadoSubstituicao,
} from '../dados/armazenamento-academico';
import type { ConsultaAcademica } from '../dados/contratos-consultas-academicas';
import { ErroRepositorioAcademico } from '../dados/repositorio-academico';
import type { RepositorioApp } from '../dados/repositorio-app';
import type { Usuario } from '../dominio/tipos';

export interface ErroComando { codigo: string; mensagem: string; detalhes: Record<string, string> }

export function normalizarErro(e: unknown): ErroComando {
  if (e instanceof ErroRepositorioAcademico) return { codigo: e.codigo, mensagem: e.message, detalhes: { ...(e.detalhes ?? {}) } };
  return { codigo: 'ERRO', mensagem: e instanceof Error ? e.message : 'Operação não concluída.', detalhes: {} };
}

type Fase =
  | { fase: 'verificando' }
  | { fase: 'aviso'; estado: EstadoArmazenamento }
  | { fase: 'erro'; mensagem: string }
  | { fase: 'pronta' };

interface ValorApp {
  repo: RepositorioApp;
  usuario: Usuario | null;
  /** Muda a cada comando, troca de sessão ou evento externo: dispara a releitura das consultas. */
  versao: number;
  /** Muda quando outra aba altera os dados: o retrato exibido é descartado de imediato. */
  epoca: number;
  /** Executa um comando/ação e invalida as consultas; propaga o erro sem mostrar sucesso. */
  executar: <T>(op: (repo: RepositorioApp) => Promise<T>) => Promise<T>;
  /** Restauração informada: `false` cancela sem efeitos; `true` substitui, encerra a sessão e invalida. */
  restaurar: (confirmado: boolean) => Promise<ResultadoSubstituicao>;
}

const ContextoApp = createContext<ValorApp | null>(null);

export function ProvedorApp({ armazenamento, children }: { armazenamento: ArmazenamentoEscrita; children: ReactNode }) {
  const repo = useMemo(() => criarRepositorioLocal(armazenamento), [armazenamento]);
  const [fase, setFase] = useState<Fase>({ fase: 'verificando' });
  const [sessao, setSessao] = useState<{ pessoa: Usuario | null } | null>(null);
  const [versao, setVersao] = useState(0);
  const [epoca, setEpoca] = useState(0);

  const lerSessao = useCallback(async (): Promise<Usuario | null> => {
    try { return (await repo.obterSessao()) as Usuario | null; } catch { return null; }
  }, [repo]);

  /** Relê a sessão e invalida as consultas em um único lote, para a interface nunca ver um meio-termo. */
  const atualizarSessao = useCallback(async () => {
    const pessoa = await lerSessao();
    setSessao({ pessoa });
    setVersao((v) => v + 1);
  }, [lerSessao]);

  const verificar = useCallback(() => {
    const estado = inspecionarArmazenamento(armazenamento);
    if (estado.situacao === 'compativel') return setFase({ fase: 'pronta' });
    if (estado.situacao === 'ausente') {
      try { inicializarDemonstracao(armazenamento); setFase({ fase: 'pronta' }); }
      catch (e) { setFase({ fase: 'erro', mensagem: normalizarErro(e).mensagem }); }
      return;
    }
    setFase({ fase: 'aviso', estado });
  }, [armazenamento]);

  useEffect(verificar, [verificar]);
  useEffect(() => { if (fase.fase === 'pronta') void atualizarSessao(); }, [fase.fase, atualizarSessao]);

  // Outra aba alterou os dados: o retrato atual é descartado de imediato e a sessão é relida.
  useEffect(() => {
    const aoMudar = (e: StorageEvent) => {
      if (e.key !== null && !e.key.startsWith('trilha-adaptativa:academico:')) return;
      setEpoca((v) => v + 1);
      setVersao((v) => v + 1);
      void atualizarSessao();
    };
    window.addEventListener('storage', aoMudar);
    return () => window.removeEventListener('storage', aoMudar);
  }, [atualizarSessao]);

  const executar = useCallback(async <T,>(op: (r: RepositorioApp) => Promise<T>): Promise<T> => {
    try { return await op(repo); } finally { await atualizarSessao(); }
  }, [repo, atualizarSessao]);

  const restaurar = useCallback(async (confirmado: boolean) => {
    if (confirmado !== true) return { status: 'cancelado' as const };
    const estado = inspecionarArmazenamento(armazenamento).situacao;
    const resultado = estado === 'legado' || estado === 'incompativel'
      ? substituirDadosPorDemonstracao(armazenamento, true) : restaurarDemonstracao(armazenamento, true);
    if (resultado.status === 'concluido') { setFase({ fase: 'pronta' }); await atualizarSessao(); }
    return resultado;
  }, [armazenamento, atualizarSessao]);

  const valor = useMemo<ValorApp | null>(() => (sessao
    ? { repo, usuario: sessao.pessoa, versao, epoca, executar, restaurar } : null), [repo, sessao, versao, epoca, executar, restaurar]);

  if (fase.fase === 'verificando') return <p className="carregando">Carregando…</p>;
  if (fase.fase === 'erro') return <main className="entrada"><p role="alert" className="alerta">{fase.mensagem}</p></main>;
  if (fase.fase === 'aviso') return <AvisoInicial estado={fase.estado} aoConfirmar={() => restaurar(true)} />;
  if (!valor) return <p className="carregando">Carregando…</p>;
  return <ContextoApp.Provider value={valor}>{children}</ContextoApp.Provider>;
}

/**
 * Aviso exibido ANTES de qualquer substituição de dados locais. Cancelar não altera chaves nem abre
 * sessão; falha na gravação mostra o erro, nunca sucesso.
 */
function AvisoInicial({ estado, aoConfirmar }: { estado: EstadoArmazenamento; aoConfirmar: () => Promise<ResultadoSubstituicao> }) {
  const [cancelado, setCancelado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const motivo = estado.situacao === 'legado' ? 'Foram encontrados dados da versão anterior da demonstração.' : 'Os dados locais são incompatíveis com esta versão.';
  const confirmar = async () => {
    setErro(null);
    try { await aoConfirmar(); } catch (e) { setErro(normalizarErro(e).mensagem); }
  };
  return (
    <main className="entrada">
      <h1>Trilha Adaptativa</h1>
      <section className="cartao" role="alertdialog" aria-labelledby="aviso-titulo" aria-describedby="aviso-texto">
        <h2 id="aviso-titulo">Substituir os dados locais de demonstração?</h2>
        <p id="aviso-texto">
          {motivo} Ao continuar, o histórico fictício atual <strong>será apagado/substituído</strong> por uma demonstração nova com graduações,
          disciplinas e turmas; ele <strong>não será migrado</strong>. Os dados antigos permanecem no navegador apenas como cópia técnica de recuperação.
        </p>
        {cancelado && <p role="status">Nenhuma alteração foi feita. Para usar o protótipo, confirme a substituição.</p>}
        {erro && <p role="alert" className="alerta">Não foi possível substituir os dados: {erro}</p>}
        <div className="acoes">
          <button onClick={confirmar}>Substituir pela demonstração nova</button>
          <button className="secundario" onClick={() => setCancelado(true)}>Cancelar</button>
        </div>
      </section>
    </main>
  );
}

export function useApp(): ValorApp {
  const valor = useContext(ContextoApp);
  if (!valor) throw new Error('useApp fora do ProvedorApp');
  return valor;
}

/** Pessoa da sessão; só deve ser usada dentro de rotas protegidas. */
export function useUsuario(): Usuario {
  const { usuario } = useApp();
  if (!usuario) throw new Error('Nenhuma pessoa na sessão');
  return usuario;
}

export type EstadoConsulta<T> =
  | { situacao: 'carregando' }
  | { situacao: 'ok'; dados: T; revisao: number }
  | { situacao: 'erro'; erro: ErroComando };

/**
 * Consulta autorizada de uma tela. Ao trocar de pessoa, mudar os parâmetros ou receber um evento externo,
 * o resultado anterior deixa de ser exibido imediatamente (volta a 'carregando'). Após um comando da
 * própria tela, a consulta é relida mantendo o último resultado até o novo chegar.
 */
export function useConsulta<T>(
  consultar: (repo: RepositorioApp) => Promise<ConsultaAcademica<T>>, deps: readonly unknown[] = [],
): EstadoConsulta<T> {
  const { repo, usuario, versao, epoca } = useApp();
  const chave = JSON.stringify([usuario?.id ?? null, epoca, ...deps]);
  const [resultado, setResultado] = useState<{ chave: string; estado: EstadoConsulta<T> } | null>(null);
  const ref = useRef(consultar);
  ref.current = consultar;
  useEffect(() => {
    let ativo = true;
    ref.current(repo).then(
      (r) => { if (ativo) setResultado({ chave, estado: { situacao: 'ok', dados: r.dados, revisao: r.revisao } }); },
      (e) => { if (ativo) setResultado({ chave, estado: { situacao: 'erro', erro: normalizarErro(e) } }); },
    );
    return () => { ativo = false; };
  }, [repo, chave, versao]);
  return resultado && resultado.chave === chave ? resultado.estado : { situacao: 'carregando' };
}

/** Atalho para comandos de formulário: guarda o último erro (ou null) e nunca sinaliza sucesso em falha. */
export function useComando() {
  const { executar } = useApp();
  const [erro, setErro] = useState<ErroComando | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const rodar = useCallback(async <T,>(op: (r: RepositorioApp) => Promise<T>): Promise<{ ok: true; valor: T } | { ok: false }> => {
    setErro(null); setOcupado(true);
    try { return { ok: true as const, valor: await executar(op) }; }
    catch (e) { setErro(normalizarErro(e)); return { ok: false as const }; }
    finally { setOcupado(false); }
  }, [executar]);
  return { rodar, erro, ocupado, limpar: () => setErro(null) };
}

export { CHAVES_ARMAZENAMENTO };
