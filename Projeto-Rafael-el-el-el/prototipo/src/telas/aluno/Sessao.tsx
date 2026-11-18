import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { normalizarErro, useApp, useComando, useConsulta, type ErroComando } from '../../app/contexto';
import { BarraProgresso, Consulta, EtiquetaDificuldade, MensagemErro, Vazio } from '../../componentes/comuns';
import type { AlvoMatricula } from '../../dados/comandos-estudo';
import type { AtividadeApresentada, ResultadoResposta } from '../../dados/contratos-consultas-academicas';
import { caminhoTurma, useAlvoDaRota } from './rota';

export function Sessao() {
  const alvo = useAlvoDaRota();
  const { disciplinaId, turmaId } = useParams();
  const chave = `${disciplinaId}/${turmaId}`;
  const autorizado = useRef<{ chave: string; alvo: AlvoMatricula } | null>(null);
  if (alvo.situacao === 'ok') autorizado.current = { chave, alvo: alvo.dados };
  if (alvo.situacao === 'erro' || autorizado.current?.chave !== chave) return <Consulta estado={alvo}>{() => null}</Consulta>;
  // Preserva o estado local enquanto reautoriza, mas não exibe o retrato antigo durante a leitura.
  return <SessaoDaMatricula key={chave} alvo={autorizado.current.alvo} suspensa={alvo.situacao !== 'ok'} />;
}

/**
 * A atividade e o feedback ficam neste estado local: o comando invalida a consulta da trilha, mas a
 * questão respondida permanece na tela até o aluno pedir a próxima.
 */
function SessaoDaMatricula({ alvo, suspensa }: { alvo: AlvoMatricula; suspensa: boolean }) {
  const { repo } = useApp();
  const trilha = useConsulta((r) => r.consultarTrilha(alvo), [alvo.matriculaId]);
  const [atividade, setAtividade] = useState<{ valor: AtividadeApresentada | null } | null>(null);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [resultado, setResultado] = useState<ResultadoResposta | null>(null);
  const { rodar, erro, ocupado } = useComando();
  const envioBloqueado = useRef(false);
  const avancandoRef = useRef(false);
  const [avancando, setAvancando] = useState(false);
  const [erroAvanco, setErroAvanco] = useState<ErroComando | null>(null);
  const [avancos, setAvancos] = useState(0);
  const enunciado = useRef<HTMLHeadingElement>(null);
  const base = caminhoTurma(alvo);

  useEffect(() => {
    if (trilha.situacao === 'ok' && atividade === null && resultado === null) setAtividade({ valor: trilha.dados.proxima });
  }, [trilha, atividade, resultado]);
  useEffect(() => {
    if (avancos > 0 && atividade?.valor && !resultado && !suspensa && trilha.situacao === 'ok') enunciado.current?.focus();
  }, [avancos, atividade, resultado, suspensa, trilha.situacao]);

  const voltar = <p><Link to={base}>← Voltar à trilha</Link></p>;
  if (suspensa || trilha.situacao === 'carregando' || avancando) return <p className="carregando" role="status">Carregando…</p>;
  if (trilha.situacao === 'erro') return <Consulta estado={trilha}>{() => null}</Consulta>;
  if (erroAvanco && ['ACESSO_NEGADO', 'SESSAO_INVALIDA', 'SEM_SESSAO'].includes(erroAvanco.codigo)) return <Consulta estado={{ situacao: 'erro', erro: erroAvanco }}>{() => null}</Consulta>;
  if (!atividade) return <p className="carregando">Carregando…</p>;

  if (!atividade.valor) {
    return <><h1>Sessão de estudo</h1>{voltar}<Vazio>{trilha.dados.trilha.concluido ? 'Você concluiu a trilha desta turma! 🎉' : 'Não há questões disponíveis no momento.'}</Vazio></>;
  }
  const q = atividade.valor;

  const responder = async () => {
    if (selecionada === null || envioBloqueado.current || resultado) return;
    envioBloqueado.current = true;
    const r = await rodar((repo) => repo.responderQuestao(alvo, { questaoId: q.questaoId, alternativa: selecionada }, trilha.revisao));
    if (r.ok) setResultado(r.valor);
    else envioBloqueado.current = false;
  };
  const proxima = async () => {
    if (avancandoRef.current || ocupado) return;
    avancandoRef.current = true; setAvancando(true); setErroAvanco(null);
    try {
      const atual = await repo.consultarTrilha(alvo);
      setAtividade({ valor: atual.dados.proxima }); setResultado(null); setSelecionada(null);
      envioBloqueado.current = false; setAvancos((n) => n + 1);
    } catch (e) { setErroAvanco(normalizarErro(e)); }
    finally { avancandoRef.current = false; setAvancando(false); }
  };
  const variacao = resultado ? resultado.variacao : 0;

  return (
    <>
      <h1>Sessão de estudo</h1>
      <div className="sessao-layout">
        <aside className="contexto-sessao" aria-label="Contexto da sessão">
          <p><strong>{trilha.dados.contexto.disciplina.nome}</strong></p>
          <p>Turma {trilha.dados.contexto.turma.codigo} · {trilha.dados.contexto.periodoLetivo.nome}</p>
          <BarraProgresso valor={trilha.dados.trilha.progresso} rotulo="Progresso da matrícula" />
          <Link to={base}>Ver trilha</Link>
        </aside>
        <div className="sessao-principal">
      <article className="cartao questao" aria-labelledby="enunciado">
        <p className="meta">Tópico: <strong>{q.topicoTitulo}</strong> · <EtiquetaDificuldade dificuldade={q.dificuldade} /></p>
        <h2 id="enunciado" tabIndex={-1} ref={enunciado}>{q.enunciado}</h2>
        <fieldset disabled={Boolean(resultado) || ocupado}>
          <legend className="sr-only">Alternativas</legend>
          {q.alternativas.map((alt, i) => {
            const classe = resultado ? (resultado.alternativaCorreta?.indice === i || (resultado.acertou && selecionada === i) ? 'correta' : i === selecionada ? 'errada' : '') : '';
            return (
              <label key={i} className={`alternativa ${classe} ${selecionada === i ? 'selecionada' : ''}`}>
                <input type="radio" name="alternativa" aria-label={alt} aria-describedby={selecionada === i || classe ? `estado-alt-${i}` : undefined} checked={selecionada === i} onChange={() => setSelecionada(i)} />
                <span>{alt}{(selecionada === i || classe) && <small id={`estado-alt-${i}`} className="estado-alternativa">{classe === 'correta' ? 'Alternativa correta' : classe === 'errada' ? 'Sua escolha incorreta' : 'Selecionada'}</small>}</span>
              </label>
            );
          })}
        </fieldset>
        <button onClick={responder} disabled={selecionada === null || ocupado || Boolean(resultado)}>Responder</button>
        <MensagemErro erro={erro} />
      </article>

      <div aria-live="polite" aria-atomic="true">
      {resultado && (
        <section className={`feedback ${resultado.acertou ? 'acerto' : 'erro'}`} aria-label="Resultado da resposta">
          <h2>{resultado.acertou ? '✔ Você acertou!' : '✘ Você errou.'}</h2>
          {resultado.alternativaCorreta && <p>Alternativa correta: <strong>{resultado.alternativaCorreta.texto}</strong></p>}
          <p><strong>Explicação:</strong> {resultado.explicacao}</p>
          <p>
            Domínio em {resultado.topicoTitulo}: {resultado.dominioAnterior} → <strong>{resultado.dominioAtual}</strong> ({variacao >= 0 ? '+' : ''}{variacao})
            {resultado.xpConcedido > 0 && <> · +{resultado.xpConcedido} XP</>}
          </p>
          {resultado.topicoDominado && (
            <p className="destaque">🎯 Você dominou <strong>{resultado.topicoTitulo}</strong>!{resultado.topicoDesbloqueado && <> Tópico desbloqueado: <strong>{resultado.topicoDesbloqueado}</strong>.</>}</p>
          )}
          {resultado.novasConquistas.map((c) => <p key={c.id} className="destaque">🏆 Conquista desbloqueada: <strong>{c.nome}</strong></p>)}
          {resultado.concluido && <p className="destaque">🎉 Trilha concluída nesta turma! Progresso: 100%.</p>}
          {resultado.sugerirRevisao && (
            <div className="revisao" role="note">
              <p>Você errou duas questões seguidas em <strong>{resultado.topicoTitulo}</strong>. Que tal revisar os materiais antes de continuar?</p>
              <Link className="botao secundario" to={`${base}/topicos/${q.topicoId}`}>Revisar materiais de {resultado.topicoTitulo}</Link>
            </div>
          )}
          <div className="acoes">
            {resultado.concluido ? <Link className="botao" to={base}>Ver trilha</Link>
              : <button disabled={avancando} onClick={proxima}>{resultado.sugerirRevisao ? 'Continuar mesmo assim' : 'Próxima questão'}</button>}
          </div>
        </section>
      )}
      </div>
      <MensagemErro erro={erroAvanco} />
        </div>
      </div>
    </>
  );
}
