import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useComando, useConsulta } from '../../app/contexto';
import { Consulta, EtiquetaDificuldade, MensagemErro, Vazio } from '../../componentes/comuns';
import type { AlvoMatricula } from '../../dados/comandos-estudo';
import type { AtividadeApresentada, ResultadoResposta } from '../../dados/contratos-consultas-academicas';
import { caminhoTurma, useAlvoDaRota } from './rota';

export function Sessao() {
  const alvo = useAlvoDaRota();
  return <Consulta estado={alvo}>{(a) => <SessaoDaMatricula alvo={a} />}</Consulta>;
}

/**
 * A atividade e o feedback ficam neste estado local: o comando invalida a consulta da trilha, mas a
 * questão respondida permanece na tela até o aluno pedir a próxima.
 */
function SessaoDaMatricula({ alvo }: { alvo: AlvoMatricula }) {
  const trilha = useConsulta((r) => r.consultarTrilha(alvo), [alvo.matriculaId]);
  const [atividade, setAtividade] = useState<{ valor: AtividadeApresentada | null } | null>(null);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [resultado, setResultado] = useState<ResultadoResposta | null>(null);
  const { rodar, erro } = useComando();
  const base = caminhoTurma(alvo);

  useEffect(() => {
    if (trilha.situacao === 'ok' && atividade === null && resultado === null) setAtividade({ valor: trilha.dados.proxima });
  }, [trilha, atividade, resultado]);

  const voltar = <p><Link to={base}>← Voltar à trilha</Link></p>;
  if (trilha.situacao === 'erro') return <Consulta estado={trilha}>{() => null}</Consulta>;
  if (!atividade) return <p className="carregando">Carregando…</p>;

  if (!atividade.valor) {
    return <>{voltar}<Vazio>{trilha.situacao === 'ok' && trilha.dados.trilha.concluido ? 'Você concluiu a trilha desta turma! 🎉' : 'Não há questões disponíveis no momento.'}</Vazio></>;
  }
  const q = atividade.valor;

  const responder = async () => {
    if (selecionada === null || trilha.situacao !== 'ok') return;
    const r = await rodar((repo) => repo.responderQuestao(alvo, { questaoId: q.questaoId, alternativa: selecionada }, trilha.revisao));
    if (r.ok) setResultado(r.valor);
  };
  const proxima = () => { setResultado(null); setSelecionada(null); setAtividade(null); };
  const variacao = resultado ? resultado.variacao : 0;

  return (
    <>
      {voltar}
      <article className="cartao questao" aria-labelledby="enunciado">
        <p className="meta">Tópico: <strong>{q.topicoTitulo}</strong> · <EtiquetaDificuldade dificuldade={q.dificuldade} /></p>
        <h2 id="enunciado">{q.enunciado}</h2>
        <fieldset disabled={Boolean(resultado)}>
          <legend className="sr-only">Alternativas</legend>
          {q.alternativas.map((alt, i) => {
            const classe = resultado ? (resultado.alternativaCorreta?.indice === i || (resultado.acertou && selecionada === i) ? 'correta' : i === selecionada ? 'errada' : '') : '';
            return (
              <label key={i} className={`alternativa ${classe}`}>
                <input type="radio" name="alternativa" checked={selecionada === i} onChange={() => setSelecionada(i)} />
                {alt}
              </label>
            );
          })}
        </fieldset>
        {!resultado && <button onClick={responder} disabled={selecionada === null}>Responder</button>}
        <MensagemErro erro={erro} />
      </article>

      {resultado && (
        <section className={`feedback ${resultado.acertou ? 'acerto' : 'erro'}`} aria-live="polite">
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
              : <button onClick={proxima}>{resultado.sugerirRevisao ? 'Continuar mesmo assim' : 'Próxima questão'}</button>}
          </div>
        </section>
      )}
    </>
  );
}
